import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const paymentSchema = new mongoose.Schema({
    booking: {type: ObjectId, ref: "Booking", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    amount: {type: Number, required: true},
    depositAmount: {type: Number, default: 0},
    currency: {type: String, default: "USD"},
    provider: {type: String, default: "manual"},
    providerPaymentId: {type: String, default: ""},
    providerSessionId: {type: String, default: ""},
    checkoutUrl: {type: String, default: ""},
    status: {type: String, enum: ["unpaid", "pending", "authorized", "paid", "refunded", "failed"], default: "unpaid"},
    serviceFee: {type: Number, default: 0},
    discountAmount: {type: Number, default: 0},
    lateFee: {type: Number, default: 0},
    webhookEvents: [{
        type: {type: String},
        receivedAt: {type: Date, default: Date.now},
    }],
    captureBefore: {type: Date},
},{timestamps: true})

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment
