import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Table } from './table.model';
import { CreateTableDto, UpdateTableDto, TableResponse } from './table.types';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { NotFoundError } from '@/common/errors/not-found-error';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { QRCodeService } from '@/services/qr-code.service';

export class TableController {
  constructor() {
    this.createTable = this.createTable.bind(this);
    this.getTables = this.getTables.bind(this);
    this.getTable = this.getTable.bind(this);
    this.updateTable = this.updateTable.bind(this);
    this.deleteTable = this.deleteTable.bind(this);
  }

  public async createTable(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableNumber, name, capacity }: CreateTableDto = req.body;
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      // Check if table number already exists
      const existingTable = await Table.findOne({
        restaurantId: currentUser.restaurantId,
        tableNumber
      });

      if (existingTable) {
        throw new BadRequestError('Table number already exists');
      }

      // First create a temporary table object to get the ID
      const tempTable = new Table({
        restaurantId: currentUser.restaurantId,
        tableNumber,
        name,
        capacity,
        qrCodeUrl: 'pending' // Temporary value
      });

      // Generate and upload QR code
      const qrCodeUrl = await QRCodeService.generateAndUploadQRCode(
        currentUser.restaurantId.toString(),
        tempTable._id.toString(),
        tableNumber
      );

      // Update the table with the QR code URL and save
      tempTable.qrCodeUrl = qrCodeUrl;
      await tempTable.save();

      const response: TableResponse = {
        id: tempTable._id.toString(),
        tableNumber: tempTable.tableNumber,
        name: tempTable.name,
        capacity: tempTable.capacity,
        isActive: tempTable.isActive,
        qrCodeUrl: tempTable.qrCodeUrl,
        createdAt: tempTable.createdAt,
        updatedAt: tempTable.updatedAt
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTables(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      const tables = await Table.find({
        restaurantId: currentUser.restaurantId
      }).sort({ tableNumber: 1 });

      const response: TableResponse[] = tables.map(table => ({
        id: table._id.toString(),
        tableNumber: table.tableNumber,
        name: table.name,
        capacity: table.capacity,
        isActive: table.isActive,
        qrCodeUrl: table.qrCodeUrl,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      }));

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getTable(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid table ID');
      }

      const table = await Table.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId
      });

      if (!table) {
        throw new NotFoundError('Table not found');
      }

      const response: TableResponse = {
        id: table._id.toString(),
        tableNumber: table.tableNumber,
        name: table.name,
        capacity: table.capacity,
        isActive: table.isActive,
        qrCodeUrl: table.qrCodeUrl,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateTable(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTableDto = req.body;
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid table ID');
      }

      const table = await Table.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId
      });

      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Update fields
      if (updateData.name) table.name = updateData.name;
      if (typeof updateData.capacity === 'number') table.capacity = updateData.capacity;
      if (typeof updateData.isActive === 'boolean') table.isActive = updateData.isActive;

      await table.save();

      const response: TableResponse = {
        id: table._id.toString(),
        tableNumber: table.tableNumber,
        name: table.name,
        capacity: table.capacity,
        isActive: table.isActive,
        qrCodeUrl: table.qrCodeUrl,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteTable(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (!currentUser.restaurantId) {
        throw new ForbiddenError('Restaurant ID is required');
      }

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid table ID');
      }

      const table = await Table.findOne({
        _id: id,
        restaurantId: currentUser.restaurantId
      });

      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Delete QR code from storage
      await QRCodeService.deleteQRCode(
        currentUser.restaurantId.toString(),
        table.tableNumber
      );

      // Delete table
      await Table.deleteOne({ _id: id });

      res.status(200).json({
        status: 'success',
        data: {
          id: table._id.toString(),
          message: 'Table deleted successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 