import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import advancedRouter from "./routes/advancedRoutes.js";
import { stripeWebhook } from "./controllers/advancedController.js";

// Initialize Express App
const app = express()

// Connect Database
try {
    await connectDB()
} catch (error) {
    process.exit(1)
}

app.post('/api/advanced/payments/webhook', express.raw({type: 'application/json'}), stripeWebhook)

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/advanced', advancedRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))
