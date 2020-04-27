const mongoose = require('mongoose');
const Company = require('../models/Company');

let company;

beforeAll(() => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/taxi-aggregator', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    company = new Company();
    company.name = "First Company";
    company = await company.save();
});

afterEach(async () => {
    await Company.deleteMany({});
});

afterAll((done) => {
    mongoose.disconnect(done);
});

describe('Company tests', () => {
    test('Create Company', async () => {
        const count = await Company.countDocuments();
        expect(count).toBe(1);
    });

    test('Read Company', async () => {
        const readCompany = await Company.findById(company.id);
        expect(readCompany.name).toBe(company.name);
    });

    test('Update Company', async () => {
        let newName = "New name";
        await Company.updateOne({ _id: company.id }, { name: newName });
        const readCompany = await Company.findById(company.id);
        expect(readCompany.name).toBe(newName);
    });

    test('Delete Company', async () => {
        const count = await Company.countDocuments();
        await Company.deleteOne({ _id: company.id });
        const newCount = await Company.countDocuments();
        expect(newCount).toBe(0);
    });
});