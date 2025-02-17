export interface CreateMenuCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MenuCategoryResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategoryListResponse {
  categories: MenuCategoryResponse[];
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  sortOrder?: number;
}

export interface MenuItemResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  preparationTime?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemListResponse {
  items: MenuItemResponse[];
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  preparationTime?: number;
  sortOrder?: number;
}

export interface ToggleItemAvailabilityDto {
  isAvailable: boolean;
} 