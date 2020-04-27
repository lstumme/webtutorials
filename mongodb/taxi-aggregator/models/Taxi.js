const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OwnerSchema = new Schema({
    name: { type: String, required: true },
    experience: { type: Number, required: true }
});

const PointSchema = new Schema({
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }
});

const TaxiSchema = new Schema({
    brand: { type: String, required: [true, "Brand is required."] },
    model: { type: String, required: true },
    year: {
        type: Number, required: true, validate: {
            validator: function (v) {
                return /^[0-9]{4}$/.test(v);
            },
            message: props => `Year has to be 4 digits.`
        }
    },
    owner: OwnerSchema,
    geometry: PointSchema
});

module.exports = mongoose.model('taxi', TaxiSchema);
