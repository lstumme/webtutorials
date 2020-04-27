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
    await Company.deleteMany({});
    await Taxi.deleteMany({});
});

afterAll((done) => {
    mongoose.disconnect(done);
});

describe('Mongoose features', () => {
    test('Default validation', async () => {
        try {
            let company = new Company();
            await company.save();
        } catch (err) {
            expect(err.message).toBe('company validation failed: name: Path `name` is required.')
        }
    });

    test('Custom Validation Simple', async () => {
        try {
            let taxi = new Taxi();
            taxi.model = 'Yaris';
            taxi.year = 2015;
            taxi.owner = { name: "Driver 1", experience: 15 };
            await taxi.save();
        } catch (err) {
            expect(err.message).toBe('taxi validation failed: brand: Brand is required.')
        }
    });

    test('Custom Validation Advanced', async () => {
        try {
            let taxi = new Taxi();
            taxi.brand = 'Toyota'
            taxi.model = 'Yaris';
            taxi.year = 111;
            taxi.owner = { name: "Driver 1", experience: 15 };
            await taxi.save();
            expect(true).toBe(false);
        } catch (err) {
            expect(err.message).toBe('taxi validation failed: year: Year has to be 4 digits.')
        }
    });

    test('post save middleware', async () => {
        try {
            let company = new Company();
            company.name = "throw error name";
            await company.save();
            expect(true).toBe(false);
        } catch (err) {
            expect(err.message).toBe("New Test Error");
        }
    });

    test('pre save middleware', async () => {
        let company = new Company();
        company.name = 'Comp@any';
        await company.save();
        const readCompany = await Company.findOne({});
        expect(readCompany.name).toBe('Company');
    });

    // Test désactivé en attendant de savoir comment faire fonctionner le preDeleteOne / preDeleteMany
    test.only('post remove middleware', async () => {
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
        company = await company.save();
        const initialCount = await Taxi.countDocuments();
        expect(initialCount).toBe(2);

        await Company.deleteOne({ _id: company.id });
        const companyCount = await Company.countDocuments();
        expect(companyCount).toBe(0);
        const newCount = await Taxi.countDocuments();
        expect(newCount).toBe(0);

    });

    test.skip('Auto consistence test', async () => {
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
        company = await company.save();
        const initialCount = await Taxi.countDocuments();
        expect(initialCount).toBe(2);

        Taxi.deleteOne({ _id: taxi2.id });
        const newCount = await Taxi.countDocuments();
        expect(newCount).toBe(1);
        let newCompany = await Company.findById(company.id);
        expect(newCompany.taxies.length).toBe(1);
    });
});