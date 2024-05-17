const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const db = require('../models');

describe('User Endpoints', function () {
  before(async function () {
    await db.sequelize.sync({ force: true });
  });

  after(async function () {
    await db.sequelize.close();
  });

  describe('POST /create-user', function () {
    it('should create a new user', async function () {
      const res = await request(app)
        .post('/create-user')
        .send({
          car_registration: 'ABC123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          DOB: '1990-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'User created successfully');
      expect(res.body).to.have.property('userId');
    });

    it('should return an error if user already exists', async function () {
      const res = await request(app)
        .post('/create-user')
        .send({
          car_registration: 'ABC123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '1234567890',
          DOB: '1990-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'An account with this email already exists.');
    });
  });

  describe('POST /login', function () {
    it('should authenticate a user and return a token', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body).to.have.property('token');
    });

    it('should return an error for invalid credentials', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal('Authentication failed');
    });
  });
  
});