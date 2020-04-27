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
});

afterEach(async () => {
    await Taxi.deleteMany({});
    await Company.deleteMany({});
});

afterAll((done) => {
    mongoose.disconnect(done);
});

describe('Advanced MongoDb features', () => {
    test('skip and limit', async () => {
        for (var i = 0; i < 55; i++) {
            let company = new Company();
            company.name = `Company${i + 1}`;
            await company.save()
        }
        const pagination = 10;
        let page = 1
        const firstGroup = await Company.find().skip((page - 1) * pagination).limit(pagination);
        expect(firstGroup.length).toBe(10);
        expect(firstGroup[0].name).toBe('Company1');

        page = 6;
        const secondGroup = await Company.find().skip((page - 1) * pagination).limit(pagination);
        expect(secondGroup.length).toBe(5);
        expect(secondGroup[0].name).toBe('Company51');
    });

    test('geonear', async () => {
        const SFCoordinates = [-122.4223791, 37.7679638];
        const NYCoordinates = [-73.9758597, 40.7830649];
        const ClientNearbyNYCoordinates = [-73.9795183, 40.784056];

        let taxi1 = new Taxi();
        taxi1.brand = 'Toyota';
        taxi1.model = 'Yaris';
        taxi1.year = 2015;
        taxi1.owner = { name: "Driver 1", experience: 15 };
        taxi1.geometry = { coordinates: SFCoordinates };
        await taxi1.save();

        let taxi2 = new Taxi();
        taxi2.brand = 'Renault';
        taxi2.model = 'Scenic';
        taxi2.year = 2018;
        taxi2.owner = { name: "Driver 2", experience: 10 };
        taxi2.geometry = { coordinates: NYCoordinates };
        await taxi2.save();

        const taxiNearbyOneKm = await Taxi.aggregate([
            {
                $geoNear: {
                    near: {type: "Point", coordinates: ClientNearbyNYCoordinates},
                    sperical: true,
                    maxDistance: 1 * 1000,
                    distanceField: "dist.calculated"
                }
            }
        ]);
        expect(taxiNearbyOneKm[0].owner.name).toBe('Driver 2');

        const taxiNearbyQuarterKm = await Taxi.aggregate([
            {
                $geoNear: {
                    near: {type: "Point", coordinates: ClientNearbyNYCoordinates},
                    sperical: true,
                    maxDistance: 0.25 * 1000,
                    distanceField: "dist.calculated"
                }
            }
        ]);
        expect(taxiNearbyQuarterKm.length).toBe(0);

    });




});