import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format bytes to human readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format distance to now (simplified version)
export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'há poucos segundos' : 'poucos segundos';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? ' atrás' : '';
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' atrás' : '';
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    const suffix = options?.addSuffix ? ' atrás' : '';
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const suffix = options?.addSuffix ? ' atrás' : '';
    return `${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''}${suffix}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  const suffix = options?.addSuffix ? ' atrás' : '';
  return `${diffInYears} ano${diffInYears > 1 ? 's' : ''}${suffix}`;
}
