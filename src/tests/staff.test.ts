import request from 'supertest';
import app from '@/app';
import { setupTestDB, testRestaurantAdmin, testStaffInvite } from './helpers';

setupTestDB();

describe('Staff Routes', () => {
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

  describe('POST /api/v1/staff/invite', () => {
    it('should create staff invitation with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/staff/invite')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStaffInvite);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(testStaffInvite.email);
    });

    it('should not allow duplicate staff invitations', async () => {
      // First invitation
      await request(app)
        .post('/api/v1/staff/invite')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStaffInvite);

      // Duplicate invitation attempt
      const res = await request(app)
        .post('/api/v1/staff/invite')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStaffInvite);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Staff member already invited');
    });
  });

  describe('GET /api/v1/staff', () => {
    beforeEach(async () => {
      // Create a staff invitation
      await request(app)
        .post('/api/v1/staff/invite')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStaffInvite);
    });

    it('should get staff list with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/staff')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not get staff list without token', async () => {
      const res = await request(app)
        .get('/api/v1/staff');

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
}); 