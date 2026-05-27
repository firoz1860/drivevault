import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const supportTicketSchema = new mongoose.Schema({
    user: {type: ObjectId, ref: "User", required: true},
    booking: {type: ObjectId, ref: "Booking"},
    category: {type: String, enum: ["booking", "payment", "damage", "refund", "owner", "roadside"], default: "booking"},
    subject: {type: String, required: true},
    message: {type: String, required: true},
    status: {type: String, enum: ["open", "in-progress", "resolved"], default: "open"},
},{timestamps: true})

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema)

export default SupportTicket
