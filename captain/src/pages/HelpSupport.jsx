import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Bot, Send, User, HelpCircle, Sparkles } from "lucide-react";
import api from "../services/api";
import { toast } from "sonner";

export default function HelpSupport() {
    const [messages, setMessages] = useState([
        { id: 1, sender: "bot", text: "Hi there! I'm your FixBuddy AI Assistant for Captains. How can I help you today? You can ask me how to manage jobs, get paid, update your live location, or anything else about the app." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const newMsgId = Date.now();
        setMessages((prev) => [...prev, { id: newMsgId, sender: "user", text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/ai/help", { question: userText, role: "CAPTAIN" });
            setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: res.data.data }]);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Sorry, I am having trouble connecting to the AI right now. Please try again.";
            toast.error(errorMsg);
            setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: `Warning: ${errorMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "How do I accept a new job?",
        "When does the customer see my live location?",
        "How do I update my payment hourly rate?",
    ];

    const handleSuggested = (q) => {
        setInput(q);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Help & Support</h1>
                    <p className="text-muted-foreground mt-1">Get immediate assistance on using the Captain app effectively.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
                <Card className="flex flex-col h-[600px] shadow-sm relative overflow-hidden border-border/80">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Sparkles className="w-64 h-64" />
                    </div>
                    <CardHeader className="border-b bg-card z-10 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Captain Assistant
                        </CardTitle>
                        <CardDescription>Powered by Gemini AI</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 z-10">
                        {messages.map((msg) => {
                            const isBot = msg.sender === "bot";
                            return (
                                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                                    <div className="flex gap-3 max-w-[85%]">
                                        {isBot && (
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                <Bot className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                                            isBot 
                                                ? "bg-card border rounded-tl-none leading-relaxed" 
                                                : "bg-primary text-primary-foreground rounded-tr-none"
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {!isBot && (
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm mt-1">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-card border rounded-tl-none flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" />
                                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "0.2s" }} />
                                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" style={{ animationDelay: "0.4s" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-card z-10">
                        <form onSubmit={handleSend} className="flex gap-2 w-full">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 rounded-full h-12 px-4 shadow-sm"
                                disabled={loading}
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                className="h-12 w-12 rounded-full shadow-md"
                                disabled={!input.trim() || loading}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                <div className="space-y-4">
                    <Card className="shadow-sm border-border/80">
                        <CardHeader>
                            <CardTitle className="text-base">Captain Hot Topics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggested(q)}
                                    className="block w-full text-left text-sm p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm border-primary/20 bg-primary/5">
                        <CardContent className="p-5 flex items-start gap-4">
                            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-sm">Captain AI Support</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    Instant answers using Gemini AI. If you have an account or payment issue, please contact <a href="mailto:captains@fixbuddy.com" className="text-primary hover:underline">captains@fixbuddy.com</a>.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
