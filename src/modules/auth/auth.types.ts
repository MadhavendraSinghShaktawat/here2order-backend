export interface SignupDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  restaurant: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    contact: {
      phone: string;
      email: string;
    };
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    restaurantId: string;
  };
  token: string;
}

export interface StaffLoginDto {
  email: string;
  password: string;
  inviteToken?: string;
}

export interface StaffRegisterDto {
  email: string;
  password: string;
  inviteToken: string;
  phone?: string;
}

export interface StaffAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'Staff';
    restaurantId: string;
    position: string;
  };
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  restaurantId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRLoginDto {
  tableId: string;
  deviceId: string;
}

export interface QRLoginResponse {
  user: {
    id: string;
    role: 'Customer';
    tableId: string;
    restaurantId: string;
  };
  token: string;
  table: {
    number: string;
    name: string;
  };
} 