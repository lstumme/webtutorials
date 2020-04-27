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

describe('Taxi tests', () => {
    test('Reading subdocuments', async () => {
        let taxi = new Taxi();
        taxi.brand = 'Toyota';
        taxi.model = 'Yaris';
        taxi.year = 2015;
        taxi.owner = { name: "Driver 1", experience: 15 };
        await taxi.save();

        const readTaxi = await Taxi.findOne();
        expect(readTaxi.owner.name).toBe(taxi.owner.name);
    });

    test('populate references', async () => {
        let company = new Company();
        company.name = 'First company';
        await company.save();

        let taxi1 = new Taxi();
        taxi1.brand = 'Toyota';
        taxi1.model = 'Yaris';
        taxi1.year = 2015;
        taxi1.owner = { name: "Driver 1", experience: 15 };
        await taxi1.save();

        let taxi2 = new Taxi();
        taxi2.brand = 'Renault';
        taxi2.model = 'Scenic';
        taxi2.year = 2018;
        taxi2.owner = { name: "Driver 8", experience: 10 };
        await taxi2.save();

        company.taxies = [taxi1, taxi2];
        await company.save();

        let readCompany = await Company.findById(company.id).populate('taxies');
        expect(readCompany.taxies.length).toBe(2);
        expect(readCompany.taxies[0].brand).toBe(taxi1.brand);
        expect(readCompany.taxies[1].brand).toBe(taxi2.brand);
    });

    test('$inc operator', async () => {
        let taxi = new Taxi();
        taxi.brand = 'Toyota';
        taxi.model = 'Yaris';
        taxi.year = 2015;
        taxi.owner = { name: "Driver 1", experience: 15 };
        await taxi.save();

        await Taxi.updateOne({ _id: taxi.id }, { $inc: { year: 2 } });
        const readTaxi = await Taxi.findOne();
        expect(readTaxi.year).toBe(2017);

    });

    test('append references', async () => {
        let company = new Company();
        company.name = 'First company';
        await company.save();

        let taxi1 = new Taxi();
        taxi1.brand = 'Toyota';
        taxi1.model = 'Yaris';
        taxi1.year = 2015;
        taxi1.owner = { name: "Driver 1", experience: 15 };
        await taxi1.save();

        let taxi2 = new Taxi();
        taxi2.brand = 'Renault';
        taxi2.model = 'Scenic';
        taxi2.year = 2018;
        taxi2.owner = { name: "Driver 8", experience: 10 };
        await taxi2.save();

        company.taxies = [taxi1, taxi2];
        await company.save();

        let readCompany = await Company.findById(company.id)
        expect(readCompany.taxies.length).toBe(2);

        let taxi3 = new Taxi();
        taxi3.brand = 'Peugeot';
        taxi3.model = '3008';
        taxi3.year = 2011;
        taxi3.owner = { name: "Driver 4", experience: 3 };
        await taxi3.save();

        let taxies = readCompany.taxies;
        taxies.push(taxi3.id);

        await Company.updateOne({ _id: company.id }, { taxies: taxies });

        readCompany = await Company.findById(company.id).populate('taxies');
        expect(readCompany.taxies.length).toBe(3);
        expect(readCompany.taxies[0].brand).toBe(taxi1.brand);
        expect(readCompany.taxies[1].brand).toBe(taxi2.brand);
        expect(readCompany.taxies[2].brand).toBe(taxi3.brand);

    });
});