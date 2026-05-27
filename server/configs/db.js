import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        mongoose.connection.on("connected", () => console.log("Database Connected"));
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
}

export default connectDB;
