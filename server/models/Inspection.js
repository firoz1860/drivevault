import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const inspectionSchema = new mongoose.Schema({
    booking: {type: ObjectId, ref: "Booking", required: true},
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    stage: {type: String, enum: ["pickup", "return"], default: "pickup"},
    plateNumber: {type: String, default: ""},
    odometer: {type: Number, default: 0},
    fuelLevel: {type: Number, default: 100},
    batteryLevel: {type: Number, default: 0},
    selfieUrl: {type: String, default: ""},
    licenseUrl: {type: String, default: ""},
    zones: [{
        name: {type: String, required: true},
        photoUrl: {type: String, default: ""},
        aiLabel: {type: String, enum: ["clean", "possible-scratch", "dent", "needs-review"], default: "clean"},
        note: {type: String, default: ""},
    }],
    signature: {type: String, default: ""},
    conditionScore: {type: Number, default: 100},
},{timestamps: true})

const Inspection = mongoose.model("Inspection", inspectionSchema)

export default Inspection
