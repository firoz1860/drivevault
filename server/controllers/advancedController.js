import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import DamageReport from "../models/DamageReport.js";
import Inspection from "../models/Inspection.js";
import Maintenance from "../models/Maintenance.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import Payment from "../models/Payment.js";
import PromoCode from "../models/PromoCode.js";
import RentalAgreement from "../models/RentalAgreement.js";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import { calculateBookingPayment, createStripeCheckoutSession, createStripeDepositHold, verifyStripeWebhook } from "../services/paymentService.js";
import { dispatchDueNotifications, queueNotification } from "../services/notificationService.js";

const makePickupCode = (bookingId) => `CR-${bookingId.toString().slice(-6).toUpperCase()}`;

const buildCarInsights = (car, index = 0) => ({
    distanceKm: Number((1.2 + index * 1.7).toFixed(1)),
    pickupZone: car.pickupInstructions?.parkingSpot || `${car.location} pickup zone`,
    counterBypass: car.isCounterBypassEligible,
    digitalKey: car.isDigitalKeyEnabled,
    contactless: car.isContactlessEnabled,
    trackingStatus: car.trackingStatus || "parked",
    lastTrackedAt: car.lastTrackedAt || car.updatedAt,
    trustBadges: [
        car.isDigitalKeyEnabled ? "Digital key" : "Staff pickup",
        car.isContactlessEnabled ? "Contactless" : "Counter pickup",
        car.isCounterBypassEligible ? "Skip counter" : "Standard counter",
        car.fuel_type === "Electric" ? "EV ready" : "Fuel policy",
        `${car.protectionPlan} protection`,
    ],
});

const calculateTripCost = (car, days = 1) => {
    const dayCount = Math.max(1, Number(days));
    const basePrice = Number(car.pricePerDay || 0) * dayCount;
    const weekendBoost = dayCount >= 2 ? Math.round(basePrice * 0.12) : 0;
    const serviceFee = Math.round((basePrice + weekendBoost) * 0.08);
    const deposit = Math.max(100, Math.round(basePrice * 0.25));
    const fuelOrChargeEstimate = car.fuel_type === "Electric" ? 18 * dayCount : 25 * dayCount;
    return {
        basePrice,
        weekendBoost,
        serviceFee,
        deposit,
        fuelOrChargeEstimate,
        totalTripCost: basePrice + weekendBoost + serviceFee + fuelOrChargeEstimate,
    };
};

