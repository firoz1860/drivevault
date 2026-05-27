import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const promoCodeSchema = new mongoose.Schema({
    owner: {type: ObjectId, ref: "User"},
    code: {type: String, required: true, uppercase: true, unique: true},
    discountType: {type: String, enum: ["percent", "fixed"], default: "percent"},
    discountValue: {type: Number, required: true},
    maxUses: {type: Number, default: 100},
    usedCount: {type: Number, default: 0},
    expiresAt: {type: Date, required: true},
    isActive: {type: Boolean, default: true},
},{timestamps: true})

const PromoCode = mongoose.model("PromoCode", promoCodeSchema)

export default PromoCode
