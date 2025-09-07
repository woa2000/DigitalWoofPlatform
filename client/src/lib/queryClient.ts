import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const makeRequest = async (retryCount = 0): Promise<Response> => {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🌐 apiRequest - Making request:', {
      method,
      url: `http://localhost:5000${url}`,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      tokenPreview: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'No token',
      retryCount
    });
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Add authorization header if user is authenticated
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    console.log('🌐 apiRequest - Headers:', {
      hasAuth: !!headers["Authorization"],
      contentType: headers["Content-Type"]
    });

    const res = await fetch(`http://localhost:5000${url}`, {
      method,
      headers: data ? headers : { "Authorization": headers["Authorization"] || "" },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // If token expired and we have a session, try to refresh once
    if (res.status === 401 && session && retryCount === 0) {
      console.log('🔄 Token might be expired, trying to refresh...');
      
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (!error && newSession) {
        console.log('✅ Token refreshed, retrying request...');
        return makeRequest(1); // Retry once with new token
      }
    }
    
    console.log('🌐 apiRequest - Response:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });

    await throwIfResNotOk(res);
    return res;
  };

  return makeRequest();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const makeQuery = async (retryCount = 0) => {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      
      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`http://localhost:5000/${queryKey.join("/")}`, {
        credentials: "include",
        headers,
      });

      // If token expired and we have a session, try to refresh once
      if (res.status === 401 && session && retryCount === 0) {
        console.log('🔄 Query token might be expired, trying to refresh...');
        
        const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
        
        if (!error && newSession) {
          console.log('✅ Query token refreshed, retrying...');
          return makeQuery(1); // Retry once with new token
        }
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

    return makeQuery();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
