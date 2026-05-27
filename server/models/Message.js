import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const messageSchema = new mongoose.Schema({
    booking: {type: ObjectId, ref: "Booking"},
    sender: {type: ObjectId, ref: "User", required: true},
    receiver: {type: ObjectId, ref: "User", required: true},
    message: {type: String, required: true},
    readAt: {type: Date},
},{timestamps: true})

const Message = mongoose.model("Message", messageSchema)

export default Message
