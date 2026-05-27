import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const carSchema = new mongoose.Schema({
    owner: {type: ObjectId, ref: 'User'},
    brand: {type: String, required: true},
    model: {type: String, required: true},
    image: {type: String, required: true},
    model3d: {type: String, default: ''},
    year: {type: Number, required: true},
    category: {type: String, required: true},
    seating_capacity: {type: Number, required: true},
    fuel_type: { type: String, required: true },
    transmission: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvaliable: {type: Boolean, default: true},
    mileageLimit: {type: Number, default: 250},
    allowedRegion: {type: String, default: ''},
    lastKnownLocation: {
        lat: {type: Number, default: 0},
        lng: {type: Number, default: 0},
        address: {type: String, default: ''},
    },
    trackingStatus: {type: String, enum: ["parked", "moving", "idle", "delivered", "en-route"], default: "parked"},
    lastTrackedAt: {type: Date, default: Date.now},
    trackingHistory: [{
        lat: {type: Number, default: 0},
        lng: {type: Number, default: 0},
        address: {type: String, default: ''},
        status: {type: String, default: 'parked'},
        source: {type: String, default: 'manual'},
        recordedAt: {type: Date, default: Date.now},
    }],
    serviceDueDate: {type: Date},
    insuranceExpiry: {type: Date},
    pollutionExpiry: {type: Date},
    plateNumber: {type: String, default: ''},
    isDigitalKeyEnabled: {type: Boolean, default: true},
    isContactlessEnabled: {type: Boolean, default: true},
    isCounterBypassEligible: {type: Boolean, default: true},
    ownerResponseMinutes: {type: Number, default: 5},
    protectionPlan: {type: String, enum: ["basic", "standard", "premium"], default: "standard"},
    smartPricing: {
        weekdayPrice: {type: Number, default: 0},
        weekendPrice: {type: Number, default: 0},
        holidayMultiplier: {type: Number, default: 1.2},
        subscriptionWeeklyDiscount: {type: Number, default: 10},
        subscriptionMonthlyDiscount: {type: Number, default: 25},
    },
    pickupInstructions: {
        parkingSpot: {type: String, default: ''},
        lockboxCode: {type: String, default: ''},
        guide: {type: String, default: ''},
        revealAfterVerification: {type: Boolean, default: true},
    },
    ev: {
        batteryLevel: {type: Number, default: 0},
        chargingPolicy: {type: String, default: ''},
        chargingCostPerKwh: {type: Number, default: 0},
    },
    fuelPolicy: {
        startingLevel: {type: Number, default: 100},
        returnSameLevel: {type: Boolean, default: true},
        refuelChargePerPercent: {type: Number, default: 2},
    },
},{timestamps: true})

const Car = mongoose.model('Car', carSchema)

export default Car
