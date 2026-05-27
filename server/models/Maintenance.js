import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const maintenanceSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    type: {type: String, required: true},
    dueDate: {type: Date, required: true},
    mileage: {type: Number, default: 0},
    status: {type: String, enum: ["scheduled", "due", "completed"], default: "scheduled"},
    notes: {type: String, default: ""},
},{timestamps: true})

const Maintenance = mongoose.model("Maintenance", maintenanceSchema)

export default Maintenance
