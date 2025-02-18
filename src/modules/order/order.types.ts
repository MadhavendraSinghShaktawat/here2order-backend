export interface OrderItemDto {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderDto {
  tableId: string;
  items: OrderItemDto[];
  specialInstructions?: string;
}

export interface OrderItemResponse {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableId: string;
  customerId: string;
  items: OrderItemResponse[];
  status: string;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDetailsResponse {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableId: string;
  customerId: string;
  items: OrderItemResponse[];
  status: string;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetRestaurantOrdersQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface GetTableOrdersQuery {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface UpdateOrderStatusDto {
  status: OrderStatus;
} 