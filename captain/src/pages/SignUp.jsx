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

export default function SignUp() {
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/captain/signup", formData);
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
      const res = await api.post("/auth/captain/verify-otp", { phoneNumber: formData.phoneNumber, otp });
      login(res.data.data.token, res.data.data.captain);

      toast.success("Sign Up successful!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Join Fixxr Captain</CardTitle>
            <CardDescription className="text-base mt-2">Become a professional partner today.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-md font-semibold mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Sending OTP...
                  </span>
                ) : 'Sign Up & Get Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="text-sm font-medium">One-Time Password</Label>
                  <Button type="button" variant="link" size="sm" onClick={() => setOtpSent(false)} className="h-auto p-0 text-muted-foreground hover:text-primary">
                    Edit Details
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
                  <p className="text-xs text-muted-foreground text-center">OTP sent to {formData.phoneNumber}</p>
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
                ) : 'Verify & Complete'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in here</Link>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service & Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
