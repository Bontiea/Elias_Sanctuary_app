
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Send, User, Infinity as InfinityIcon } from "lucide-react";
import { UserProfile, ChatMessage, UserMemory } from "@/api/entities";
import { aiCompanion } from "@/api/functions";
import TypingIndicator from "../components/companion/TypingIndicator";

export default function CompanionPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userMemoryCount, setUserMemoryCount] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const profiles = await UserProfile.list();
                let currentProfile = profiles.length > 0 ? profiles[0] : null;
                setUserProfile(currentProfile);

                const userMemories = await UserMemory.filter({ is_user_managed: true });
                setUserMemoryCount(userMemories.length);

                const chatHistory = await ChatMessage.list("-timestamp", 100); // Increased limit
                setMessages(chatHistory.reverse());
                
            } catch (error) {
                console.error("Error loading chat data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (input.trim() === "" || isLoading) return;

        const userMessage = { message: input, sender: "user", timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        await ChatMessage.create(userMessage);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            const conversationHistory = [...messages, userMessage].slice(-10);
            const response = await aiCompanion({ message: input, conversationHistory, userProfile });

            setTimeout(async () => {
                setIsTyping(false);
                
                if (response.data && response.data.message) {
                    const companionMessage = { 
                        id: `msg_${Date.now()}`,
                        message: response.data.message, 
                        sender: "companion", 
                        timestamp: new Date().toISOString() 
                    };
                    setMessages(prev => [...prev, companionMessage]);
                    await ChatMessage.create(companionMessage);

                    const userMemories = await UserMemory.filter({ is_user_managed: true });
                    setUserMemoryCount(userMemories.length);
                }
            }, Math.random() * 1000 + 500);
        } catch (error) {
            console.error("Error with AI Companion:", error);
            setIsTyping(false);
            const errorMessage = { 
                id: `msg_${Date.now()}_error`,
                message: "I'm having a little trouble connecting right now. Please try again in a moment.", 
                sender: "companion", 
                timestamp: new Date().toISOString() 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 bg-gradient-to-br from-purple-200 via-indigo-200 to-purple-300">
            <Card className="flex-1 flex flex-col shadow-2xl border-purple-100 bg-white/90 backdrop-blur-lg overflow-hidden">
                <CardHeader className="border-b border-purple-100 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-purple-700">
                        <InfinityIcon className="w-6 h-6" />
                        AI Companion
                        {userProfile?.display_name && (
                            <span className="text-sm font-normal text-purple-500">
                                • {userProfile.display_name}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'companion' && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                    <InfinityIcon className="w-6 h-6 text-white"/>
                                </div>
                            )}
                            <div className={`relative group max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl p-4 shadow-sm ${
                                msg.sender === 'user' 
                                    ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-br-sm' 
                                    : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-800 rounded-bl-sm border border-purple-100'
                            }`}>
                                <p className="leading-relaxed whitespace-pre-line" style={{
                                    color: msg.sender === 'user' ? 'white' : '#4a305c'
                                }}>{msg.message}</p>
                            </div>
                             {msg.sender === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-purple-600"/>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex items-end gap-3 justify-start">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                <InfinityIcon className="w-6 h-6 text-white"/>
                            </div>
                            <TypingIndicator />
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </CardContent>
                
                <CardFooter className="border-t border-purple-100 p-4 bg-white/50 backdrop-blur-sm">
                    <div className="flex w-full items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Share what's on your heart..." 
                            className="flex-1 border-purple-200 focus:border-purple-400 bg-white/80"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} disabled={isLoading || input.trim() === ""} className="bg-purple-600 hover:bg-purple-700">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
