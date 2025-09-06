// Mock database connection for development
// In production, this would be replaced with actual database connection
export const db = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([])
      })
    })
  })
};