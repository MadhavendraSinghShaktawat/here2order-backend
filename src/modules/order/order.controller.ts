import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middlewares/types/auth.types';
import { BadRequestError } from '@/common/errors/bad-request-error';
import { ForbiddenError } from '@/common/errors/forbidden-error';
import { NotFoundError } from '@/common/errors/not-found-error';
import { Order } from './order.model';
import { MenuItem } from '../menu/menu-item.model';
import { Table } from '../table/table.model';
import { CreateOrderDto, OrderResponse, OrderDetailsResponse, GetRestaurantOrdersQuery, OrderListResponse, GetTableOrdersQuery, UpdateOrderStatusDto, OrderStatus } from './order.types';

export class OrderController {
  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderDetails = this.getOrderDetails.bind(this);
    this.getRestaurantOrders = this.getRestaurantOrders.bind(this);
    this.getTableOrders = this.getTableOrders.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
  }

  public async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableId, items, specialInstructions }: CreateOrderDto = req.body;
      const customerId = req.user._id;

      // Verify table exists and get restaurant ID
      const table = await Table.findById(tableId);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Get all menu items at once
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await MenuItem.find({
        _id: { $in: menuItemIds },
        restaurantId: table.restaurantId,
        isActive: true,
        isAvailable: true
      });

      // Validate all items exist and are available
      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestError('One or more menu items are invalid or unavailable');
      }

      // Calculate total amount and prepare order items
      const orderItems = items.map(item => {
        const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
        if (!menuItem) {
          throw new BadRequestError(`Menu item ${item.menuItemId} not found`);
        }
        return {
          menuItemId: menuItem._id,
          quantity: item.quantity,
          price: menuItem.price,
          notes: item.notes
        };
      });

      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create the order
      const order = await Order.create({
        restaurantId: table.restaurantId,
        tableId,
        customerId,
        items: orderItems,
        totalAmount,
        specialInstructions,
        status: 'Pending'
      });

      // Populate menu item details for response
      const populatedOrder = await Order.findById(order._id)
        .populate('items.menuItemId', 'name');

      if (!populatedOrder) {
        throw new Error('Order not found after creation');
      }

      const response: OrderResponse = {
        id: populatedOrder._id.toString(),
        orderNumber: populatedOrder.orderNumber,
        restaurantId: populatedOrder.restaurantId.toString(),
        tableId: populatedOrder.tableId.toString(),
        customerId: populatedOrder.customerId.toString(),
        items: populatedOrder.items.map(item => ({
          menuItemId: item.menuItemId.toString(),
          name: (item.menuItemId as any).name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        status: populatedOrder.status,
        totalAmount: populatedOrder.totalAmount,
        specialInstructions: populatedOrder.specialInstructions,
        createdAt: populatedOrder.createdAt,
        updatedAt: populatedOrder.updatedAt
      };

      res.status(201).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getOrderDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Find the order and populate menu item details
      const order = await Order.findById(id).populate('items.menuItemId', 'name');
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Check authorization
      if (userRole === 'Customer' && order.customerId.toString() !== userId.toString()) {
        throw new ForbiddenError('Not authorized to view this order');
      }

      if (['Staff', 'Restaurant_Admin'].includes(userRole) && 
          order.restaurantId.toString() !== req.user.restaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to view this order');
      }

      const response: OrderDetailsResponse = {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        restaurantId: order.restaurantId.toString(),
        tableId: order.tableId.toString(),
        customerId: order.customerId.toString(),
        items: order.items.map(item => ({
          menuItemId: item.menuItemId.toString(),
          name: (item.menuItemId as any).name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        status: order.status,
        totalAmount: order.totalAmount,
        specialInstructions: order.specialInstructions,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async getRestaurantOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query as GetRestaurantOrdersQuery;

      // Debug logging
      console.log('User restaurant:', req.user.restaurantId?.toString());
      console.log('Requested restaurant:', restaurantId);
      console.log('User role:', req.user.role);

      // Check authorization - modified to handle string comparison properly
      if (!req.user.restaurantId || req.user.restaurantId.toString() !== restaurantId) {
        throw new ForbiddenError('Not authorized to view orders from this restaurant');
      }

      // Build query
      const query: any = { restaurantId };
      
      if (status) {
        query.status = status;
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get total count
      const total = await Order.countDocuments(query);
      
      // Get orders
      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const response: OrderListResponse = {
        orders: orders.map(order => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId.toString(),
          tableId: order.tableId.toString(),
          customerId: order.customerId.toString(),
          items: order.items.map(item => ({
            menuItemId: item.menuItemId.toString(),
            name: (item.menuItemId as any).name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          })),
          status: order.status,
          totalAmount: order.totalAmount,
          specialInstructions: order.specialInstructions,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
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

  public async getTableOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tableId } = req.params;
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query as GetTableOrdersQuery;

      // Verify table exists and get restaurant ID
      const table = await Table.findById(tableId);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Check authorization
      if (['Staff', 'Restaurant_Admin'].includes(req.user.role) && 
          table.restaurantId.toString() !== req.user.restaurantId?.toString()) {
        throw new ForbiddenError('Not authorized to view orders from this table');
      }

      if (req.user.role === 'Customer' && (!req.user.tableId || req.user.tableId.toString() !== tableId)) {
        throw new ForbiddenError('Not authorized to view orders from this table');
      }

      // Build query
      const query: any = { tableId };
      
      if (status) {
        query.status = status;
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // Get total count
      const total = await Order.countDocuments(query);
      
      // Get orders
      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const response: OrderListResponse = {
        orders: orders.map(order => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId.toString(),
          tableId: order.tableId.toString(),
          customerId: order.customerId.toString(),
          items: order.items.map(item => ({
            menuItemId: item.menuItemId.toString(),
            name: (item.menuItemId as any).name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          })),
          status: order.status,
          totalAmount: order.totalAmount,
          specialInstructions: order.specialInstructions,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
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

  public async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const { status } = req.body as UpdateOrderStatusDto;
      const currentUser = req.user;

      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Check if user has permission to update this order
      if (!currentUser.restaurantId || order.restaurantId.toString() !== currentUser.restaurantId.toString()) {
        throw new ForbiddenError('Not authorized to update this order');
      }

      // Validate status transition
      this.validateStatusTransition(order.status, status);

      // Update the order status
      order.status = status;
      await order.save();

      // Populate menu item details for response
      const updatedOrder = await Order.findById(orderId)
        .populate('items.menuItemId', 'name');

      if (!updatedOrder) {
        throw new Error('Order not found after update');
      }

      const response: OrderResponse = {
        id: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        restaurantId: updatedOrder.restaurantId.toString(),
        tableId: updatedOrder.tableId.toString(),
        customerId: updatedOrder.customerId.toString(),
        items: updatedOrder.items.map(item => ({
          menuItemId: item.menuItemId.toString(),
          name: (item.menuItemId as any).name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        })),
        status: updatedOrder.status,
        totalAmount: updatedOrder.totalAmount,
        specialInstructions: updatedOrder.specialInstructions,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt
      };

      res.status(200).json({
        status: 'success',
        data: response
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId } = req.params;
      const currentUser = req.user;

      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Check if user has permission to delete this order
      if (!currentUser.restaurantId || order.restaurantId.toString() !== currentUser.restaurantId.toString()) {
        throw new ForbiddenError('Not authorized to delete this order');
      }

      // Only allow deletion of Pending orders
      if (order.status !== 'Pending') {
        throw new BadRequestError('Only pending orders can be deleted');
      }

      // Soft delete by updating status to Cancelled
      order.status = 'Cancelled';
      await order.save();

      res.status(200).json({
        status: 'success',
        data: {
          id: order._id.toString(),
          message: 'Order cancelled successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready', 'Cancelled'],
      'Ready': ['Delivered', 'Cancelled'],
      'Delivered': [],
      'Cancelled': []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestError(`Cannot transition order from ${currentStatus} to ${newStatus}`);
    }
  }
} 