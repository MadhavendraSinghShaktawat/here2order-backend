export interface CreateTableDto {
  tableNumber: string;
  name: string;
  capacity: number;
}

export interface TableResponse {
  id: string;
  tableNumber: string;
  name: string;
  capacity: number;
  isActive: boolean;
  qrCodeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTableDto {
  name?: string;
  capacity?: number;
  isActive?: boolean;
} 