import apiClient from '../apiClient'
import { API_CONFIG, STORAGE_KEYS } from '../config'
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  UserData,
  ApiError,
} from '../types/auth.types'

class AuthService {
  /**
   * Đăng nhập người dùng
   * @param loginDto - Email và password
   * @returns Promise với token và thông tin user
   */
async login(loginDto: LoginDto): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.LOGIN,
      loginDto
    )

    const { token } = response.data

    if (!token) {
      throw new Error('Dữ liệu đăng nhập không hợp lệ từ server')
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN, token)

    return response.data
  } catch (error) {
    const apiError = error as ApiError
    throw this.handleAuthError(apiError)
  }
}

  /**
   * Đăng ký người dùng mới
   * @param registerDto - Thông tin đăng ký
   * @returns Promise với message thành công
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        API_CONFIG.ENDPOINTS.REGISTER,
        registerDto
      )
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw this.handleAuthError(apiError)
    }
  }

  /**
   * Yêu cầu reset mật khẩu (gửi OTP)
   * @param forgotPasswordDto - Email của user
   * @returns Promise với message thành công
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>(
        API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
        forgotPasswordDto
      )
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw this.handleAuthError(apiError)
    }
  }

  /**
   * Xác thực OTP
   * @param verifyOtpDto - Email và mã OTP
   * @returns Promise với resetToken
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    try {
      const response = await apiClient.post<VerifyOtpResponse>(
        API_CONFIG.ENDPOINTS.VERIFY_OTP,
        verifyOtpDto
      )
      
      if (response.data.resetToken) {
        localStorage.setItem('resetToken', response.data.resetToken)
      }
      
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      throw this.handleAuthError(apiError)
    }
  }

  /**
   * Reset mật khẩu mới
   * @param resetPasswordDto - Mật khẩu mới
   * @returns Promise với message thành công
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<ResetPasswordResponse> {
    try {
      const resetToken = localStorage.getItem('resetToken')
      
      if (!resetToken) {
        throw new Error('Reset token không tồn tại. Vui lòng thực hiện lại quy trình.')
      }

      const currentToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      localStorage.setItem(STORAGE_KEYS.TOKEN, resetToken)

      const response = await apiClient.post<ResetPasswordResponse>(
        API_CONFIG.ENDPOINTS.RESET_PASSWORD,
        resetPasswordDto
      )

      localStorage.removeItem('resetToken')
      if (currentToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, currentToken)
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
      }

      return response.data
    } catch (error) {
      const apiError = error as ApiError
      localStorage.removeItem('resetToken')
      throw this.handleAuthError(apiError)
    }
  }

  /**
   * Đăng xuất người dùng
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    localStorage.removeItem('resetToken')
    
    console.log('User logged out successfully')
  }

  /**
   * Lấy thông tin user từ localStorage
   * @returns UserData hoặc null
   */
  getCurrentUser(): UserData | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
      if (!userData) return null

      const user: UserData = JSON.parse(userData)
      
      if (user.role !== 0) {
        this.logout()
        return null
      }

      return user
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.logout()
      return null
    }
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   * @returns boolean
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  /**
   * Lấy token hiện tại
   * @returns string hoặc null
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * Lưu thông tin user và token
   * @param user - Thông tin user
   * @param token - JWT token
   */
  private saveUserData(user: UserData, token: string): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    console.log('User data saved to localStorage:', user.email)
  }

  /**
   * Xử lý các loại error từ API
   * @param error - ApiError
   * @returns Error với message phù hợp
   */
  private handleAuthError(error: ApiError): Error {
    console.error('Auth error:', error)

    if (error.message) {
      const errorMessages: { [key: string]: string } = {
        'Email already exists': 'Email đã tồn tại',
        'Email is not exists': 'Email không tồn tại',
        'Password is incorrect': 'Mật khẩu không đúng',
        'Password and confirm password do not match':
          'Mật khẩu và xác nhận mật khẩu không khớp',
        'Invalid OTP': 'Mã OTP không hợp lệ',
        'OTP has expired': 'Mã OTP đã hết hạn',
        'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.':
          'Không thể kết nối đến server. Vui lòng kiểm tra server hoặc kết nối mạng.',
      }

      const vietnameseMessage =
        errorMessages[error.message] ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      return new Error(vietnameseMessage)
    }

    switch (error.status) {
      case 400:
        return new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.')
      case 401:
        return new Error('Email hoặc mật khẩu không đúng.')
      case 403:
        return new Error('Bạn không có quyền truy cập vào hệ thống này.')
      case 404:
        return new Error('Không tìm thấy tài nguyên.')
      case 500:
        return new Error('Lỗi server, vui lòng thử lại sau hoặc liên hệ hỗ trợ.')
      default:
        return new Error('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.')
    }
  }
}

export const authService = new AuthService()
export default authService