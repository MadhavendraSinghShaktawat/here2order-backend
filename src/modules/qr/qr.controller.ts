import { Request, Response, NextFunction } from 'express';
import { Table } from '../table/table.model';
import { Restaurant } from '../restaurant/restaurant.model';
import { ScanQRResponse } from './qr.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { NotFoundError } from '@/common/errors/not-found-error';
import { BusinessHour } from '../restaurant/restaurant.types';

export class QRController {
  constructor() {
    this.scanQRCode = this.scanQRCode.bind(this);
  }

  public async scanQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        throw new BadRequestError('QR code is required');
      }

      // Find table by QR code ID
      const table = await Table.findById(code);
      if (!table) {
        throw new NotFoundError('Invalid QR code');
      }

      // Get restaurant details
      const restaurant = await Restaurant.findById(table.restaurantId)
        .select('name address contact businessHours settings isActive');
      
      if (!restaurant) {
        throw new NotFoundError('Restaurant not found');
      }

      if (!restaurant.isActive) {
        throw new BadRequestError('Restaurant is currently not active');
      }

      // Check if restaurant is currently open
      const now = new Date();
      const today = now.toLocaleString('en-US', { weekday: 'long' }) as BusinessHour['day'];
      const currentHours = restaurant.businessHours.find(hours => hours.day === today);

      // Default to closed if no hours found or outside business hours
      const isOpen = currentHours ? 
        (!currentHours.isClosed && this.isTimeInRange(now, currentHours.open, currentHours.close)) : 
        false;

      const response: ScanQRResponse = {
        restaurant: {
          id: restaurant._id.toString(),
          name: restaurant.name,
          address: restaurant.address,
          contact: restaurant.contact,
          businessHours: restaurant.businessHours as BusinessHour[],
          settings: restaurant.settings,
          isCurrentlyOpen: isOpen
        },
        table: {
          id: table._id.toString(),
          number: table.tableNumber,
          name: table.name,
          capacity: table.capacity
        }
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  private isTimeInRange(now: Date, openTime: string, closeTime: string): boolean {
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const currentMinutes = currentHour * 60 + currentMinute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }
} 