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