const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../server');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Client } = require('@googlemaps/google-maps-services-js');

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
