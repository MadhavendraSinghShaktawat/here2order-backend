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