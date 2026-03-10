import { sendSMS } from './sms.js';

// Mock OTP generation (In a real app, integrate Twilio/Firebase Auth)
export const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtpSms = async (phoneNumber, otp) => {
    try {
        const body = `Your Fixxr verification code is: ${otp}`;
        await sendSMS(phoneNumber, body);
        console.log(`[SMS] OTP sent to ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error(`[SMS] Failed to send OTP to ${phoneNumber}:`, error.message);
        // Fallback or handle accordingly. For now, we still return true if in dev mode? 
        // Better to let it fail if the user expects real SMS.
        return false;
    }
};
