
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { EmotionLog } from "@/api/entities";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Flame, Activity, TrendingUp, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const emotions = [
    { name: "joyful", icon: "😊" }, { name: "peaceful", icon: "😌" }, { name: "content", icon: "🙂" },
    { name: "neutral", icon: "😐" }, { name: "anxious", icon: "😟" }, { name: "sad", icon: "😢" },
    { name: "frustrated", icon: "😠" }, { name: "overwhelmed", icon: "🤯" },
];

export default function CheckinPage() {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [energyLevel, setEnergyLevel] = useState([5]);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!selectedEmotion) {
            setFeedback("Please select how you're feeling.");
            return;
        }
        setIsSubmitting(true);
        setFeedback("");
        try {
            await EmotionLog.create({
                date: new Date().toISOString().split('T')[0],
                emotion: selectedEmotion,
                energy_level: energyLevel[0],
                notes: notes,
            });
            setFeedback("Your check-in has been saved. Thank you for sharing.");
            setSelectedEmotion(null);
            setEnergyLevel([5]);
            setNotes("");
        } catch (error) {
            console.error("Error submitting check-in:", error);
            setFeedback("Sorry, there was an error saving your check-in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <Card className="w-full max-w-2xl mx-auto shadow-2xl border-purple-100 bg-white/80 backdrop-blur-lg">
                <CardHeader className="px-6 pt-8 pb-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 text-purple-600 hover:bg-purple-50">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back
                    </Button>
                    <CardTitle className="flex items-center gap-3 text-gray-900 text-4xl font-extrabold tracking-tight">
                        <Heart className="w-10 h-10 text-purple-500" />
                        Daily Check-in
                    </CardTitle>
                    <p className="text-xl text-gray-600 mt-2">How are you feeling right now?</p>
                </CardHeader>
                <CardContent className="space-y-8 px-6 md:px-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">How would you describe your current emotional state?</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {emotions.map((emotion) => (
                                <Button 
                                    key={emotion.name} 
                                    variant={selectedEmotion === emotion.name ? "default" : "outline"}
                                    onClick={() => setSelectedEmotion(emotion.name)}
                                    className={`h-auto p-4 flex flex-col gap-2 capitalize transition-all duration-200 ${selectedEmotion === emotion.name ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'}`}
                                >
                                    <span className="text-3xl">{emotion.icon}</span>
                                    {emotion.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">What's your energy level? ({energyLevel[0]}/10)</h3>
                        <Slider
                            defaultValue={[5]}
                            max={10}
                            step={1}
                            value={energyLevel}
                            onValueChange={setEnergyLevel}
                            className="[&>span:first-child]:h-3 [&>span:first-child]:w-3"
                        />
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Any thoughts to share? (Optional)</h3>
                        <Textarea 
                            placeholder="Jot down what's on your mind..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center gap-4">
                    {feedback && <p className="text-sm text-purple-600">{feedback}</p>}
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full max-w-xs bg-purple-600 hover:bg-purple-700">
                        {isSubmitting ? "Saving..." : "Save Check-in"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
