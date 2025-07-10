
import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { User, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [personalDetails, setPersonalDetails] = useState('');
    const [memorySettings, setMemorySettings] = useState([]);
    
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const profiles = await UserProfile.list();
        if (profiles.length > 0) {
            setProfile(profiles[0]);
            setDisplayName(profiles[0].display_name || '');
            setPersonalDetails(profiles[0].personal_details || '');
            setMemorySettings(profiles[0].memory_settings || []);
        } else {
             // Create a profile if it doesn't exist
            const newProfile = await UserProfile.create({});
            setProfile(newProfile);
        }
    };
    
    const handleSave = async () => {
        if (!profile) return;
        const updatedData = {
            display_name: displayName,
            personal_details: personalDetails,
            memory_settings: memorySettings
        };
        await UserProfile.update(profile.id, updatedData);
        alert("Profile saved!");
    };
    
    const addMemoryItem = () => {
        setMemorySettings([...memorySettings, { key: '', value: '', category: 'note' }]);
    };
    
    const updateMemoryItem = (index, field, value) => {
        const newMemory = [...memorySettings];
        newMemory[index][field] = value;
        setMemorySettings(newMemory);
    };

    const removeMemoryItem = (index) => {
        setMemorySettings(memorySettings.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                 <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-700 hover:bg-purple-50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-purple-800 mb-6 flex items-center gap-3"><User /> Your Profile</h1>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Personalize Your Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-semibold">Display Name</label>
                            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should your companion address you?" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-semibold">About You</label>
                            <Textarea value={personalDetails} onChange={(e) => setPersonalDetails(e.target.value)} placeholder="Share anything you'd like your companion to know about you."/>
                        </div>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Memory Settings</h3>
                                <Button variant="outline" size="sm" onClick={addMemoryItem}><Plus className="mr-2 h-4 w-4"/> Add Memory</Button>
                            </div>
                            <div className="space-y-3">
                                {memorySettings.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                                        <Input value={item.key} onChange={(e) => updateMemoryItem(index, 'key', e.target.value)} placeholder="Memory Key (e.g., 'My Goal')"/>
                                        <Input value={item.value} onChange={(e) => updateMemoryItem(index, 'value', e.target.value)} placeholder="Memory Value (e.g., 'To practice mindfulness daily')"/>
                                        <Select value={item.category} onValueChange={(val) => updateMemoryItem(index, 'category', val)}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="preference">Preference</SelectItem>
                                                <SelectItem value="goal">Goal</SelectItem>
                                                <SelectItem value="need">Need</SelectItem>
                                                <SelectItem value="note">Note</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" onClick={() => removeMemoryItem(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                            <Save className="mr-2 h-4 w-4"/> Save Profile
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
