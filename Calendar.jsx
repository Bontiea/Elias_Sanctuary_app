
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { EmotionLog, ExerciseCompletion } from "@/api/entities";
import { format, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CalendarPage() {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date());
    const [emotionLogs, setEmotionLogs] = useState([]);
    const [exerciseLogs, setExerciseLogs] = useState([]);

    useEffect(() => {
        const loadAllActivity = async () => {
            try {
                const emotionData = await EmotionLog.list('-date');
                setEmotionLogs(emotionData);
                
                const exerciseData = await ExerciseCompletion.list('-completion_date');
                setExerciseLogs(exerciseData);
            } catch (error) {
                console.error("Error loading activity data:", error);
            }
        };
        loadAllActivity();
    }, []);

    const handleDateSelect = (selectedDate) => {
        if (selectedDate) {
            setDate(selectedDate);
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            navigate(createPageUrl(`DailySummary?date=${dateString}`));
        }
    };

    const emotionDays = emotionLogs.map(log => new Date(log.date + 'T00:00:00')).filter(Boolean);
    const exerciseDays = exerciseLogs.map(log => new Date(log.completion_date + 'T00:00:00')).filter(Boolean);

    return (
        <div className="h-full p-4 md:p-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-md shadow-2xl border-purple-100 bg-white/80 backdrop-blur-lg">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3 text-purple-700">
                            <CalendarIcon className="w-6 h-6" />
                            Your Healing Journey
                        </CardTitle>
                        <p className="text-sm text-gray-500">Select a day to review your progress.</p>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="p-0 flex justify-center"
                            modifiers={{
                                checkedIn: emotionDays,
                                exercised: exerciseDays,
                            }}
                            modifiersStyles={{
                                checkedIn: { 
                                    color: 'white',
                                    backgroundColor: '#A78BFA',
                                    fontWeight: 'bold'
                                },
                                exercised: {
                                    borderColor: '#6D28D9',
                                    borderWidth: '2px'
                                }
                            }}
                        />
                         <div className="mt-6 pt-4 border-t border-purple-100 space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-[#A78BFA]"></div>
                                <span>Day with a Check-in</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-[#6D28D9]"></div>
                                <span>Day with a Completed Exercise</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
