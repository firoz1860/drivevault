import Notification from "../models/Notification.js";

const providerStatus = (provider, configured) => configured ? provider : "queue-only";

export const queueNotification = async ({user, booking, channel = "email", event, recipient, subject, message, scheduledFor, metadata = {}}) => {
    return Notification.create({
        user,
        booking,
        channel,
        event,
        recipient,
        subject,
        message,
        scheduledFor,
        metadata,
        status: "queued",
    });
}

const sendEmail = async (notification) => {
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
        return {sent: false, provider: providerStatus("sendgrid", false), detail: "SENDGRID_API_KEY or EMAIL_FROM is missing"};
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [{to: [{email: notification.recipient}]}],
            from: {email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME || "DriveVault"},
            subject: notification.subject || "DriveVault notification",
            content: [{type: "text/plain", value: notification.message}],
        }),
    });

    return {sent: response.ok, provider: "sendgrid", detail: await response.text()};
}

const sendTwilioMessage = async (notification, whatsapp = false) => {
    const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_SMS, TWILIO_FROM_WHATSAPP} = process.env;
    const from = whatsapp ? TWILIO_FROM_WHATSAPP : TWILIO_FROM_SMS;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !from) {
        return {sent: false, provider: providerStatus("twilio", false), detail: "Twilio credentials or sender is missing"};
    }

    const body = new URLSearchParams({
        From: whatsapp && !from.startsWith("whatsapp:") ? `whatsapp:${from}` : from,
        To: whatsapp && !notification.recipient.startsWith("whatsapp:") ? `whatsapp:${notification.recipient}` : notification.recipient,
        Body: notification.message,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    return {sent: response.ok, provider: "twilio", detail: await response.text()};
}

export const dispatchNotification = async (notification) => {
    const result = notification.channel === "email"
        ? await sendEmail(notification)
        : await sendTwilioMessage(notification, notification.channel === "whatsapp");

    notification.provider = result.provider;
    notification.providerResponse = result.detail?.slice(0, 1000) || "";
    notification.status = result.sent ? "sent" : "queued";
    notification.sentAt = result.sent ? new Date() : notification.sentAt;
    await notification.save();
    return notification;
}

export const dispatchDueNotifications = async () => {
    const dueNotifications = await Notification.find({
        status: "queued",
        $or: [{scheduledFor: {$exists: false}}, {scheduledFor: null}, {scheduledFor: {$lte: new Date()}}],
    }).limit(25);

    const results = [];
    for (const notification of dueNotifications) {
        results.push(await dispatchNotification(notification));
    }
    return results;
}
