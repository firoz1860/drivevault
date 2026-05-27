import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const notificationSchema = new mongoose.Schema({
    user: {type: ObjectId, ref: "User"},
    booking: {type: ObjectId, ref: "Booking"},
    channel: {type: String, enum: ["email", "sms", "whatsapp"], required: true},
    event: {type: String, required: true},
    recipient: {type: String, required: true},
    subject: {type: String, default: ""},
    message: {type: String, required: true},
    status: {type: String, enum: ["queued", "sent", "failed"], default: "queued"},
    provider: {type: String, default: "queue-only"},
    providerResponse: {type: String, default: ""},
    metadata: {type: Object, default: {}},
    scheduledFor: {type: Date},
    sentAt: {type: Date},
},{timestamps: true})

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification
