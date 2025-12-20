import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG, STORAGE_KEYS } from './config'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    })
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error: AxiosError) => {
    console.error('Response error:', error)
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any
      
      switch (status) {
        case 401:
          localStorage.removeItem(STORAGE_KEYS.TOKEN)
          localStorage.removeItem(STORAGE_KEYS.USER_DATA)
          if (window.location.pathname !== '/users/login') {
            window.location.href = '/users/login'
          }
          break
        case 403:
          console.error('Forbidden - Bạn không có quyền truy cập')
          break
        case 404:
          console.error('Not found - Không tìm thấy tài nguyên')
          break
        case 500:
          console.error('Server error - Lỗi server')
          break
        default:
          console.error('Error:', data?.message || 'Có lỗi xảy ra')
      }
      
      return Promise.reject({
        status,
        message: data?.message || 'Có lỗi xảy ra',
        data: data,
      })
    } else if (error.request) {
      console.error('Network error - Không thể kết nối đến server')
      return Promise.reject({
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
      })
    } else {
      return Promise.reject({
        message: error.message || 'Có lỗi xảy ra',
      })
    }
  }
)

export default apiClient