import type { UserData } from './auth.types';

export interface UserResponse {
  user: UserData;
}

export interface UpdateUserDto {
  name?: string;
  birthday?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface GenericMessageResponse {
  message: string;
}