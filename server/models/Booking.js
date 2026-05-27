import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: {type: ObjectId, ref: "Car", required: true},
    user: {type: ObjectId, ref: "User", required: true},
    owner: {type: ObjectId, ref: "User", required: true},
    pickupDate: {type: Date, required: true},
    returnDate: {type: Date, required: true},
    status: {type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending"},
    price: {type: Number, required: true},
    paymentStatus: {type: String, enum: ["unpaid", "authorized", "paid", "refunded", "failed"], default: "unpaid"},
    depositAmount: {type: Number, default: 0},
    pickupPassCode: {type: String, default: ''},
    checkInStatus: {type: String, enum: ["not-started", "documents-uploaded", "agreement-signed", "ready"], default: "not-started"},
    cancellation: {
        requested: {type: Boolean, default: false},
        fee: {type: Number, default: 0},
        reason: {type: String, default: ''},
    },
    extensionRequest: {
        requestedReturnDate: {type: Date},
        extraPrice: {type: Number, default: 0},
        status: {type: String, enum: ["none", "pending", "approved", "rejected"], default: "none"},
    },
    actualReturnDate: {type: Date},
    lateFee: {type: Number, default: 0},
    mileageLimit: {type: Number, default: 250},
    allowedRegion: {type: String, default: ''},
    digitalKey: {
        enabled: {type: Boolean, default: false},
        status: {type: String, enum: ["locked", "unlocked", "expired"], default: "locked"},
        lastUnlockedAt: {type: Date},
    },
    contactless: {
        licenseUploaded: {type: Boolean, default: false},
        selfieUploaded: {type: Boolean, default: false},
        agreementSigned: {type: Boolean, default: false},
        paymentComplete: {type: Boolean, default: false},
        damagePhotosComplete: {type: Boolean, default: false},
        readyForPickup: {type: Boolean, default: false},
    },
    airport: {
        terminal: {type: String, default: ''},
        flightNumber: {type: String, default: ''},
        flightDelayMinutes: {type: Number, default: 0},
    },
    returnCondition: {
        cleanliness: {type: Number, default: 5},
        fuelLevel: {type: Number, default: 100},
        batteryLevel: {type: Number, default: 0},
        mileageUsed: {type: Number, default: 0},
        score: {type: Number, default: 100},
    },
},{timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
