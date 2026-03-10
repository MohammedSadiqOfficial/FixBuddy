import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

/**
 * Formats a phone number to E.164 standard (e.g., +919741624929).
 * Defaults to +91 if country code is missing and number is 10 digits.
 * @param {string} phone - The raw phone number string
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return phone;

    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) return cleaned;

    // If it's 10 digits, prepend +91 (India)
    if (cleaned.length === 10) return `+91${cleaned}`;

    // If it's already 12 digits (starting with 91), prepend +
    if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;

    // Otherwise return as is
    return `+91${cleaned}`;
};

/**
 * Check if Twilio credentials are properly configured
 * @returns {boolean}
 */
const hasValidCredentials = () => {
    if (!accountSid || !authToken || !fromPhoneNumber) {
        console.warn('[TWILIO] Missing credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER).');
        return false;
    }
    return true;
};

/**
 * Send a raw SMS message using Twilio Programmable SMS.
 * Note: For OTPs, prefer sendOTP() using Twilio Verify instead.
 * Make sure your Twilio number supports SMS in the recipient's country.
 *
 * @param {string} to - The recipient phone number (will be auto-formatted)
 * @param {string} body - The message body
 * @returns {object|null} - Twilio message object or null on failure
 */
export const sendSMS = async (to, body) => {
    try {
        const formattedTo = formatPhoneNumber(to);
        // Use fromPhoneNumber as-is from env (already in E.164 from Twilio console)
        const formattedFrom = fromPhoneNumber;

        if (!hasValidCredentials()) {
            console.log(`[DEV] To: ${formattedTo}, Message: ${body}`);
            return null;
        }

        const message = await client.messages.create({
            body,
            from: formattedFrom,
            to: formattedTo,
        });

        console.log(`[TWILIO] SMS sent to ${formattedTo} | SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`[TWILIO] Error sending SMS to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send an OTP using Twilio Verify Service.
 * This is the recommended approach for OTP delivery — handles
 * country routing, retries, and rate limiting automatically.
 *
 * Setup:
 *  1. Go to Twilio Console → Verify → Services → Create Service
 *  2. Copy the Service SID into your .env as TWILIO_VERIFY_SERVICE_SID
 *
 * @param {string} to - The recipient phone number
 * @param {'sms'|'call'|'email'|'whatsapp'} channel - Delivery channel (default: 'sms')
 * @returns {object|null} - Twilio verification object or null on failure
 */
export const sendOTP = async (to, channel = 'sms') => {
    try {
        const formattedTo = formatPhoneNumber(to);

        if (!verifyServiceSid) {
            console.warn('[TWILIO] TWILIO_VERIFY_SERVICE_SID is not set. Cannot send OTP via Verify.');
            return null;
        }

        if (!accountSid || !authToken) {
            console.warn('[TWILIO] Missing Twilio credentials. OTP not sent.');
            console.log(`[DEV] OTP would be sent to: ${formattedTo}`);
            return null;
        }

        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications.create({
                to: formattedTo,
                channel,
            });

        console.log(`[TWILIO] OTP sent to ${formattedTo} via ${channel} | Status: ${verification.status}`);
        return verification;
    } catch (error) {
        console.error(`[TWILIO] Error sending OTP to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Verify an OTP code entered by the user using Twilio Verify Service.
 *
 * @param {string} to - The recipient phone number (must match the one used in sendOTP)
 * @param {string} code - The OTP code entered by the user
 * @returns {{ success: boolean, status: string }} - Verification result
 */
export const verifyOTP = async (to, code) => {
    try {
        const formattedTo = formatPhoneNumber(to);

        if (!verifyServiceSid) {
            console.warn('[TWILIO] TWILIO_VERIFY_SERVICE_SID is not set. Cannot verify OTP.');
            return { success: false, status: 'missing_service_sid' };
        }

        if (!accountSid || !authToken) {
            console.warn('[TWILIO] Missing Twilio credentials. OTP not verified.');
            return { success: false, status: 'missing_credentials' };
        }

        const verificationCheck = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({
                to: formattedTo,
                code,
            });

        const approved = verificationCheck.status === 'approved';
        console.log(`[TWILIO] OTP verification for ${formattedTo}: ${verificationCheck.status}`);

        return {.
            success: approved,
            status: verificationCheck.status, // 'approved' | 'pending' | 'canceled'
        };
    } catch (error) {
        console.error(`[TWILIO] Error verifying OTP for ${to}:`, error.message);
        throw error;
    }
};