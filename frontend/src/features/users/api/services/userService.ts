import apiClient from '../apiClient';
import { API_CONFIG, STORAGE_KEYS } from '../config';
import type { 
  UserResponse, 
  UpdateUserDto, 
  ChangePasswordDto, 
  GenericMessageResponse 
} from '../types/user.types';
import type { UserData, ApiError } from '../types/auth.types';

class UserService {
  /**
   * Lấy thông tin chi tiết của người dùng hiện tại (Profile)
   * Tương ứng endpoint GET /users/me ở Backend
   */
  async getMe(): Promise<UserData> {
    try {
      const response = await apiClient.get<UserResponse>(API_CONFIG.ENDPOINTS.GET_ME);
      
      const user = response.data.user;
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateMe(data: UpdateUserDto): Promise<UserResponse> {
    try {
      const response = await apiClient.patch<UserResponse>(API_CONFIG.ENDPOINTS.UPDATE_ME, data);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: ChangePasswordDto): Promise<GenericMessageResponse> {
    try {
      const response = await apiClient.post<GenericMessageResponse>(
        API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, 
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  private handleError(error: ApiError): Error {
    return new Error(error.message || 'Có lỗi xảy ra với dữ liệu người dùng');
  }
}

export const userService = new UserService();
export default userService;