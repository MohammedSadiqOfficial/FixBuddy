import React, { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { MapPin, Image as ImageIcon, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(AuthContext);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/captain/requests');
        const formattedRequests = res.data.data
          // Only show PENDING requests in this feed (ACCEPTED/ONGOING belong in ActiveJob)
          .filter(req => req.status === 'PENDING')
          .map(req => ({
            id: req.id,
            user: req.user,
            description: req.description || req.title,
            distance: req.location || "N/A",
            time: new Date(req.createdAt).toLocaleDateString(),
            images: req.images ? req.images.length : 0,
            category: req.serviceType || "General",
            status: req.status,
            isTargeted: !!req.captainId // true if this was sent specifically to this captain
          }));

        setRequests(formattedRequests);
      } catch (err) {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Register with socket and listen for real-time events
  useEffect(() => {
    if (!socket || !captain) return;

    // Join shared captains room so we receive broadcast events
    socket.emit("register_captain", captain.id);

    // When another captain accepts a request, remove it from our feed instantly
    const handleRequestAccepted = ({ requestId, captainId: acceptedBy }) => {
      // If WE accepted it, we navigate away already — this handles OTHER captains' UIs
      if (acceptedBy !== captain.id) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast.info("A request was just accepted by another captain.", { duration: 3000 });
      }
    };

    socket.on("request_accepted", handleRequestAccepted);

    return () => {
      socket.off("request_accepted", handleRequestAccepted);
    };
  }, [socket, captain]);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/captain/request/${id}/status`, { status: "ACCEPTED" });
      toast.success("Job accepted!");
      navigate(`/job/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept job");
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/captain/request/${id}/status`, { status: "CANCELLED" });
      setRequests(prev => prev.filter(req => req.id !== id));
      toast.info("Request rejected and removed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-muted p-6 rounded-full mb-4">
          <Check className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">No New Requests</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          You're all caught up! Make sure your status is "Online" to receive new job requests in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Incoming Requests</h1>
        <p className="text-muted-foreground mt-1">Review and accept jobs near you.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {requests.map((req) => (
          <Card key={req.id} className="shadow-md flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarImage src={req.user?.profileImage} alt={req.user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {req.user?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {req.user?.name || "Unknown User"}
                        <Badge variant="outline" className="ml-2 bg-background">{req.category}</Badge>
                        {req.isTargeted && (
                          <Badge className="ml-1 bg-primary/90 text-primary-foreground text-xs">
                            Direct Request
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1 gap-4">
                        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" />{req.distance}</span>
                        <span>{req.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{req.description}</p>
                {req.images > 0 && (
                  <div className="mt-4 flex gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">
                      <ImageIcon className="h-3 w-3" />
                      {req.images} attached images
                    </Badge>
                  </div>
                )}
              </CardContent>
            </div>
            <CardFooter className="flex gap-3 pt-2 pb-4">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                onClick={() => handleReject(req.id)}
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleAccept(req.id)}
              >
                <Check className="mr-2 h-4 w-4" /> Accept Job
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
