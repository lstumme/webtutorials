const mongoose = require('mongoose');
const Taxi = require('../models/Taxi');

const Schema = mongoose.Schema;

const CompanySchema = new Schema({
    name: { type: String, required: true },
    taxies: [{ type: Schema.Types.ObjectId, ref: "taxi" }]
});

CompanySchema.post('save', doc => {
    // throw error if name equals 'throw error name'
    if (doc.name === "throw error name")
        throw new Error('New Test Error');
});

CompanySchema.pre('save', function (next) {
    this.name = this.name.replace(/[^a-zA-Z0-9 ]/g, "");
    next();
});

// Fonction à revoir : il semblerait qu'il y ait un bug là dedans
CompanySchema.post("remove", async function (doc) {
    // Remove Company's taxies before removing company
    console.log(doc);
    await Taxi.deleteMany({ _id: { $in: doc.taxies } });
});

module.exports = mongoose.model('company', CompanySchema);
