export type UserRole = 'SuperAdmin' | 'Restaurant_Admin' | 'Staff' | 'Customer';

export interface CreateUserDto {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  restaurantId?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  restaurantId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
} 