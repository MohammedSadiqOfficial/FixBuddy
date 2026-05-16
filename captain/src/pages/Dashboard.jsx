import React, { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { CheckCircle2, Clock, DollarSign, Activity, MapPin, ArrowRight, Sparkles, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import api from "../services/api";
import { BrandWordmark } from "../components/BrandWordmark";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default leaflet marker icons
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserDot = L.divIcon({
  html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const CaptainDot = L.divIcon({
  html: `<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(34,197,94,0.3);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Helper: auto-pan map when position updates
function MapPanner({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Dashboard() {
  const { captain, setCaptain } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, requestsRes] = await Promise.all([
          api.get("/captain/stats"),
          api.get("/captain/requests"),
        ]);

        const statsData = statsRes.data.data;
        const requestsData = requestsRes.data.data || [];

        setStats({
          completedJobs: statsData.totalJobs,
          pendingRequests: statsData.activeJobs,
          earnings: statsData.totalEarnings || 0,
          recentJobs: requestsData.slice(0, 5).map((req) => ({
            id: req.id,
            title: req.title || req.serviceType,
            status: req.status.toLowerCase(),
            date: new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            amount: req.amount || 0,
            user: req.user,
          })),
        });

        // Pick up active job from stats endpoint (includes user info)
        const active = statsData.activeJob || null;
        if (active) {
          setActiveJob(active);
        }
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Get captain's own location from browser
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCaptainLocation({ latitude, longitude });
        // Also push to backend & socket so user can see
        if (socket && captain) {
          socket.emit("update_location", { captainId: captain.id, latitude, longitude });
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [socket, captain]);

  // Listen for user location updates via socket (active job)
  useEffect(() => {
    if (!socket || !activeJob) return;

    // Register captain to receive broadcasts
    if (captain) socket.emit("register_captain", captain.id);

    // Join the active job room to receive user location pings
    socket.emit("join_request_room", activeJob.id);

    const handleUserLocation = (data) => {
      if (data.serviceRequestId === activeJob.id) {
        setUserLocation({ latitude: data.latitude, longitude: data.longitude });
      }
    };

    socket.on("user_location_update", handleUserLocation);
    return () => socket.off("user_location_update", handleUserLocation);
  }, [socket, activeJob, captain]);

  const toggleStatus = async () => {
    try {
      const res = await api.patch("/captain/toggle-active");
      const newStatus = res.data.data.isActive;
      setCaptain({ ...captain, isActive: newStatus });
      toast.success(`You are now ${newStatus ? "Online" : "Offline"}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const isOnline = captain?.isActive || false;

  // Map center: prefer user location, fall back to captain's own location
  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : captainLocation
    ? [captainLocation.latitude, captainLocation.longitude]
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero header */}
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-primary via-primary to-slate-800 px-6 py-7 text-primary-foreground shadow-[0_24px_60px_rgba(15,23,42,0.22)] md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <BrandWordmark subtitle="Captain Dashboard" light className="mb-5" />
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Run your jobs with more clarity and less friction.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/72 md:text-base">
              Track requests, stay available for the right work, and keep your customer experience polished from first response to completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-full bg-white/10 px-4 py-3 backdrop-blur">
            <span className="text-sm font-semibold">Status</span>
            <Badge
              variant={isOnline ? "default" : "secondary"}
              className={isOnline ? "bg-[#22c55e] text-white hover:bg-[#16a34a]" : "bg-white/15 text-white hover:bg-white/20"}
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={toggleStatus}
            >
              Go {isOnline ? "Offline" : "Online"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats?.earnings?.toFixed(2)}</div>
            <p className="text-xs flex items-center mt-1 text-green-500">
              <Activity className="mr-1 h-3 w-3" /> Real-time Earnings
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jobs Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Great job!</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingRequests}</div>
            <Link to="/requests" className="mt-1 inline-flex items-center text-xs text-primary hover:underline">
              View all requests <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Active Job Live Map */}
      {activeJob && (
        <Card className="rounded-[1.75rem] border-border/70 shadow-sm overflow-hidden">
          <CardHeader className="border-b flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Live Customer Location</CardTitle>
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Customer
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> You
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                <Link to={`/job/${activeJob.id}`}>Open Job</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Customer info strip */}
            <div className="flex items-center gap-3 px-5 py-3 bg-muted/30 border-b">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={activeJob.user?.profileImage} />
                <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                  {activeJob.user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{activeJob.user?.name || "Customer"}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {activeJob.location || "Location not provided"}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto capitalize text-xs">
                {activeJob.status.toLowerCase()}
              </Badge>
            </div>

            {/* Map */}
            {mapCenter ? (
              <div className="h-72 w-full relative">
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapPanner center={mapCenter} />
                  {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={UserDot}>
                      <Popup>
                        <strong>{activeJob.user?.name || "Customer"}</strong>
                        <br />Live Location
                      </Popup>
                    </Marker>
                  )}
                  {captainLocation && (
                    <Marker position={[captainLocation.latitude, captainLocation.longitude]} icon={CaptainDot}>
                      <Popup>Your Location</Popup>
                    </Marker>
                  )}
                </MapContainer>
                {!userLocation && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-[400]">
                    <div className="flex h-2 w-2 mb-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </div>
                    <p className="text-sm font-medium">Waiting for customer&apos;s live location…</p>
                    <p className="text-xs text-muted-foreground mt-1">Map will update automatically</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                <MapPin className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Waiting for location data…</p>
                <p className="text-xs mt-1 opacity-60">Enable location on your device</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bottom section: recent jobs + focus card */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-[1.75rem] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Job History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentJobs?.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No jobs found yet.</p>
              ) : (
                stats?.recentJobs?.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/30 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={job.user?.profileImage} alt={job.user?.name} />
                        <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                          {job.user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="mt-0.5 flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" /> {job.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${job.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-border/70 bg-gradient-to-br from-accent to-secondary shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              <CardTitle className="text-base">Today&apos;s Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Availability</p>
              <p className="mt-2 text-sm font-semibold">
                {isOnline
                  ? "You are visible for new requests right now."
                  : "Turn online when you are ready to accept nearby work."}
              </p>
            </div>
            <div className="rounded-2xl bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Momentum</p>
              <p className="mt-2 text-sm font-semibold">
                {stats?.pendingRequests || 0} active jobs need attention and {stats?.completedJobs || 0} jobs are already completed.
              </p>
            </div>
            <Button asChild className="h-11 w-full rounded-full font-semibold">
              <Link to="/requests">Review Incoming Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
