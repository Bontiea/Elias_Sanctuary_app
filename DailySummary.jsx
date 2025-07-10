import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Heart, Sparkles, Zap } from 'lucide-react';
import { EmotionLog, JournalEntry, ExerciseCompletion, DailyContent } from '@/api/entities';
import { format, startOfDay, endOfDay, isValid } from 'date-fns';

export default function DailySummaryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dateStr = params.get('date');
        
        if (dateStr) {
            const parsedDate = new Date(dateStr + 'T00:00:00');
            if (isValid(parsedDate)) {
                setDate(parsedDate);
                fetchSummaryData(parsedDate);
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [location.search]);

    const fetchSummaryData = async (selectedDate) => {
        setIsLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const start = startOfDay(selectedDate).toISOString();
        const end = endOfDay(selectedDate).toISOString();

        try {
            const [emotionLogs, journalEntries, exerciseCompletions, dailyContent] = await Promise.all([
                EmotionLog.filter({ date: dateString }),
                JournalEntry.filter({ created_date: { $gte: start, $lt: end } }),
                ExerciseCompletion.filter({ completion_date: dateString }),
                DailyContent.filter({ date: dateString })
            ]);

            setSummaryData({
                emotionLogs,
                journalEntries,
                exerciseCompletions,
                dailyContent: dailyContent.length > 0 ? dailyContent[0] : null
            });
        } catch (error) {
            console.error("Error fetching summary data:", error);
            setSummaryData(null);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const hasData = summaryData && (
        summaryData.emotionLogs.length > 0 ||
        summaryData.journalEntries.length > 0 ||
        summaryData.exerciseCompletions.length > 0 ||
        summaryData.dailyContent
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-700 hover:bg-purple-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Calendar
                </Button>

                <h1 className="text-3xl font-bold text-purple-800 mb-6">
                    Summary for {date ? format(date, 'MMMM d, yyyy') : '...'}
                </h1>

                {!hasData ? (
                    <Card className="text-center p-8 bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
                        <CardTitle className="text-purple-700">No Activity Recorded</CardTitle>
                        <CardContent className="mt-2 text-gray-600">
                            There is no data available for this day.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {summaryData.emotionLogs.length > 0 && (
                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700"><Heart className="text-pink-500"/>Daily Check-in</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {summaryData.emotionLogs.map(log => (
                                        <div key={log.id} className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                                            <p>You felt <span className="font-semibold capitalize">{log.emotion}</span> with an energy level of <span className="font-semibold">{log.energy_level}/10</span>.</p>
                                            {log.notes && <p className="text-sm text-gray-600 mt-1 italic">Notes: "{log.notes}"</p>}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                        
                        {summaryData.journalEntries.length > 0 && (
                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700"><BookOpen className="text-yellow-600"/>Journal Entries</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {summaryData.journalEntries.map(entry => (
                                        <div key={entry.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <h4 className="font-semibold text-purple-800 mb-2">{entry.title || 'Untitled Entry'}</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Written at {format(new Date(entry.created_date), 'h:mm a')}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {summaryData.exerciseCompletions.length > 0 && (
                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700"><Zap className="text-indigo-500"/>Completed Exercises</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        {summaryData.exerciseCompletions.map(ex => (
                                            <div key={ex.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                <p className="font-medium text-gray-800">{ex.exercise_name}</p>
                                                <p className="text-sm text-gray-600 capitalize">Category: {ex.category}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {summaryData.dailyContent && (
                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-700"><Sparkles className="text-purple-500"/>Daily Guidance</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-purple-800 mb-2">Today's Affirmation</h4>
                                        <p className="p-3 bg-purple-50 rounded-lg border border-purple-100 italic">"{summaryData.dailyContent.todays_affirmation}"</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-800 mb-2">Daily Reflection</h4>
                                        <p className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">{summaryData.dailyContent.daily_reflection}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-purple-800 mb-2">Thought of the Day</h4>
                                        <p className="p-3 bg-amber-50 rounded-lg border border-amber-100">{summaryData.dailyContent.thought_of_the_day}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}