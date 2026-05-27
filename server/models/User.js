import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true },
    password: {type: String, required: true },
    role: {type: String, enum: ["owner", "user", "admin", "staff"], default: 'user' },
    image: {type: String, default: ''},
    phone: {type: String, default: ''},
    favoriteLocations: [{type: String}],
    loyaltyPoints: {type: Number, default: 0},
    referralCode: {type: String, default: ''},
    referredBy: {type: String, default: ''},
    reliabilityScore: {type: Number, default: 80},
    verification: {
        email: {type: Boolean, default: false},
        phone: {type: Boolean, default: false},
        documents: {type: Boolean, default: false},
        bank: {type: Boolean, default: false},
    },
    documents: [{
        type: {type: String, default: 'license'},
        url: {type: String, default: ''},
        status: {type: String, enum: ["pending", "verified", "rejected"], default: "pending"},
    }],
},{timestamps: true})

const User = mongoose.model('User', userSchema)

export default User
