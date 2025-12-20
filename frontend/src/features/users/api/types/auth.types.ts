// User types
export interface UserData {
  user_id: number
  name: string
  avatar?: string
  email: string
  birthday: string
  role: number
}

// Login types
export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: UserData
}

// Register types
export interface RegisterDto {
  email: string
  password: string
  confirmPassword: string
  name: string
  birthday: string
}

export interface RegisterResponse {
  message: string
}

// Forgot Password types
export interface ForgotPasswordDto {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

// Verify OTP types
export interface VerifyOtpDto {
  email: string
  code: string
}

export interface VerifyOtpResponse {
  message: string
  resetToken: string
}

// Reset Password types
export interface ResetPasswordDto {
  password: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

// API Error type
export interface ApiError {
  status?: number
  message: string
  data?: any
}