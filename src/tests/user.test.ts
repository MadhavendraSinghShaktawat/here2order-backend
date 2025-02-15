import request from 'supertest';
import app from '@/app';
import { setupTestDB, testRestaurantAdmin } from './helpers';

setupTestDB();

describe('User Routes', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create a restaurant admin
    await request(app)
      .post('/api/v1/auth/signup')
      .send(testRestaurantAdmin);

    // Login to get token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testRestaurantAdmin.email,
        password: testRestaurantAdmin.password
      });

    authToken = loginRes.body.data.token;
  });

  describe('GET /api/v1/users', () => {
    it('should get users with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get users without token', async () => {
      const res = await request(app)
        .get('/api/v1/users');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
}); 