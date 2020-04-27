const mongoose = require('mongoose');
const Company = require('../models/Company');
const Taxi = require('../models/Taxi');

beforeAll(() => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/taxi-aggregator', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    for (let i = 1; i <= 5; i++) {
        let taxi = new Taxi();
        taxi.brand = 'Toyota';
        taxi.model = 'Yaris';
        taxi.year = 2015 + i;
        taxi.owner = { name: `Driver ${i}`, experience: 5 * i };
        await taxi.save();
    }
});

afterEach(async () => {
    await Taxi.deleteMany({});
});

afterAll((done) => {
    mongoose.disconnect(done);
});

describe('MongoDB operators test', () => {
    test('$gt and $lt operators', async () => {
        const count = await Taxi.countDocuments();
        expect(count).toBe(5);

        const readTaxis = await Taxi.find({
            "owner.experience": { $gt: 6, $lt: 21 }
        });
        expect(readTaxis.length).toBe(3);
    });

    test('$in operator', async () => {
        const count = await Taxi.countDocuments();
        expect(count).toBe(5);

        const readTaxis = await Taxi.find({
            "owner.experience": { $in: [5, 15, 25, 35] }
        });
        expect(readTaxis.length).toBe(3);
    });


    test('$in operator', async () => {
        const count = await Taxi.countDocuments();
        expect(count).toBe(5);

        const readTaxis = await Taxi.find({
            "owner.experience": { $in: [5, 15, 25, 35] }
        });
        expect(readTaxis.length).toBe(3);
    });

    test('$and operator', async () => {
        const count = await Taxi.countDocuments();
        expect(count).toBe(5);

        const readTaxis = await Taxi.find({
            $and: [
                { "owner.name": "Driver 3" },
                { year: 2018 }
            ]
        });
        expect(readTaxis.length).toBe(1);
    });

    test('$or operator', async () => {
        const count = await Taxi.countDocuments();
        expect(count).toBe(5);

        const readTaxis = await Taxi.find({
            $or: [
                { "owner.name": "Driver 3" },
                { year: { $lte: 2017 } }
            ]
        });
        expect(readTaxis.length).toBe(3);
    });
});