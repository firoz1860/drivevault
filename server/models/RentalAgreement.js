import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const rentalAgreementSchema = new mongoose.Schema({
    booking: {type: ObjectId, ref: "Booking", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    terms: {type: String, required: true},
    userSignature: {type: String, default: ""},
    ownerSignature: {type: String, default: ""},
    status: {type: String, enum: ["draft", "sent", "signed"], default: "draft"},
    signedAt: {type: Date},
},{timestamps: true})

const RentalAgreement = mongoose.model("RentalAgreement", rentalAgreementSchema)

export default RentalAgreement
