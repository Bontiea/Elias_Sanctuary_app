import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Palette, BrainCircuit } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import MemoryManager from '@/components/settings/MemoryManager';

export default function SettingsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-purple-800 mb-6">Settings</h1>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
                        <TabsTrigger value="memories"><BrainCircuit className="w-4 h-4 mr-2" />Memories</TabsTrigger>
                        <TabsTrigger value="notifications" disabled><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
                        <TabsTrigger value="appearance" disabled><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <ProfileSettings />
                    </TabsContent>
                    <TabsContent value="memories">
                        <MemoryManager />
                    </TabsContent>
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
                            <CardContent>
                                <p>Notification settings are coming soon.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
                            <CardContent>
                                <p>Appearance settings are coming soon.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}