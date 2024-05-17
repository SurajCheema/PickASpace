const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../server');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Client } = require('@googlemaps/google-maps-services-js');

require('./testSetup'); // Include the common setup and teardown

describe('User Endpoints', function () {
  describe('POST /create-user', function () {
    it('should create a new user', async function () {
      const res = await request(app)
        .post('/create-user')
        .send({
          car_registration: 'AA19AAA',
          first_name: 'Jack',
          last_name: 'Doe',
          email: 'jack@example.com',
          password: 'Pass123!',
          phone: '+441234567890',
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
          car_registration: 'AA19AAA',
          first_name: 'Jack',
          last_name: 'Doe',
          email: 'jack@example.com',
          password: 'Pass123!',
          phone: '+441234567890',
          DOB: '1990-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'An account with this email already exists.');
    });

    it('should return an error if required fields are missing', async function () {
      const res = await request(app)
        .post('/create-user')
        .send({
          car_registration: 'AA19AAA',
          first_name: 'Jack',
          last_name: 'Doe',
          email: null,
          password: 'Pass123!',
          phone: '+441234567890',
          DOB: '1990-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(500);
    });

    it('should return an error if age is less than 16', async function () {
      const res = await request(app)
        .post('/create-user')
        .send({
          car_registration: 'AA19AAA',
          first_name: 'Jack',
          last_name: 'Doe',
          email: 'jack.doe@example.com',
          password: 'Pass123!',
          phone: '+441234567890',
          DOB: '2010-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'You must be at least 16 years old to register.');
    });
  });

  describe('POST /login', function () {
    it('should authenticate a user and return a token', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'jack@example.com',
          password: 'Pass123!'
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'Login successful');
      expect(res.body).to.have.property('token');
    });

    it('should return an error for invalid email', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'invalid@example.com',
          password: 'Pass123!'
        });
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal('Authentication failed');
    });

    it('should return an error for invalid password', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'jack@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal('Authentication failed');
    });

    it('should return an error for missing email or password', async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'jack@example.com'
        });
      expect(res.statusCode).to.equal(500);
    });
  });

  describe('POST /request-password-reset', function () {
    it('should send a password reset email', async function () {
      const res = await request(app)
        .post('/request-password-reset')
        .send({
          email: 'jack@example.com'
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'An e-mail has been sent to jack@example.com with further instructions.');
    });

    it('should return an error for non-existing email', async function () {
      const res = await request(app)
        .post('/request-password-reset')
        .send({
          email: 'nonexisting@example.com'
        });
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property('error', 'No account with that email found.');
    });
  });

  describe('POST /update-password', function () {
    let resetToken;

    before(async function () {
      const user = await db.User.findOne({ where: { email: 'jack@example.com' } });
      resetToken = user.reset_password_token;
    });

    it('should update the password', async function () {
      const res = await request(app)
        .post('/update-password')
        .send({
          token: resetToken,
          newPassword: 'NewPass123!'
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'Your password has been updated successfully.');
    });

    it('should return an error for invalid or expired token', async function () {
      const res = await request(app)
        .post('/update-password')
        .send({
          token: 'invalidtoken',
          newPassword: 'NewPass123!'
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('error', 'Password reset token is invalid or has expired.');
    });
  });

  describe('GET /user-details', function () {
    let token;

    before(async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'jack@example.com',
          password: 'NewPass123!'
        });
      token = res.body.token;
    });

    it('should fetch user details', async function () {
      const res = await request(app)
        .get('/user-details')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('email', 'jack@example.com');
    });

    it('should return an error for missing token', async function () {
      const res = await request(app)
        .get('/user-details');
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal('Token is required');
    });

    it('should return an error for invalid token', async function () {
      const res = await request(app)
        .get('/user-details')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).to.equal(403);
      expect(res.text).to.equal('Invalid Token');
    });
  });

  describe('POST /api/update-user', function () {
    let token;

    before(async function () {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'jack@example.com',
          password: 'NewPass123!'
        });
      token = res.body.token;
    });

    it('should update user details', async function () {
      const res = await request(app)
        .post('/api/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Updated',
          last_name: 'User',
          email: 'updated@example.com',
          phone: '+441234567890',
          DOB: '1990-01-01'
        });
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('message', 'User updated successfully');
    });

    it('should return an error for missing required fields', async function () {
      const res = await request(app)
        .post('/api/update-user')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Updated',
          last_name: 'User',
          email: 'updated@example.com'
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'All fields except password must be filled.');
    });
  });

  describe('User Car Park Endpoints', function () {
    let token;
    let user;

    before(async function () {
      sinon.stub(db.sequelize, 'sync').resolves();
      sinon.stub(db.User, 'findOne').resolves({
        user_id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        role: 'user',
        stripe_account_id: 'acct_1PEfNpCYeKEb7cFa'
      });
      sinon.stub(db.User, 'create').resolves({
        user_id: 1,
        email: 'test@example.com'
      });
      sinon.stub(db.User, 'update').resolves([1]);
      sinon.stub(db.User, 'findByPk').resolves({
        user_id: 1,
        email: 'test@example.com',
        stripe_account_id: 'acct_1PEfNpCYeKEb7cFa'
      });
      sinon.stub(db.CarPark, 'create').resolves({
        carpark_id: 1
      });
      const carParkMock = {
        carpark_id: 1,
        user_id: 1,
        addressLine1: 'University Road',
        city: 'Leicester',
        postcode: 'LE2 7TG',
        openTime: new Date(),
        closeTime: new Date(),
        bays: [],
        save: sinon.stub().resolves(),
        update: sinon.stub().resolves([1])
      };
      sinon.stub(db.CarPark, 'findOne').resolves(carParkMock);
      sinon.stub(db.CarPark, 'findAll').resolves([{
        carpark_id: 1,
        addressLine1: 'University Road',
        city: 'Leicester',
        postcode: 'LE2 7TG'
      }]);
      sinon.stub(db.Bay, 'create').resolves();
      sinon.stub(db.CarParkLog, 'create').resolves({
        log_id: 1,
        bay_id: 1,
        carpark_id: 1,
        user_id: 1,
        startTime: new Date(),
        endTime: new Date(),
        cost: 10
      });
      sinon.stub(db.Payment, 'create').resolves({
        payment_id: 1
      });
      sinon.stub(db.CarParkLog, 'update').resolves([1]);
      sinon.stub(db.Bay, 'findAll').resolves([{
        bay_id: 1,
        bay_number: 1,
        vehicleSize: 'small',
        hasEVCharging: false,
        disabled: false,
        description: 'Test Bay'
      }]);
      sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        callback(null, { userId: 1, role: 'user' });
      });

      user = await db.User.create({ email: 'test@example.com', password: await bcrypt.hash('password', 10), role: 'user' });
      token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      sinon.stub(Client.prototype, 'geocode').resolves({
        data: {
          status: 'OK',
          results: [{
            geometry: {
              location: {
                lat: 123.456,
                lng: 789.012
              }
            }
          }]
        }
      });
    });

    after(function () {
      sinon.restore();
    });

    it('should fetch all car parks', async function () {
      const res = await request(app)
        .get('/api/carparks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should fetch a specific car park by ID', async function () {
      const res = await request(app)
        .get('/api/carparks/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('carpark_id', 1);
    });

    it('should create a new car park', async function () {
      const res = await request(app)
        .post('/api/create-carpark')
        .set('Authorization', `Bearer ${token}`)
        .send({
          addressLine1: 'University Road',
          addressLine2: 'Leicester',
          city: 'Leicester',
          postcode: 'LE2 7TG',
          openTime: '08:00',
          closeTime: '20:00',
          accessInstructions: 'Use the key',
          pricing: '5.00',
          bays: [{
            bay_number: 1,
            vehicleSize: 'small',
            hasEVCharging: false,
            disabled: false,
            description: 'Test Bay'
          }]
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message', 'Car park created successfully');
    });

    it('should update a car park', async function () {
      const res = await request(app)
        .put('/api/carparks/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          addressLine1: 'University Road',
          addressLine2: 'Leicester',
          city: 'Leicester',
          postcode: 'LE2 7TG',
          openTime: '09:00',
          closeTime: '21:00',
          accessInstructions: 'Use the card',
          pricing: '10.00',
          bays: [{
            bay_number: 2,
            vehicleSize: 'large',
            hasEVCharging: true,
            disabled: true,
            description: 'Updated Bay'
          }]
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Car park updated successfully');
    });

    it('should delete a car park', async function () {
      const res = await request(app)
        .delete('/api/carparks/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Car park marked as deleted successfully');
    });
  });

});
