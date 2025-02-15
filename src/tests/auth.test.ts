import request from 'supertest';
import app from '../app';
import { setupTestDB, testRestaurantAdmin } from './helpers';

setupTestDB();

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new restaurant admin and restaurant', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(testRestaurantAdmin);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(testRestaurantAdmin.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should not allow duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/signup')
        .send(testRestaurantAdmin);

      // Duplicate registration attempt
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(testRestaurantAdmin);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/signup')
        .send(testRestaurantAdmin);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testRestaurantAdmin.email,
          password: testRestaurantAdmin.password
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testRestaurantAdmin.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
}); 