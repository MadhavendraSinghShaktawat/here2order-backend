import { Express } from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { User } from '@/modules/user/user.model';
import { Restaurant } from '@/modules/restaurant/restaurant.model';
import { StaffInvite } from '@/modules/staff/staff.model';

export const clearDatabase = async (): Promise<void> => {
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await StaffInvite.deleteMany({});
};

export const setupTestDB = (): void => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await mongoose.connection.close();
  });
};

export const testRestaurantAdmin = {
  email: 'restaurant1@example.com',
  password: 'Password123!',
  name: 'John Doe',
  phone: '+1234567890',
  restaurant: {
    name: 'The Great Restaurant',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    contact: {
      phone: '+1234567890',
      email: 'contact@restaurant.com'
    }
  }
};

export const testStaffInvite = {
  email: 'staff@example.com',
  name: 'Staff Member',
  phone: '+1234567890',
  position: 'Waiter'
}; 