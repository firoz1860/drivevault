import crypto from "crypto";

const stripeRequest = async (path, params) => {
    if (!process.env.STRIPE_SECRET_KEY) {
        return {configured: false, error: "STRIPE_SECRET_KEY is missing"};
    }

    const response = await fetch(`https://api.stripe.com/v1${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params),
    });

    const data = await response.json();
    return {configured: true, ok: response.ok, data};
}

export const createStripeCheckoutSession = async ({booking, car, user, amount, depositAmount, currency = "usd"}) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const params = {
        mode: "payment",
        success_url: `${clientUrl}/rental-suite?payment=success&booking=${booking._id}`,
        cancel_url: `${clientUrl}/rental-suite?payment=cancelled&booking=${booking._id}`,
        customer_email: user.email,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
        "line_items[0][price_data][product_data][name]": `${car.brand} ${car.model} rental`,
        "line_items[0][price_data][product_data][description]": `Booking ${booking._id}`,
        "metadata[bookingId]": booking._id.toString(),
        "metadata[userId]": user._id.toString(),
        "metadata[depositAmount]": String(depositAmount),
        "payment_intent_data[metadata][bookingId]": booking._id.toString(),
        "payment_intent_data[metadata][userId]": user._id.toString(),
    };

    return stripeRequest("/checkout/sessions", params);
}

export const createStripeDepositHold = async ({booking, user, depositAmount, currency = "usd"}) => {
    const params = {
        amount: String(Math.round(depositAmount * 100)),
        currency: currency.toLowerCase(),
        capture_method: "manual",
        confirm: "false",
        "metadata[bookingId]": booking._id.toString(),
        "metadata[userId]": user._id.toString(),
        description: `Security deposit hold for booking ${booking._id}`,
    };

    return stripeRequest("/payment_intents", params);
}

export const verifyStripeWebhook = (rawBody, signatureHeader) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return {verified: false, event: JSON.parse(rawBody.toString("utf8"))};
    }

    const parts = Object.fromEntries(signatureHeader.split(",").map((part) => part.split("=")));
    const signedPayload = `${parts.t}.${rawBody.toString("utf8")}`;
    const expected = crypto.createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET).update(signedPayload).digest("hex");
    const received = parts.v1 || "";
    const verified = received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));

    if (!verified) {
        throw new Error("Invalid Stripe webhook signature");
    }

    return {verified: true, event: JSON.parse(rawBody.toString("utf8"))};
}

export const calculateBookingPayment = ({booking, promoDiscount = 0, lateFee = 0}) => {
    const baseAmount = Number(booking.price || 0);
    const serviceFee = Math.round(baseAmount * 0.08);
    const depositAmount = Math.max(100, Math.round(baseAmount * 0.25));
    const totalAmount = Math.max(0, baseAmount + serviceFee + Number(lateFee || 0) - Number(promoDiscount || 0));

    return {baseAmount, serviceFee, depositAmount, promoDiscount, lateFee, totalAmount};
}
