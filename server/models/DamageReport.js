import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const damageReportSchema = new mongoose.Schema({
    booking: {type: ObjectId, ref: "Booking", required: true},
    car: {type: ObjectId, ref: "Car", required: true},
    reportedBy: {type: ObjectId, ref: "User", required: true},
    stage: {type: String, enum: ["pickup", "return"], default: "pickup"},
    zone: {type: String, required: true},
    severity: {type: String, enum: ["low", "medium", "high"], default: "low"},
    description: {type: String, default: ""},
    photos: [{type: String}],
    chargeAmount: {type: Number, default: 0},
    status: {type: String, enum: ["open", "reviewing", "charged", "closed"], default: "open"},
},{timestamps: true})

const DamageReport = mongoose.model("DamageReport", damageReportSchema)

export default DamageReport
