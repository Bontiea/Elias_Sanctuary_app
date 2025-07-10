import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ProfileSettings() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        display_name: '',
        personal_details: '',
        tone_preference: 'warm_comforting',
        spiritual_tone: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                const profiles = await UserProfile.list();
                if (profiles.length > 0) {
                    const userProfile = profiles[0];
                    setProfile(userProfile);
                    setFormData({
                        display_name: userProfile.display_name || '',
                        personal_details: userProfile.personal_details || '',
                        tone_preference: userProfile.tone_preference || 'warm_comforting',
                        spiritual_tone: userProfile.spiritual_tone || false,
                    });
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSwitchChange = (name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        setFeedback('');
        try {
            await UserProfile.update(profile.id, formData);
            setFeedback('Profile updated successfully!');
            setTimeout(() => setFeedback(''), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
            setFeedback('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading profile settings...</div>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile &amp; Personalization</CardTitle>
                <CardDescription>
                    Update your display name and how the companion interacts with you.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        placeholder="How should we call you?"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="personal_details">Key Details for Companion</Label>
                    <Textarea
                        id="personal_details"
                        name="personal_details"
                        value={formData.personal_details}
                        onChange={handleInputChange}
                        placeholder="Share anything you'd like your companion to remember about you (e.g., goals, important people, specific challenges)."
                        className="h-24"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tone_preference">Companion's Tone</Label>
                     <Select
                        name="tone_preference"
                        value={formData.tone_preference}
                        onValueChange={(value) => handleSelectChange('tone_preference', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="warm_comforting">Warm &amp; Comforting</SelectItem>
                            <SelectItem value="soft_soothing">Soft &amp; Soothing</SelectItem>
                            <SelectItem value="bold_supportive">Bold &amp; Supportive</SelectItem>
                            <SelectItem value="friendly_conversational">Friendly &amp; Conversational</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                     <Switch
                        id="spiritual_tone"
                        checked={formData.spiritual_tone}
                        onCheckedChange={(checked) => handleSwitchChange('spiritual_tone', checked)}
                    />
                    <Label htmlFor="spiritual_tone">Include Spiritual Tone</Label>
                </div>
                
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
                {feedback && <p className="text-sm text-center text-green-600 mt-2">{feedback}</p>}
            </CardContent>
        </Card>
    );
}