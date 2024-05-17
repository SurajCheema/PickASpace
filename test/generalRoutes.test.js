const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const db = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

require('./testSetup'); // Include the common setup and teardown

describe('User Endpoints', function () {
    let userToken;
    let adminToken;
    let user;
    let admin;
    let owner;
    let carPark;

    before(async function () {
        // Create a user, an admin, and an owner
        user = await db.User.create({
            email: 'user@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'John',
            last_name: 'Doe',
            DOB: new Date('1990-01-01'),
            car_registration: 'AA19AAA',
            phone: '+44123456789',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripe_account_id: 'acct_1PEfNpCYeKEb7cFa'
        });

        admin = await db.User.create({
            email: 'admin@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'Jane',
            last_name: 'Admin',
            DOB: new Date('1985-05-15'),
            car_registration: 'AA19EEE',
            phone: '+44123456700',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        owner = await db.User.create({
            email: 'owner@test.com',
            password: await bcrypt.hash('test', 10),
            first_name: 'Owner',
            last_name: 'Park',
            DOB: new Date('1990-01-01'),
            car_registration: 'AA19BBB',
            phone: '+44123456790',
            role: 'owner',
            createdAt: new Date(),
            updatedAt: new Date(),
            stripe_account_id: 'acct_1PEfNpCYeKEb7cFb'
        });

        carPark = await db.CarPark.create({
            user_id: owner.user_id,
            addressLine1: 'Owner Address',
            city: 'Owner City',
            postcode: 'Owner Postcode',
            pricing: { hourly: 2 },
        });

        userToken = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ userId: admin.user_id, role: admin.role }, process.env.JWT_SECRET);
    });

    describe('GET /api/user/bookings', function () {
        it("should fetch user's booking logs", async function () {
            const res = await request(app)
                .get('/api/user/bookings')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.all.keys('current', 'upcoming', 'past');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/bookings');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });

    describe('GET /api/user/payments', function () {
        it('should fetch all payment records for a logged-in user', async function () {
            const res = await request(app)
                .get('/api/user/payments')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/payments');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });

    describe('GET /api/payments/:paymentId', function () {
        it('should fetch a specific payment by ID', async function () {
            const payment = await db.Payment.create({
                stripePaymentId: 'ch_test123',
                amount: 10,
                paymentStatus: 'completed',
                userId: user.user_id,
            });

            const res = await request(app)
                .get(`/api/payments/${payment.payment_id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('object');
            expect(res.body.payment_id).to.equal(payment.payment_id);
        });

        it('should return an error for invalid payment ID', async function () {
            const res = await request(app)
                .get('/api/payments/9999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(404);
            expect(res.text).to.equal('Payment not found');
        });
    });


    describe('GET /api/refunds', function () {
        it('should fetch all refunds with optional filters and admin verification', async function () {
            const res = await request(app)
                .get('/api/refunds')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/refunds');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });

        it('should return an error for unauthorized requests', async function () {
            const res = await request(app)
                .get('/api/refunds')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(403);
            expect(res.text).to.equal('Access denied: You do not have permission to access this resource');
        });
    });

    describe('GET /api/user/carparks', function () {
        it("should fetch user's car parks", async function () {
            const res = await request(app)
                .get('/api/user/carparks')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should not return soft-deleted car parks', async function () {
            const carPark = await db.CarPark.create({
                user_id: user.user_id,
                addressLine1: 'Test Address',
                city: 'Test City',
                postcode: 'Test Postcode',
                pricing: { hourly: 1 },
                deletedAt: new Date(),
            });

            const res = await request(app)
                .get('/api/user/carparks')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).to.equal(200);
            expect(res.body).to.be.an('array').that.is.empty;
        });

        it('should return an error for unauthenticated requests', async function () {
            const res = await request(app)
                .get('/api/user/carparks');

            expect(res.statusCode).to.equal(401);
            expect(res.text).to.equal('Token is required');
        });
    });
});
