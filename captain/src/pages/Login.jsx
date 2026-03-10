import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Navigate, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

export default function Login() {
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [method, setMethod] = useState("phone"); // default to phone
  const [identifier, setIdentifier] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) {
      toast.error("Please enter email or phone number.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/captain/login", { phoneNumber: identifier });

      setOtpSent(true);
      setResendTimer(60);
      toast.success("OTP sent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await api.post("/auth/resend-otp", { phoneNumber: identifier });
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
      const res = await api.post("/auth/captain/verify-otp", { phoneNumber: identifier, otp });
      // The backend returns { success: true, message: '...', data: { captain, token } }
      login(res.data.data.token, res.data.data.captain);

      toast.success("Login successful!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Fixxr Captain</CardTitle>
            <CardDescription className="text-base mt-2">Welcome back. Login to manage your jobs.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="identifier"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Sending OTP...
                  </span>
                ) : 'Send Login Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="text-sm font-medium">One-Time Password</Label>
                  <Button type="button" variant="link" size="sm" onClick={() => setOtpSent(false)} className="h-auto p-0 text-muted-foreground hover:text-primary">
                    Change Phone Number
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
                <div className="flex flex-col items-center gap-2 mt-2">
                  <p className="text-xs text-muted-foreground text-center">OTP sent to {identifier}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={loading || resendTimer > 0}
                    className="text-xs font-semibold h-auto p-0"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-md font-semibold" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Verifying...
                  </span>
                ) : 'Verify & Login'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up here</Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            By logging in, you agree to our Terms of Service & Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