export const getRentalSuite = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({user: userId}).populate("car owner").sort({createdAt: -1});
        const notifications = await Notification.find({user: userId}).sort({createdAt: -1}).limit(20);
        const payments = await Payment.find({user: userId}).sort({createdAt: -1}).limit(20);
        const agreements = await RentalAgreement.find({user: userId}).sort({createdAt: -1}).limit(20);
        const tickets = await SupportTicket.find({user: userId}).sort({createdAt: -1}).limit(20);
        const messages = await Message.find({$or: [{sender: userId}, {receiver: userId}]}).sort({createdAt: -1}).limit(20);
        res.json({
            success: true,
            suite: {
                bookings,
                notifications,
                payments,
                agreements,
                tickets,
                messages,
                loyaltyPoints: req.user.loyaltyPoints,
                reliabilityScore: req.user.reliabilityScore,
                favoriteLocations: req.user.favoriteLocations,
                verification: req.user.verification,
            }
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateProfileExtras = async (req, res) => {
    try {
        const {phone, favoriteLocation, referredBy} = req.body;
        const update = {};
        if (phone !== undefined) update.phone = phone;
        if (referredBy !== undefined) update.referredBy = referredBy;
        if (favoriteLocation) update.$addToSet = {favoriteLocations: favoriteLocation};
        const user = await User.findByIdAndUpdate(req.user._id, update, {new: true}).select("-password");
        res.json({success: true, user, message: "Profile preferences updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const uploadDocumentRecord = async (req, res) => {
    try {
        const {type = "license", url = "Uploaded during mobile check-in"} = req.body;
        const user = await User.findByIdAndUpdate(req.user._id, {
            $push: {documents: {type, url}},
            "verification.documents": true,
        }, {new: true}).select("-password");
        res.json({success: true, user, message: "Document saved for verification"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const queueBookingNotifications = async (req, res) => {
    try {
        const {bookingId, channel = "email"} = req.body;
        const booking = await Booking.findById(bookingId).populate("car user owner");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString() && booking.owner._id.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        const recipient = channel === "email" ? booking.user.email : (booking.user.phone || booking.user.email);
        const reminders = [
            {event: "booking_created", subject: "Booking received", message: `Your booking for ${booking.car.brand} ${booking.car.model} is received.`},
            {event: "pickup_reminder", subject: "Pickup reminder", message: `Pickup reminder for ${booking.car.brand} ${booking.car.model}.`, scheduledFor: booking.pickupDate},
            {event: "return_reminder", subject: "Return reminder", message: `Return reminder for ${booking.car.brand} ${booking.car.model}.`, scheduledFor: booking.returnDate},
            {event: "invoice_ready", subject: "Invoice ready", message: `Invoice is ready for booking ${booking._id}.`},
        ];
        const notifications = await Notification.insertMany(reminders.map((item) => ({
            user: booking.user._id,
            booking: booking._id,
            channel,
            recipient,
            ...item,
        })));
        res.json({success: true, notifications, message: "Notification workflow queued"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createPaymentIntentRecord = async (req, res) => {
    try {
        const {bookingId, provider = "manual"} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const depositAmount = Math.round(booking.price * 0.25);
        const captureBefore = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const payment = await Payment.create({
            booking: booking._id,
            user: req.user._id,
            amount: booking.price,
            depositAmount,
            provider,
            providerPaymentId: `manual_${booking._id}`,
            status: "authorized",
            captureBefore,
        });
        booking.paymentStatus = "authorized";
        booking.depositAmount = depositAmount;
        await booking.save();
        await queueNotification({
            user: req.user._id,
            booking: booking._id,
            channel: "email",
            event: "payment_authorized",
            recipient: req.user.email,
            subject: "Payment authorized",
            message: `Payment authorization recorded for booking ${booking._id}.`,
        });
        res.json({success: true, payment, message: "Payment and deposit authorization recorded"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createCheckoutSession = async (req, res) => {
    try {
        const {bookingId, promoDiscount = 0, lateFee = 0, currency = "usd"} = req.body;
        const booking = await Booking.findById(bookingId).populate("car user");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});

        const totals = calculateBookingPayment({booking, promoDiscount, lateFee});
        const stripeResult = await createStripeCheckoutSession({
            booking,
            car: booking.car,
            user: booking.user,
            amount: totals.totalAmount,
            depositAmount: totals.depositAmount,
            currency,
        });

        const payment = await Payment.create({
            booking: booking._id,
            user: req.user._id,
            amount: totals.totalAmount,
            depositAmount: totals.depositAmount,
            currency: currency.toUpperCase(),
            provider: stripeResult.configured ? "stripe" : "manual",
            providerSessionId: stripeResult.data?.id || "",
            providerPaymentId: stripeResult.data?.payment_intent || "",
            checkoutUrl: stripeResult.data?.url || "",
            serviceFee: totals.serviceFee,
            discountAmount: totals.promoDiscount,
            lateFee: totals.lateFee,
            status: stripeResult.ok ? "pending" : "unpaid",
        });

        booking.paymentStatus = payment.status;
        booking.depositAmount = totals.depositAmount;
        await booking.save();

        if (!stripeResult.configured) {
            return res.json({success: false, payment, message: stripeResult.error});
        }
        if (!stripeResult.ok) {
            return res.json({success: false, payment, message: stripeResult.data?.error?.message || "Stripe checkout failed"});
        }

        await queueNotification({
            user: req.user._id,
            booking: booking._id,
            channel: "email",
            event: "payment_started",
            recipient: req.user.email,
            subject: "Payment started",
            message: `Payment started for booking ${booking._id}. Complete checkout to confirm your rental.`,
            metadata: {checkoutUrl: payment.checkoutUrl},
        });

        res.json({success: true, payment, checkoutUrl: payment.checkoutUrl, totals, message: "Stripe checkout session created"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createDepositHold = async (req, res) => {
    try {
        const {bookingId, currency = "usd"} = req.body;
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});

        const totals = calculateBookingPayment({booking});
        const stripeResult = await createStripeDepositHold({booking, user: booking.user, depositAmount: totals.depositAmount, currency});

        const payment = await Payment.create({
            booking: booking._id,
            user: req.user._id,
            amount: totals.depositAmount,
            depositAmount: totals.depositAmount,
            currency: currency.toUpperCase(),
            provider: stripeResult.configured ? "stripe" : "manual",
            providerPaymentId: stripeResult.data?.id || "",
            status: stripeResult.ok ? "authorized" : "unpaid",
            captureBefore: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        booking.paymentStatus = payment.status;
        booking.depositAmount = totals.depositAmount;
        await booking.save();

        if (!stripeResult.configured) return res.json({success: false, payment, message: stripeResult.error});
        if (!stripeResult.ok) return res.json({success: false, payment, message: stripeResult.data?.error?.message || "Stripe deposit hold failed"});

        await queueNotification({
            user: req.user._id,
            booking: booking._id,
            channel: "email",
            event: "deposit_hold_created",
            recipient: req.user.email,
            subject: "Security deposit hold created",
            message: `A security deposit hold was created for booking ${booking._id}.`,
        });

        res.json({success: true, payment, clientSecret: stripeResult.data?.client_secret, message: "Security deposit hold created"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const stripeWebhook = async (req, res) => {
    try {
        const {event} = verifyStripeWebhook(req.body, req.headers["stripe-signature"] || "");
        const object = event.data?.object || {};
        const bookingId = object.metadata?.bookingId;
        const providerPaymentId = object.payment_intent || object.id;

        let paymentStatus = null;
        if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") paymentStatus = "paid";
        if (event.type === "payment_intent.payment_failed") paymentStatus = "failed";
        if (event.type === "charge.refunded") paymentStatus = "refunded";
        if (event.type === "payment_intent.amount_capturable_updated") paymentStatus = "authorized";

        if (bookingId && paymentStatus) {
            const booking = await Booking.findById(bookingId).populate("car user owner");
            if (booking) {
                booking.paymentStatus = paymentStatus;
                if (paymentStatus === "paid" && booking.status === "pending") booking.status = "confirmed";
                await booking.save();

                const normalizedProviderPaymentId = providerPaymentId || "";
                const paymentQuery = {
                    booking: booking._id,
                    $or: [
                        {providerPaymentId: normalizedProviderPaymentId},
                        {providerSessionId: object.id},
                        {providerPaymentId: object.id || ""},
                    ],
                };
                let payment = await Payment.findOneAndUpdate(
                    paymentQuery,
                    {
                        status: paymentStatus,
                        providerPaymentId: normalizedProviderPaymentId,
                        $push: {webhookEvents: {type: event.type}},
                    },
                    {new: true}
                );
                if (!payment) {
                    payment = await Payment.findOneAndUpdate(
                        {booking: booking._id},
                        {
                            status: paymentStatus,
                            providerPaymentId: normalizedProviderPaymentId,
                            providerSessionId: object.id,
                            $push: {webhookEvents: {type: event.type}},
                        },
                        {new: true, sort: {createdAt: -1}}
                    );
                }

                await queueNotification({
                    user: booking.user._id,
                    booking: booking._id,
                    channel: "email",
                    event: `stripe_${event.type}`,
                    recipient: booking.user.email,
                    subject: `Payment ${paymentStatus}`,
                    message: `Your ${booking.car.brand} ${booking.car.model} booking payment is ${paymentStatus}. Invoice: ${process.env.CLIENT_URL || "http://localhost:5173"}/rental-suite`,
                    metadata: {paymentId: payment?._id, stripeEvent: event.type},
                });

                if (booking.user.phone) {
                    await queueNotification({
                        user: booking.user._id,
                        booking: booking._id,
                        channel: "whatsapp",
                        event: `stripe_${event.type}`,
                        recipient: booking.user.phone,
                        subject: "",
                        message: `DriveVault: your booking payment is ${paymentStatus}.`,
                        metadata: {stripeEvent: event.type},
                    });
                }
            }
        }

        res.json({received: true});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
}

export const dispatchNotifications = async (req, res) => {
    try {
        const notifications = await dispatchDueNotifications();
        res.json({success: true, count: notifications.length, notifications, message: "Due notifications processed"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getExperienceHub = async (req, res) => {
    try {
        const cars = await Car.find({isAvaliable: true}).limit(12);
        const bookings = req.user ? await Booking.find({user: req.user._id}).populate("car owner").sort({createdAt: -1}).limit(8) : [];
        const inspections = req.user ? await Inspection.find({user: req.user._id}).populate("car booking").sort({createdAt: -1}).limit(10) : [];
        res.json({
            success: true,
            hub: {
                radarCars: cars.map((car, index) => ({...car.toObject(), insights: buildCarInsights(car, index), tripCost: calculateTripCost(car, 3)})),
                bookings,
                inspections,
                checklistTemplates: ["Payment", "License", "Selfie", "Agreement", "Damage photos", "Pickup pass"],
                airportTerminals: ["Terminal 1", "Terminal 2", "Terminal 3", "International"],
                chargingStations: ["Central fast charger", "Airport EV bay", "Downtown garage"],
            }
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getCarRadar = async (req, res) => {
    try {
        const {location = "", seats = 0, evOnly = false, plate = ""} = req.query;
        const query = {isAvaliable: true};
        if (location) query.location = location;
        if (Number(seats) > 0) query.seating_capacity = {$gte: Number(seats)};
        if (evOnly === "true") query.fuel_type = "Electric";
        if (plate) query.plateNumber = {$regex: plate, $options: "i"};
        const cars = await Car.find(query).limit(20);
        res.json({success: true, cars: cars.map((car, index) => ({...car.toObject(), insights: buildCarInsights(car, index)}))});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const compareTripCosts = async (req, res) => {
    try {
        const {carIds = [], days = 3} = req.body;
        const cars = await Car.find(carIds.length ? {_id: {$in: carIds}} : {isAvaliable: true}).limit(4);
        res.json({success: true, comparisons: cars.map((car) => ({car, cost: calculateTripCost(car, days)}))});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateContactlessChecklist = async (req, res) => {
    try {
        const {bookingId, licenseUploaded, selfieUploaded, agreementSigned, paymentComplete, damagePhotosComplete} = req.body;
        const booking = await Booking.findById(bookingId).populate("car user");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const currentContactless = booking.contactless || {};
        booking.contactless = {
            licenseUploaded: Boolean(licenseUploaded ?? currentContactless.licenseUploaded),
            selfieUploaded: Boolean(selfieUploaded ?? currentContactless.selfieUploaded),
            agreementSigned: Boolean(agreementSigned ?? currentContactless.agreementSigned),
            paymentComplete: Boolean(paymentComplete ?? (currentContactless.paymentComplete || booking.paymentStatus === "paid")),
            damagePhotosComplete: Boolean(damagePhotosComplete ?? currentContactless.damagePhotosComplete),
            readyForPickup: false,
        };
        booking.contactless.readyForPickup = booking.contactless.licenseUploaded && booking.contactless.selfieUploaded && booking.contactless.agreementSigned && booking.contactless.paymentComplete && booking.contactless.damagePhotosComplete;
        booking.digitalKey = {
            ...(booking.digitalKey || {}),
            enabled: booking.contactless.readyForPickup && booking.car.isDigitalKeyEnabled,
        };
        booking.checkInStatus = booking.contactless.readyForPickup ? "ready" : "documents-uploaded";
        await booking.save();
        res.json({success: true, booking, message: booking.contactless.readyForPickup ? "Contactless pickup ready" : "Checklist updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const unlockDigitalKey = async (req, res) => {
    try {
        const {bookingId} = req.body;
        const booking = await Booking.findById(bookingId).populate("car user");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        if (!booking.car.isDigitalKeyEnabled) return res.json({success: false, message: "Digital key is not enabled for this car"});
        if (!booking.contactless?.readyForPickup && booking.paymentStatus !== "paid") return res.json({success: false, message: "Complete check-in or payment before unlocking"});
        booking.digitalKey = {enabled: true, status: "unlocked", lastUnlockedAt: new Date()};
        await booking.save();
        res.json({success: true, digitalKey: booking.digitalKey, message: "Car unlocked for pickup"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createInspection = async (req, res) => {
    try {
        const {bookingId, stage = "pickup", plateNumber = "", odometer = 0, fuelLevel = 100, batteryLevel = 0, selfieUrl = "", licenseUrl = "", zones = [], signature = ""} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const normalizedZones = (zones.length ? zones : ["front", "rear", "left", "right", "interior", "dashboard", "tires"]).map((zone) => {
            const name = typeof zone === "string" ? zone : zone.name;
            const photoUrl = typeof zone === "string" ? "" : zone.photoUrl || "";
            const note = typeof zone === "string" ? "" : zone.note || "";
            const aiLabel = note.toLowerCase().includes("scratch") ? "possible-scratch" : note.toLowerCase().includes("dent") ? "dent" : "clean";
            return {name, photoUrl, note, aiLabel};
        });
        const conditionScore = Math.max(40, 100 - normalizedZones.filter((zone) => zone.aiLabel !== "clean").length * 12);
        const inspection = await Inspection.create({
            booking: booking._id,
            car: booking.car,
            user: req.user._id,
            stage,
            plateNumber,
            odometer,
            fuelLevel,
            batteryLevel,
            selfieUrl,
            licenseUrl,
            zones: normalizedZones,
            signature,
            conditionScore,
        });
        if (stage === "pickup") {
            booking.contactless = {...(booking.contactless || {}), damagePhotosComplete: true};
        }
        if (stage === "return") {
            booking.returnCondition = {cleanliness: conditionScore >= 85 ? 5 : 3, fuelLevel, batteryLevel, mileageUsed: odometer, score: conditionScore};
        }
        await booking.save();
        res.json({success: true, inspection, message: "Inspection saved"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateAirportFlow = async (req, res) => {
    try {
        const {bookingId, terminal, flightNumber, flightDelayMinutes = 0} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        booking.airport = {terminal, flightNumber, flightDelayMinutes};
        await booking.save();
        res.json({success: true, airport: booking.airport, message: "Airport pickup updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const instantExtendBooking = async (req, res) => {
    try {
        const {bookingId, requestedReturnDate} = req.body;
        const booking = await Booking.findById(bookingId).populate("car");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const conflict = await Booking.findOne({
            _id: {$ne: booking._id},
            car: booking.car._id,
            status: {$ne: "cancelled"},
            pickupDate: {$lte: requestedReturnDate},
            returnDate: {$gte: booking.returnDate},
        });
        const oldReturn = new Date(booking.returnDate);
        const newReturn = new Date(requestedReturnDate);
        const extraDays = Math.max(1, Math.ceil((newReturn - oldReturn) / (1000 * 60 * 60 * 24)));
        booking.extensionRequest = {requestedReturnDate: newReturn, extraPrice: extraDays * booking.car.pricePerDay, status: conflict ? "pending" : "approved"};
        if (!conflict) booking.returnDate = newReturn;
        await booking.save();
        res.json({success: true, booking, message: conflict ? "Extension sent for owner approval" : "Extension approved instantly"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateSmartMobilitySettings = async (req, res) => {
    try {
        const {carId, settings = {}} = req.body;
        const car = await Car.findById(carId);
        if (!car) return res.json({success: false, message: "Car not found"});
        if (car.owner.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        Object.assign(car, settings);
        await car.save();
        res.json({success: true, car, message: "Smart mobility settings updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const generateInvoice = async (req, res) => {
    try {
        const {bookingId} = req.params;
        const booking = await Booking.findById(bookingId).populate("car user owner");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user._id.toString() !== req.user._id.toString() && booking.owner._id.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        const invoice = {
            invoiceNo: `INV-${booking._id.toString().slice(-8).toUpperCase()}`,
            bookingId: booking._id,
            customer: booking.user.name,
            car: `${booking.car.brand} ${booking.car.model}`,
            pickupDate: booking.pickupDate,
            returnDate: booking.returnDate,
            amount: booking.price,
            paymentStatus: booking.paymentStatus,
            issuedAt: new Date(),
        };
        res.json({success: true, invoice});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createAgreement = async (req, res) => {
    try {
        const {bookingId, terms} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        const agreement = await RentalAgreement.create({
            booking: booking._id,
            user: booking.user,
            owner: booking.owner,
            terms: terms || "Standard rental agreement: valid license, timely return, damage responsibility, and local traffic compliance.",
            status: "sent",
        });
        res.json({success: true, agreement, message: "Rental agreement generated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const signAgreement = async (req, res) => {
    try {
        const {agreementId, signature} = req.body;
        const agreement = await RentalAgreement.findById(agreementId);
        if (!agreement) return res.json({success: false, message: "Agreement not found"});
        if (agreement.user.toString() !== req.user._id.toString() && agreement.owner.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        if (agreement.user.toString() === req.user._id.toString()) agreement.userSignature = signature || req.user.name;
        if (agreement.owner.toString() === req.user._id.toString()) agreement.ownerSignature = signature || req.user.name;
        agreement.status = agreement.userSignature && agreement.ownerSignature ? "signed" : "sent";
        agreement.signedAt = agreement.status === "signed" ? new Date() : agreement.signedAt;
        await agreement.save();
        await Booking.findByIdAndUpdate(agreement.booking, {checkInStatus: "agreement-signed"});
        res.json({success: true, agreement, message: "Agreement signed"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const requestBookingExtension = async (req, res) => {
    try {
        const {bookingId, requestedReturnDate} = req.body;
        const booking = await Booking.findById(bookingId).populate("car");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const oldReturn = new Date(booking.returnDate);
        const newReturn = new Date(requestedReturnDate);
        const extraDays = Math.max(1, Math.ceil((newReturn - oldReturn) / (1000 * 60 * 60 * 24)));
        booking.extensionRequest = {
            requestedReturnDate: newReturn,
            extraPrice: extraDays * booking.car.pricePerDay,
            status: "pending",
        };
        await booking.save();
        res.json({success: true, booking, message: "Extension request sent"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const cancelBookingWithPolicy = async (req, res) => {
    try {
        const {bookingId, reason = ""} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const hoursToPickup = (new Date(booking.pickupDate) - new Date()) / (1000 * 60 * 60);
        const fee = hoursToPickup >= 24 ? 0 : Math.round(booking.price * 0.15);
        booking.status = "cancelled";
        booking.cancellation = {requested: true, fee, reason};
        await booking.save();
        res.json({success: true, booking, message: fee ? `Booking cancelled with fee ${fee}` : "Booking cancelled free of charge"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const generatePickupPass = async (req, res) => {
    try {
        const {bookingId} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        booking.pickupPassCode = booking.pickupPassCode || makePickupCode(booking._id);
        booking.checkInStatus = "ready";
        await booking.save();
        res.json({success: true, pickupPass: {code: booking.pickupPassCode, qrText: `booking:${booking._id}:${booking.pickupPassCode}`}, message: "Pickup pass generated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createDamageReport = async (req, res) => {
    try {
        const {bookingId, stage, zone, severity, description, photos = [], chargeAmount = 0} = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        const report = await DamageReport.create({
            booking: booking._id,
            car: booking.car,
            reportedBy: req.user._id,
            stage,
            zone,
            severity,
            description,
            photos,
            chargeAmount,
        });
        res.json({success: true, report, message: "Damage report created"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const calculateLateReturn = async (req, res) => {
    try {
        const {bookingId, actualReturnDate} = req.body;
        const booking = await Booking.findById(bookingId).populate("car");
        if (!booking) return res.json({success: false, message: "Booking not found"});
        if (booking.user.toString() !== req.user._id.toString() && booking.owner.toString() !== req.user._id.toString()) {
            return res.json({success: false, message: "Unauthorized"});
        }
        const lateDays = Math.max(0, Math.ceil((new Date(actualReturnDate) - new Date(booking.returnDate)) / (1000 * 60 * 60 * 24)));
        booking.actualReturnDate = actualReturnDate;
        booking.lateFee = lateDays * Math.round(booking.car.pricePerDay * 1.25);
        await booking.save();
        res.json({success: true, booking, message: "Late return calculation updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const createSupportTicket = async (req, res) => {
    try {
        const {bookingId, category, subject, message} = req.body;
        const ticket = await SupportTicket.create({user: req.user._id, booking: bookingId, category, subject, message});
        res.json({success: true, ticket, message: "Support ticket created"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const addPromoCode = async (req, res) => {
    try {
        const {code, discountType, discountValue, maxUses, expiresAt} = req.body;
        const promo = await PromoCode.create({
            owner: req.user._id,
            code,
            discountType,
            discountValue,
            maxUses,
            expiresAt,
        });
        res.json({success: true, promo, message: "Promo campaign created"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const validatePromoCode = async (req, res) => {
    try {
        const {code, amount = 0} = req.body;
        const promo = await PromoCode.findOne({code: code?.toUpperCase(), isActive: true});
        if (!promo || promo.expiresAt < new Date() || promo.usedCount >= promo.maxUses) {
            return res.json({success: false, message: "Promo code is not valid"});
        }
        const discount = promo.discountType === "percent" ? Math.round(Number(amount) * promo.discountValue / 100) : promo.discountValue;
        res.json({success: true, promo, discount});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const addMaintenanceRecord = async (req, res) => {
    try {
        const {carId, type, dueDate, mileage, notes} = req.body;
        const car = await Car.findById(carId);
        if (!car) return res.json({success: false, message: "Car not found"});
        if (car.owner.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const record = await Maintenance.create({car: carId, owner: req.user._id, type, dueDate, mileage, notes});
        res.json({success: true, record, message: "Maintenance record added"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateFleetControls = async (req, res) => {
    try {
        const {carId, mileageLimit, allowedRegion, lastKnownLocation, serviceDueDate, insuranceExpiry, pollutionExpiry} = req.body;
        const car = await Car.findById(carId);
        if (!car) return res.json({success: false, message: "Car not found"});
        if (car.owner.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        Object.assign(car, {mileageLimit, allowedRegion, lastKnownLocation, serviceDueDate, insuranceExpiry, pollutionExpiry});
        await car.save();
        res.json({success: true, car, message: "Fleet controls updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const updateCarLocation = async (req, res) => {
    try {
        const {carId, lastKnownLocation = {}, trackingStatus = "parked", source = "manual"} = req.body;
        const car = await Car.findById(carId);
        if (!car) return res.json({success: false, message: "Car not found"});
        if (car.owner.toString() !== req.user._id.toString()) return res.json({success: false, message: "Unauthorized"});
        const normalizedLocation = {
            lat: Number(lastKnownLocation.lat || 0),
            lng: Number(lastKnownLocation.lng || 0),
            address: lastKnownLocation.address || car.location,
        };
        car.lastKnownLocation = normalizedLocation;
        car.trackingStatus = trackingStatus;
        car.lastTrackedAt = new Date();
        car.trackingHistory = [
            ...(car.trackingHistory || []),
            {
                ...normalizedLocation,
                status: trackingStatus,
                source,
                recordedAt: new Date(),
            },
        ].slice(-30);
        await car.save();
        res.json({success: true, car, message: "Live car location updated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {bookingId, receiver, message} = req.body;
        const chatMessage = await Message.create({booking: bookingId, sender: req.user._id, receiver, message});
        res.json({success: true, chatMessage, message: "Message sent"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const getOwnerOperations = async (req, res) => {
    try {
        const cars = await Car.find({owner: req.user._id});
        const carIds = cars.map((car) => car._id);
        const bookings = await Booking.find({owner: req.user._id}).populate("car user").sort({createdAt: -1});
        const maintenance = await Maintenance.find({owner: req.user._id}).populate("car").sort({dueDate: 1});
        const damages = await DamageReport.find({car: {$in: carIds}}).populate("car booking").sort({createdAt: -1});
        const promos = await PromoCode.find({owner: req.user._id}).sort({createdAt: -1});
        const revenue = bookings.reduce((sum, booking) => sum + (booking.status === "confirmed" ? booking.price : 0), 0);
        res.json({
            success: true,
            operations: {
                cars,
                bookings,
                maintenance,
                damages,
                promos,
                liveLocations: cars.map((car) => ({
                    _id: car._id,
                    brand: car.brand,
                    model: car.model,
                    location: car.lastKnownLocation?.address || car.location,
                    lat: car.lastKnownLocation?.lat || 0,
                    lng: car.lastKnownLocation?.lng || 0,
                    trackingStatus: car.trackingStatus || "parked",
                    lastTrackedAt: car.lastTrackedAt,
                    historyCount: car.trackingHistory?.length || 0,
                })),
                kpis: {
                    revenue,
                    totalBookings: bookings.length,
                    cancelledBookings: bookings.filter((booking) => booking.status === "cancelled").length,
                    utilization: cars.length ? Math.round((bookings.length / cars.length) * 10) : 0,
                }
            }
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
