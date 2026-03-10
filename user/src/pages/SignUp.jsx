import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Navigate, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { Wrench } from "lucide-react";

export default function SignUp() {
    const { isAuthenticated, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=details, 2=otp
    const [formData, setFormData] = useState({ name: "", phoneNumber: "", email: "", location: "" });
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const timerRef = React.useRef(null);

    React.useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phoneNumber) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/user/signup", formData);
            setStep(2);
            setResendTimer(60);
            toast.success("OTP sent! Check your phone.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            await api.post("/auth/resend-otp", { phoneNumber: formData.phoneNumber });
            setResendTimer(60);
            toast.success("OTP resent successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error("Please enter the OTP.");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/auth/user/verify-otp", { phoneNumber: formData.phoneNumber, otp });
            login(res.data.data.token, res.data.data.user);
            toast.success("Account created! Welcome to FixBuddy 🎉");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                        <Wrench className="h-7 w-7" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Create Account</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {step === 1 ? "Sign up to find and book professionals." : "Verify your phone number to continue."}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number *</Label>
                                <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1 (555) 000-0000" value={formData.phoneNumber} onChange={handleChange} required className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (optional)</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" type="text" placeholder="City, State" value={formData.location} onChange={handleChange} className="h-11" />
                            </div>
                            <Button type="submit" className="w-full h-12 text-md font-semibold mt-2" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Sending OTP...
                                    </span>
                                ) : "Continue"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="otp">One-Time Password</Label>
                                    <Button type="button" variant="link" size="sm" onClick={() => setStep(1)} className="h-auto p-0 text-muted-foreground hover:text-primary">
                                        Go Back
                                    </Button>
                                </div>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    className="h-12 text-center text-xl tracking-widest font-mono"
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xs text-muted-foreground">OTP sent to {formData.phoneNumber}</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleResendOtp}
                                        disabled={loading || resendTimer > 0}
                                        className="text-xs font-semibold"
                                    >
                                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Creating Account...
                                    </span>
                                ) : "Verify & Create Account"}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
