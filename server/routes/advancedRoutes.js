import express from "express";
import {
    addMaintenanceRecord,
    addPromoCode,
    calculateLateReturn,
    cancelBookingWithPolicy,
    createAgreement,
    createCheckoutSession,
    createDamageReport,
    createDepositHold,
    createPaymentIntentRecord,
    createSupportTicket,
    compareTripCosts,
    dispatchNotifications,
    generateInvoice,
    generatePickupPass,
    getCarRadar,
    getExperienceHub,
    getOwnerOperations,
    getRentalSuite,
    createInspection,
    instantExtendBooking,
    queueBookingNotifications,
    requestBookingExtension,
    sendMessage,
    signAgreement,
    unlockDigitalKey,
    updateAirportFlow,
    updateContactlessChecklist,
    updateCarLocation,
    updateFleetControls,
    updateProfileExtras,
    updateSmartMobilitySettings,
    uploadDocumentRecord,
    validatePromoCode,
} from "../controllers/advancedController.js";
import { protect } from "../middleware/auth.js";

const advancedRouter = express.Router();

advancedRouter.get("/suite", protect, getRentalSuite);
advancedRouter.get("/experience-hub", protect, getExperienceHub);
advancedRouter.get("/car-radar", protect, getCarRadar);
advancedRouter.post("/profile", protect, updateProfileExtras);
advancedRouter.post("/documents", protect, uploadDocumentRecord);
advancedRouter.post("/notifications/booking", protect, queueBookingNotifications);
advancedRouter.post("/notifications/dispatch-due", protect, dispatchNotifications);
advancedRouter.post("/payments/authorize", protect, createPaymentIntentRecord);
advancedRouter.post("/payments/checkout-session", protect, createCheckoutSession);
advancedRouter.post("/payments/deposit-hold", protect, createDepositHold);
advancedRouter.get("/invoice/:bookingId", protect, generateInvoice);
advancedRouter.post("/agreements", protect, createAgreement);
advancedRouter.post("/agreements/sign", protect, signAgreement);
advancedRouter.post("/bookings/extend", protect, requestBookingExtension);
advancedRouter.post("/bookings/instant-extend", protect, instantExtendBooking);
advancedRouter.post("/bookings/cancel", protect, cancelBookingWithPolicy);
advancedRouter.post("/bookings/pickup-pass", protect, generatePickupPass);
advancedRouter.post("/bookings/late-return", protect, calculateLateReturn);
advancedRouter.post("/bookings/contactless", protect, updateContactlessChecklist);
advancedRouter.post("/bookings/digital-key/unlock", protect, unlockDigitalKey);
advancedRouter.post("/bookings/airport", protect, updateAirportFlow);
advancedRouter.post("/inspections", protect, createInspection);
advancedRouter.post("/trip-costs/compare", protect, compareTripCosts);
advancedRouter.post("/damage-reports", protect, createDamageReport);
advancedRouter.post("/support-tickets", protect, createSupportTicket);
advancedRouter.post("/promos", protect, addPromoCode);
advancedRouter.post("/promos/validate", protect, validatePromoCode);
advancedRouter.post("/maintenance", protect, addMaintenanceRecord);
advancedRouter.post("/fleet-controls", protect, updateFleetControls);
advancedRouter.post("/tracking/location", protect, updateCarLocation);
advancedRouter.post("/smart-mobility-settings", protect, updateSmartMobilitySettings);
advancedRouter.post("/messages", protect, sendMessage);
advancedRouter.get("/owner/operations", protect, getOwnerOperations);

export default advancedRouter;
