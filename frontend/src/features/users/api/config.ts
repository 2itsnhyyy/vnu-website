export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    FORGOT_PASSWORD: 'auth/forgot-password',
    VERIFY_OTP: 'auth/verify',
    RESET_PASSWORD: 'auth/reset-password',
    
    // User endpoints
    GET_ME: 'users/me', 
    UPDATE_ME: 'users/me',
    CHANGE_PASSWORD: 'users/change-password',
    
    // Forum endpoints
    POSTS: 'posts',
    POST_DETAIL: (id: number) => `posts/${id}`,
    LIKE_POST: (id: number) => `posts/${id}/likes`,
    
    // Comment endpoints
    COMMENTS: (postId: number) => `posts/${postId}/comments`,
    LIKE_COMMENT: (commentId: number) => `comments/${commentId}/like`,
  }
}

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_DATA: 'userData',
  REFRESH_TOKEN: 'refreshToken'
}