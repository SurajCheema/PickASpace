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
          password: 'Pass123!',
          phone: '+441234567890',
          DOB: '1990-01-01',
          role: 'user',
          blueBadge: false
        });
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('message', 'Required fields must not be empty.');
    }).timeout(15000); // Increase the timeout to 15000ms for this test
  

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
      expect(res.statusCode).to.equal(401);
      expect(res.text).to.equal('Authentication failed');
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

  // Add more tests for other user endpoints...
});