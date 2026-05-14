import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { MapPin, Send, Phone, CheckCircle, Clock, MoreVertical, DollarSign, PlayCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.divIcon({
    html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3b82f6;"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const CaptainIcon = L.divIcon({
    html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #22c55e;"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

export default function ActiveJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [jobStatus, setJobStatus] = useState("accepted");
  const [userLocation, setUserLocation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/captain/service-request/${id}`);
        const data = res.data.data;
        setJob({
          ...data,
          targetUserId: data.userId || data.user?.id,
          customerName: data.user?.name || "Unknown User",
          displayAddress: data.location || "Location not provided",
          displayAmount: data.status === "COMPLETED" 
            ? `$${data.amount?.toFixed(2) || "0.00"}` 
            : (data.captain?.hourlyRate ? `$${data.captain.hourlyRate}/hr` : "TBD")
        });
        setJobStatus(data.status.toLowerCase());

        const msgRes = await api.get(`/chat/${id}`);
        const chatMsgs = msgRes.data.data.map(m => ({
          id: m.id,
          sender: m.senderId === captain?.id ? "captain" : "user",
          text: m.text,
          createdAt: m.createdAt
        }));
        setMessages(chatMsgs);
      } catch (err) {
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    if (id && captain) fetchJob();
  }, [id, captain]);

  useEffect(() => {
    if (socket && id) {
      socket.emit("join_request_room", id);
      socket.on("receive_message", (msg) => {
        if (msg.serviceRequestId === id && msg.senderId !== captain?.id) {
          setMessages((prev) => [...prev, {
            id: msg.id || Date.now().toString(),
            sender: "user",
            text: msg.text,
            createdAt: msg.createdAt
          }]);
        }
      });
      socket.on("user_location_update", (data) => {
        if (data.serviceRequestId === id) {
          setUserLocation({ latitude: data.latitude, longitude: data.longitude });
        }
      });
      return () => {
        socket.off("receive_message");
        socket.off("user_location_update");
      };
    }
  }, [socket, id, captain?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !captain || !job) return;
    const text = newMessage.trim();
    const receiverId = job.targetUserId;
    if (!receiverId) { toast.error("Cannot determine recipient."); return; }
    setNewMessage("");
    try {
      const res = await api.post("/chat/send", { serviceRequestId: id, senderId: captain.id, receiverId, text });
      const savedMsg = res.data.data;
      setMessages((prev) => [...prev, { id: savedMsg.id, sender: "captain", text: savedMsg.text, createdAt: savedMsg.createdAt }]);
      if (socket) {
        socket.emit("send_message", { serviceRequestId: id, text: savedMsg.text, senderId: captain.id, receiverId });
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleStartWork = async () => {
    try {
      await api.patch(`/captain/request/${id}/status`, { status: "ONGOING" });
      setJobStatus("ongoing");
      toast.success("Work started!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCompleteWork = async () => {
    try {
      await api.patch(`/captain/request/${id}/status`, { status: "COMPLETED" });
      setJobStatus("completed");
      toast.success("Job marked as completed!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      toast.error("Failed to complete job");
    }
  };

  const getStatusVariant = (s) => {
    if (s === "completed") return "default";
    if (s === "ongoing") return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Active Job <span className="text-muted-foreground font-mono text-xl">#{job.id.substring(0, 8)}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Chat with the customer and manage job status.</p>
        </div>
        <Badge className="px-3 py-1 text-sm uppercase" variant={getStatusVariant(jobStatus)}>
          {jobStatus.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Compact Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={job.user?.profileImage} alt={job.customerName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {job.customerName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                    <CardTitle className="text-xl mt-0.5">{job.customerName}</CardTitle>
                  </div>
                </div>
              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.open(`tel:${job.user?.phoneNumber || ""}`)}>
                    <Phone className="h-4 w-4 mr-2" /> Call Customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="flex justify-between">
                    <span className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Est. Payout</span>
                    <span className="font-bold text-primary">{job.displayAmount}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {jobStatus === "accepted" && (
                    <DropdownMenuItem onClick={handleStartWork} className="text-blue-600 focus:text-blue-600">
                      <PlayCircle className="h-4 w-4 mr-2" /> Start Work
                    </DropdownMenuItem>
                  )}
                  {jobStatus === "ongoing" && (
                    <DropdownMenuItem onClick={handleCompleteWork} className="text-green-600 focus:text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" /> Complete Job
                    </DropdownMenuItem>
                  )}
                  {jobStatus === "completed" && (
                    <DropdownMenuItem disabled className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" /> Completed
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm">{job.displayAddress}</p>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="text-sm text-muted-foreground italic leading-relaxed">"{job.description}"</p>

              {job.images && job.images.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" /> Attached Work Photos
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {job.images.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border bg-muted cursor-zoom-in group relative">
                        <img 
                          src={img} 
                          alt={`Work ${idx + 1}`} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                          onClick={() => window.open(img, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {userLocation && (
                <div className="mt-4 border rounded-xl overflow-hidden h-48 relative">
                  <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[userLocation.latitude, userLocation.longitude]} icon={UserIcon}>
                      <Popup>Customer's Live Location</Popup>
                    </Marker>
                    {captain?.latitude && captain?.longitude && (
                      <Marker position={[captain.latitude, captain.longitude]} icon={CaptainIcon}>
                        <Popup>Your Location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                  <div className="absolute bottom-2 left-2 z-[400] text-xs font-semibold bg-background/90 px-2 py-1 rounded-full shadow border">
                    LIVE TRACKING
                  </div>
                </div>
              )}
            </CardContent>

            {/* Status action bar at bottom of card */}
            {jobStatus !== "completed" && (
              <CardFooter className="pt-0 pb-4">
                {jobStatus === "accepted" && (
                  <Button className="w-full" onClick={handleStartWork}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Start Work
                  </Button>
                )}
                {jobStatus === "ongoing" && (
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleCompleteWork}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete
                  </Button>
                )}
              </CardFooter>
            )}
            {jobStatus === "completed" && (
              <CardFooter className="pt-0 pb-4">
                <div className="w-full text-center py-2 rounded-lg bg-green-500/10 text-green-700 font-semibold text-sm flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Job Completed Successfully
                  </div>
                  <div className="text-xs font-bold text-primary">Earned: {job.displayAmount}</div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="md:col-span-2 flex flex-col h-[600px] shadow-sm">
          <CardHeader className="border-b py-4 px-6 flex-none">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Chat with {job.customerName}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No messages yet. Say hi!
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender === "captain";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="py-3 px-4 border-t bg-card mt-auto">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                disabled={jobStatus === "completed"}
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim() || jobStatus === "completed"}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
