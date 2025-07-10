import React, { useState, useEffect } from "react";
import { JournalEntry } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function JournalPage() {
    const [entries, setEntries] = useState([]);
    const [view, setView] = useState("list"); // 'list' or 'new'
    const [currentEntry, setCurrentEntry] = useState({ title: "", content: "" });
    const [selectedEntry, setSelectedEntry] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (view === "list") {
            loadEntries();
        }
    }, [view]);

    const loadEntries = async () => {
        const data = await JournalEntry.list("-created_date");
        setEntries(data);
    };

    const handleSave = async () => {
        await JournalEntry.create(currentEntry);
        setCurrentEntry({ title: "", content: "" });
        setView("list");
    };
    
    const handleDelete = async (id) => {
        await JournalEntry.delete(id);
        loadEntries();
    }

    if (view === "new" || selectedEntry) {
        return (
            <div className="p-6 h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
                <Card className="w-full max-w-3xl shadow-xl">
                    <CardHeader>
                        <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSelectedEntry(null); }} className="mb-4 text-purple-600 hover:bg-purple-50">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Journal
                        </Button>
                        <CardTitle className="text-2xl text-purple-700">New Journal Entry</CardTitle>
                        <p className="text-sm text-purple-600">
                            {format(new Date(), 'EEEE, MMMM d, yyyy • h:mm a')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input 
                            placeholder="Entry Title (Optional)"
                            value={currentEntry.title}
                            onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                        />
                        <Textarea 
                            placeholder="Let your thoughts flow..." 
                            className="h-64"
                            value={currentEntry.content}
                            onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => { setView('list'); setSelectedEntry(null); }}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">Save Entry</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="p-6 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-purple-800 flex items-center gap-3"><BookOpen /> Your Journal</h1>
                <Button onClick={() => setView('new')} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" /> New Entry
                </Button>
            </div>
             <div className="space-y-4 max-w-4xl mx-auto">
                {entries.map(entry => (
                    <Card key={entry.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-purple-100">
                        <CardHeader className="flex flex-row justify-between items-start">
                            <div className="flex-1">
                                <CardTitle className="text-purple-800">{entry.title || "Untitled Entry"}</CardTitle>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-sm font-medium text-purple-600">
                                        {format(new Date(entry.created_date), 'EEEE, MMMM d, yyyy')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Written at {format(new Date(entry.created_date), 'h:mm a')}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-red-500 hover:bg-red-50">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="line-clamp-3 text-gray-700 leading-relaxed">{entry.content}</p>
                        </CardContent>
                    </Card>
                ))}
                
                {entries.length === 0 && (
                    <Card className="text-center p-8 bg-white/80 backdrop-blur-sm border-purple-100">
                        <CardContent>
                            <BookOpen className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-purple-700 mb-2">No Journal Entries Yet</h3>
                            <p className="text-gray-600 mb-4">Start documenting your healing journey today.</p>
                            <Button onClick={() => setView('new')} className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="mr-2 h-4 w-4" /> Write Your First Entry
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}