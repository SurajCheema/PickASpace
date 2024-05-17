const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const db = require('../models');

describe('Admin Routes', function () {
  let adminToken;
  let admin;
  let sandbox;

  before(async function () {
    sandbox = sinon.createSandbox();
    await db.sequelize.sync({ force: true });

    // Create a fake admin user in the database
    admin = await db.User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@test.com',
      password: await bcrypt.hash('password', 10),
      role: 'admin'
    });

    adminToken = jwt.sign({ userId: admin.user_id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Stub the authentication middleware to always pass
    sandbox.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, { userId: admin.user_id, role: 'admin' });
    });
  });

  after(async function () {
    sandbox.restore();
    await db.sequelize.close();
  });

  describe('DELETE /api/admin/carparks/:carparkId', function () {
    let carPark;

    before(async function () {
      carPark = await db.CarPark.create({
        addressLine1: 'Nixon Court',
        city: 'Leicester',
        postcode: 'LE2 7TG',
        user_id: admin.user_id,
        pricing: { hourly: 1.5 } // Add pricing data
      });
    });

    it('should mark a car park as deleted', async function () {
      const res = await request(app)
        .delete(`/api/admin/carparks/${carPark.carpark_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Car park marked as deleted successfully by admin');
    });

    it('should return 404 if the car park is not found', async function () {
      const res = await request(app)
        .delete('/api/admin/carparks/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('Car park not found or already deleted');
    });
  });

  describe('DELETE /api/admin/carparks/:carparkId/force', function () {
    let carPark;

    before(async function () {
      carPark = await db.CarPark.create({
        addressLine1: 'Nixon Court',
        city: 'Leicester',
        postcode: 'LE2 7TG',
        user_id: admin.user_id,
        pricing: { hourly: 1.5 } // Add pricing data
      });
    });

    it('should force delete a car park', async function () {
      const res = await request(app)
        .delete(`/api/admin/carparks/${carPark.carpark_id}/force`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Car park deleted permanently');
    });

    it('should return 404 if the car park is not found', async function () {
      const res = await request(app)
        .delete('/api/admin/carparks/9999/force')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('Car park not found');
    });
  });

  describe('GET /api/admin/carparks', function () {
    it('should fetch all car parks', async function () {
      const res = await request(app)
        .get('/api/admin/carparks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /api/admin/carparks/:carparkId', function () {
    let carPark;
  
    before(async function () {
      carPark = await db.CarPark.create({
        addressLine1: 'University Road',
        city: 'Leicester',
        postcode: 'LE1 7RH',
        user_id: admin.user_id,
        pricing: { hourly: 2.0 }, // Add pricing data
        openTime: null, // Use null instead of invalid date string
        closeTime: null // Use null instead of invalid date string
      });
    });
  
    it('should update a car park', async function () {
      const res = await request(app)
        .put(`/api/admin/carparks/${carPark.carpark_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          addressLine1: 'Nixon Court',
          city: 'Leicester',
          postcode: 'LE2 7TG',
          pricing: { hourly: 1.5 }, // Include pricing in the update
          openTime: '09:00',
          closeTime: '21:00',
          bays: [] // Include the bays array in the request body
        });
  
      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('Car park updated successfully');
    });

    it('should return 404 if the car park is not found', async function () {
      const res = await request(app)
        .put('/api/admin/carparks/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          addressLine1: 'Nixon Court',
          city: 'Leicester',
          postcode: 'LE2 7TG',
          pricing: { hourly: 1.5 }, // Include pricing in the update
          openTime: '09:00',
          closeTime: '21:00'
        });

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('Car park not found');
    });
  });

  describe('GET /api/admin/users/:userId', function () {
    it('should fetch a specific user', async function () {
      const res = await request(app)
        .get(`/api/admin/users/${admin.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.email).to.equal('admin@test.com');
    });

    it('should return 404 if the user is not found', async function () {
      const res = await request(app)
        .get('/api/admin/users/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('User not found');
    });
  });

  describe('DELETE /api/admin/users/:userId', function () {
    let user;

    before(async function () {
      user = await db.User.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'testuser@test.com',
        password: await bcrypt.hash('password', 10)
      });
    });

    it('should soft delete a user', async function () {
      const res = await request(app)
        .delete(`/api/admin/users/${user.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('User marked as deleted successfully');
    });

    it('should return 404 if the user is not found', async function () {
      const res = await request(app)
        .delete('/api/admin/users/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('User not found or already deleted');
    });
  });

  describe('DELETE /api/admin/users/:userId/force', function () {
    let user;

    before(async function () {
      user = await db.User.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'testuser@test.com',
        password: await bcrypt.hash('password', 10)
      });
    });

    it('should force delete a user', async function () {
      const res = await request(app)
        .delete(`/api/admin/users/${user.user_id}/force`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal(`Successfully deleted user with ID ${user.user_id}`);
    });

    it('should return 404 if the user is not found', async function () {
      const res = await request(app)
        .delete('/api/admin/users/9999/force')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('User not found');
    });
  });

  describe('PUT /api/admin/users/:userId', function () {
    let user;

    before(async function () {
      user = await db.User.create({
        first_name: 'Test',
        last_name: 'User',
        email: 'testuser@test.com',
        password: await bcrypt.hash('password', 10),
        phone: '+441234567890',
        DOB: '1990-01-01'
      });
    });

    it('should update a user', async function () {
      const res = await request(app)
        .put(`/api/admin/users/${user.user_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'User',
          email: 'updateduser@test.com',
          phone: '+441234567890',
          DOB: '1990-01-01'
        });

      expect(res.statusCode).to.equal(200);
      expect(res.body.message).to.equal('User updated successfully by admin');
    });

    it('should return 404 if the user is not found', async function () {
      const res = await request(app)
        .put('/api/admin/users/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'User',
          email: 'updateduser@test.com',
          phone: '+441234567890',
          DOB: '1990-01-01'
        });

      expect(res.statusCode).to.equal(404);
      expect(res.body.error).to.equal('User not found');
    });
  });

  describe('GET /api/admin/users', function () {
    it('should fetch all users', async function () {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });
});