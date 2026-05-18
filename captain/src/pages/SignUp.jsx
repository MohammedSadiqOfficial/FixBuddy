import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Navigate, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import { BrandWordmark } from "../components/BrandWordmark";

export default function SignUp() {
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [deliveryTarget, setDeliveryTarget] = useState("");
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
      const response = await api.post("/auth/captain/signup", formData);
      setDeliveryTarget(response.data?.data?.deliveryTarget || formData.email);
      setOtpSent(true);
      setResendTimer(60);
      toast.success("OTP sent to your email!");
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
      await api.post("/auth/resend-otp", { email: formData.email });
      setResendTimer(60);
      toast.success("OTP resent to your email!");
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
      const res = await api.post("/auth/captain/verify-otp", { email: formData.email, otp });
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
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden rounded-[36px] border border-border/70 bg-card shadow-[0_30px_120px_rgba(15,23,42,0.1)] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left Panel */}
        <div className="relative hidden overflow-hidden bg-primary px-8 py-10 text-primary-foreground lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.25),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <BrandWordmark subtitle="Captain portal" compact light />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/65">Join the team</p>
              <h1 className="mt-4 max-w-md text-5xl font-extrabold tracking-[-0.08em]">
                Become a FixBuddy Captain.
              </h1>
              <p className="mt-6 max-w-md text-base leading-8 text-primary-foreground/78">
                Sign up with your phone number and email. We'll verify with a one-time code sent straight to your inbox.
              </p>
              <div className="mt-10 space-y-4">
                <Feature icon={ShieldCheck} text="Email-based OTP verification" />
                <Feature icon={Briefcase} text="Start accepting jobs right away" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <BrandWordmark subtitle="Captain portal" compact />
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="space-y-8 pt-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {otpSent ? "Verify your email" : "Create your account"}
                  </p>
                  <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.06em]">
                    {otpSent ? "Confirm the code we sent." : "Join FixBuddy."}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">
                    {otpSent
                      ? `Enter the six-digit code sent to ${deliveryTarget || formData.email}.`
                      : "Fill in your details and we'll email you a verification code."}
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <Field label="Full Name" id="name">
                      <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleInputChange} className="h-14 rounded-2xl border-border/80 px-4 text-base" required />
                    </Field>
                    <Field label="Email Address" id="email">
                      <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} className="h-14 rounded-2xl border-border/80 px-4 text-base" required />
                    </Field>
                    <Field label="Phone Number" id="phoneNumber">
                      <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+91 98765 43210" value={formData.phoneNumber} onChange={handleInputChange} className="h-14 rounded-2xl border-border/80 px-4 text-base" required />
                    </Field>
                    <Field label="Password" id="password">
                      <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="h-14 rounded-2xl border-border/80 px-4 text-base" required />
                    </Field>
                    <Button type="submit" className="h-14 w-full rounded-full text-base font-semibold" disabled={loading}>
                      {loading ? "Sending code..." : "Continue"}
                      {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Verification code</Label>
                        <Button type="button" variant="link" className="h-auto p-0 font-semibold" onClick={() => setOtpSent(false)}>
                          Go back
                        </Button>
                      </div>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="h-16 rounded-2xl border-border/80 text-center font-mono text-2xl tracking-[0.5em]"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't get the code?"}</span>
                      <Button type="button" variant="ghost" className="rounded-full font-semibold" disabled={loading || resendTimer > 0} onClick={handleResendOtp}>
                        Resend
                      </Button>
                    </div>
                    <Button type="submit" className="h-14 w-full rounded-full text-base font-semibold" disabled={loading}>
                      {loading ? "Creating account..." : "Verify and create account"}
                    </Button>
                  </form>
                )}

                <div className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                    Log in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-primary-foreground/82">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/10">
        <Icon className="h-4 w-4" />
      </div>
      <span>{text}</span>
    </div>
  );
}
