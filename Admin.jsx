
import React, { useState, useEffect } from 'react';
import { User, DailyContent, AppSettings, CompanionAlert, CompanionNote } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Shield, Book, Bot, Settings as SettingsIcon, Upload, FileText, AlertCircle, ArrowLeft, Bell, MessageSquare, Users, TrendingUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    
    // Content states
    const [allContent, setAllContent] = useState([]);
    const [contentDate, setContentDate] = useState('');
    const [affirmation, setAffirmation] = useState('');
    const [reflection, setReflection] = useState('');
    const [thought, setThought] = useState('');
    const [weekTitle, setWeekTitle] = useState(''); // New state for week title
    const [contentId, setContentId] = useState(null);

    // Upload states
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [parsedData, setParsedData] = useState([]);

    // Companion prompt state
    const [systemPrompt, setSystemPrompt] = useState('');
    const [promptSettingId, setPromptSettingId] = useState(null);

    // New state for reporting panel
    const [alerts, setAlerts] = useState([]);
    const [notes, setNotes] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const user = await User.me();
                if (user.role !== 'admin') {
                    navigate('/Dashboard');
                } else {
                    setIsAdmin(true);
                    loadAllContent();
                    loadSystemPrompt();
                    loadReportingData(); // Load new reporting data
                }
            } catch (e) {
                navigate('/Dashboard');
            }
        };
        checkAdmin();
    }, [navigate]);

    const loadAllContent = async () => {
        const data = await DailyContent.list('-date');
        setAllContent(data);
    };

    const loadSystemPrompt = async () => {
        const settings = await AppSettings.filter({ setting_key: 'ai_system_prompt' });
        if (settings.length > 0) {
            setSystemPrompt(settings[0].setting_value);
            setPromptSettingId(settings[0].id);
        }
    };
    
    const loadReportingData = async () => {
        try {
            const alertsData = await CompanionAlert.list('-created_date', 50);
            const notesData = await CompanionNote.list('-created_date', 50);
            setAlerts(alertsData);
            setNotes(notesData);
        } catch (error) {
            console.error('Error loading reporting data:', error);
        }
    };

    const handleAlertStatusUpdate = async (alertId, newStatus, adminNotes = '', adminAction = '') => {
        await CompanionAlert.update(alertId, {
            status: newStatus,
            admin_notes: adminNotes,
            admin_action: adminAction
        });
        loadReportingData();
        setSelectedAlert(null);
        setAdminResponse('');
    };

    const handleNoteResponse = async (noteId, response) => {
        await CompanionNote.update(noteId, {
            admin_response: response,
            follow_up_required: false
        });
        loadReportingData();
    };

    const getAlertIcon = (alertType) => {
        const icons = {
            hostility: '⚠️',
            emotional_crisis: '🆘',
            inappropriate_use: '❗',
            self_harm_risk: '🚨',
            substance_concern: '⚡',
            behavioral_pattern: '👁️'
        };
        return icons[alertType] || '🔔';
    };

    const getSeverityColor = (level) => {
        const colors = {
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-green-100 text-green-800', 
            3: 'bg-yellow-100 text-yellow-800',
            4: 'bg-orange-100 text-orange-800',
            5: 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const handleContentSave = async () => {
        const [year, month, day] = contentDate.split('-').map(Number);
        const data = { 
            date: contentDate, 
            month, 
            day, 
            todays_affirmation: affirmation, 
            daily_reflection: reflection, 
            thought_of_the_day: thought,
            week_title: weekTitle // Include week_title
        };
        if (contentId) {
            await DailyContent.update(contentId, data);
        } else {
            await DailyContent.create(data);
        }
        alert('Content saved!');
        resetContentForm();
        loadAllContent();
    };
    
    const handlePromptSave = async () => {
        if (promptSettingId) {
            await AppSettings.update(promptSettingId, { setting_value: systemPrompt });
        } else {
            const newSetting = await AppSettings.create({ setting_key: 'ai_system_prompt', setting_value: systemPrompt });
            setPromptSettingId(newSetting.id);
        }
        alert('Companion prompt saved!');
    };

    const handleFileUpload = async () => {
        if (!uploadFile) {
            setUploadStatus('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setUploadStatus('Uploading file...');

        try {
            // Upload the file
            const uploadResponse = await UploadFile({ file: uploadFile });
            if (!uploadResponse.file_url) {
                throw new Error('Failed to upload file');
            }

            setUploadStatus('Processing file content...');

            // Define the expected JSON schema for parsing
            const jsonSchema = {
                type: "object",
                properties: {
                    content: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                month: { type: "integer", minimum: 1, maximum: 12 },
                                day: { type: "integer", minimum: 1, maximum: 31 },
                                todays_affirmation: { type: "string" },
                                daily_reflection: { type: "string" },
                                thought_of_the_day: { type: "string" },
                                week_title: { type: "string" } // Added week_title to schema
                            },
                            required: ["month", "day", "todays_affirmation", "daily_reflection", "thought_of_the_day"]
                        }
                    }
                },
                required: ["content"]
            };

            // Extract structured data from the uploaded file
            const extractResponse = await ExtractDataFromUploadedFile({
                file_url: uploadResponse.file_url,
                json_schema: jsonSchema
            });

            if (extractResponse.status === 'error') {
                throw new Error(extractResponse.details || 'Failed to parse file content');
            }

            if (extractResponse.output && extractResponse.output.content) {
                setParsedData(extractResponse.output.content);
                setUploadStatus(`Successfully parsed ${extractResponse.output.content.length} entries from your manuscript.`);
            } else {
                throw new Error('No content found in the uploaded file');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus(`Error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleBulkSave = async () => {
        if (parsedData.length === 0) {
            setUploadStatus('No parsed data to save.');
            return;
        }

        setUploadStatus('Saving content to database...');

        try {
            for (const item of parsedData) {
                // Create a proper date string (assuming current year)
                const currentYear = new Date().getFullYear();
                const dateString = `${currentYear}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
                
                // Check if content already exists for this date
                const existingContent = await DailyContent.filter({ date: dateString });
                
                const contentData = {
                    date: dateString,
                    month: item.month,
                    day: item.day,
                    todays_affirmation: item.todays_affirmation,
                    daily_reflection: item.daily_reflection,
                    thought_of_the_day: item.thought_of_the_day,
                    week_title: item.week_title || '' // Include week_title from parsed data
                };

                if (existingContent.length > 0) {
                    // Update existing content
                    await DailyContent.update(existingContent[0].id, contentData);
                } else {
                    // Create new content
                    await DailyContent.create(contentData);
                }
            }

            setUploadStatus(`Successfully saved ${parsedData.length} entries to the database.`);
            setParsedData([]);
            setUploadFile(null);
            loadAllContent(); // Refresh the content list

        } catch (error) {
            console.error('Bulk save error:', error);
            setUploadStatus(`Error saving content: ${error.message}`);
        }
    };

    const selectContentForEdit = (content) => {
        setContentDate(content.date);
        setAffirmation(content.todays_affirmation);
        setReflection(content.daily_reflection);
        setThought(content.thought_of_the_day);
        setWeekTitle(content.week_title || ''); // Set week_title for editing
        setContentId(content.id);
    };
    
    const resetContentForm = () => {
        setContentDate('');
        setAffirmation('');
        setReflection('');
        setThought('');
        setWeekTitle(''); // Clear week_title
        setContentId(null);
    }

    if (!isAdmin) {
        return <div className="p-6">Checking permissions...</div>;
    }

    return (
        <div className="p-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-600 hover:text-purple-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-purple-800 mb-6 flex items-center gap-3"><Shield /> Admin Panel</h1>
            <Tabs defaultValue="content">
                <TabsList>
                    <TabsTrigger value="content"><Book className="mr-2 h-4 w-4" />Daily Content</TabsTrigger>
                    <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Book Upload</TabsTrigger>
                    <TabsTrigger value="companion"><Bot className="mr-2 h-4 w-4" />Companion Settings</TabsTrigger>
                    <TabsTrigger value="reporting"><Bell className="mr-2 h-4 w-4" />Companion Reports</TabsTrigger>
                    <TabsTrigger value="app"><SettingsIcon className="mr-2 h-4 w-4" />App Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1">
                            <CardHeader><CardTitle>{contentId ? 'Edit' : 'Add'} Content</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Input type="date" value={contentDate} onChange={e => setContentDate(e.target.value)} />
                                {/* New Input for Week Title */}
                                <Input 
                                    placeholder="Week Title (from your manuscript - e.g., Week 3: Embracing Your Power)" 
                                    value={weekTitle} 
                                    onChange={e => setWeekTitle(e.target.value)} 
                                />
                                <Textarea placeholder="Today's Affirmation" value={affirmation} onChange={e => setAffirmation(e.target.value)} />
                                <Textarea placeholder="Daily Reflection" value={reflection} onChange={e => setReflection(e.target.value)} />
                                <Textarea placeholder="Thought of the Day" value={thought} onChange={e => setThought(e.target.value)} />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button onClick={handleContentSave}>Save Content</Button>
                                {contentId && <Button variant="ghost" onClick={resetContentForm}>New</Button>}
                            </CardFooter>
                        </Card>
                        <Card className="md:col-span-2 h-[600px] overflow-y-auto">
                           <CardHeader><CardTitle>Existing Content ({allContent.length} entries)</CardTitle></CardHeader>
                           <CardContent>
                               {allContent.map(c => (
                                   <div key={c.id} onClick={() => selectContentForEdit(c)} className="p-2 border-b hover:bg-gray-50 cursor-pointer">
                                       <p className="font-semibold">{c.date} {c.week_title && `(${c.week_title})`}</p>
                                       <p className="text-sm text-gray-600 truncate">"{c.todays_affirmation}"</p>
                                   </div>
                               ))}
                           </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="upload">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Import Manuscript Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Upload your manuscript in DOCX, PDF, or text format. The content should be structured with Month, Day, Today's Affirmation, Daily Reflection, and Thought of the Day for each entry. A "Week Title" field is optional.
                                    </AlertDescription>
                                </Alert>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Select Manuscript File</label>
                                        <Input
                                            type="file"
                                            accept=".docx,.pdf,.txt,.doc"
                                            onChange={(e) => setUploadFile(e.target.files[0])}
                                            disabled={isUploading}
                                        />
                                    </div>
                                    
                                    <Button 
                                        onClick={handleFileUpload} 
                                        disabled={!uploadFile || isUploading}
                                        className="bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isUploading ? 'Processing...' : 'Upload and Parse Content'}
                                    </Button>
                                    
                                    {uploadStatus && (
                                        <Alert className={uploadStatus.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                                            <AlertDescription>{uploadStatus}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {parsedData.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parsed Content Preview ({parsedData.length} entries)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {parsedData.slice(0, 5).map((item, index) => (
                                            <div key={index} className="p-3 border rounded-lg bg-gray-50">
                                                <p className="font-semibold">Month {item.month}, Day {item.day} {item.week_title && `(${item.week_title})`}</p>
                                                <p className="text-sm text-gray-600 truncate">Affirmation: "{item.todays_affirmation}"</p>
                                                <p className="text-sm text-gray-600 truncate">Reflection: "{item.daily_reflection}"</p>
                                                <p className="text-sm text-gray-600 truncate">Thought: "{item.thought_of_the_day}"</p>
                                            </div>
                                        ))}
                                        {parsedData.length > 5 && (
                                            <p className="text-sm text-gray-500 text-center">
                                                ...and {parsedData.length - 5} more entries
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={handleBulkSave} className="bg-green-600 hover:bg-green-700">
                                            Save All Content to Database
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="companion">
                     <Card>
                        <CardHeader><CardTitle>AI Companion System Prompt</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea 
                                className="h-96 font-mono" 
                                value={systemPrompt} 
                                onChange={e => setSystemPrompt(e.target.value)}
                                placeholder="Enter the AI companion's personality and behavior instructions here..."
                            />
                        </CardContent>
                        <CardFooter><Button onClick={handlePromptSave}>Save Prompt</Button></CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="reporting">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-red-500" />
                                        Active Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {alerts.filter(a => a.status === 'new').length}
                                    </div>
                                    <p className="text-sm text-gray-500">Requiring review</p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-500" />
                                        Recent Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {notes.filter(n => !n.admin_response).length}
                                    </div>
                                    <p className="text-sm text-gray-500">Pending response</p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-orange-500" />
                                        Monitoring
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {alerts.filter(a => a.status === 'monitoring').length}
                                    </div>
                                    <p className="text-sm text-gray-500">Users being watched</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Recent Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                                    {alerts.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No alerts yet</p>
                                    ) : (
                                        alerts.slice(0, 10).map(alert => (
                                            <div key={alert.id} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                                                        <Badge className={getSeverityColor(alert.severity_level)}>
                                                            Level {alert.severity_level}
                                                        </Badge>
                                                        <Badge variant={alert.status === 'new' ? 'destructive' : 'secondary'}>
                                                            {alert.status}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(alert.created_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">{alert.ai_summary}</p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                                                        Review
                                                    </Button>
                                                    {alert.status === 'new' && (
                                                        <Button size="sm" onClick={() => handleAlertStatusUpdate(alert.id, 'monitoring')}>
                                                            Start Monitoring
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Companion Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                                    {notes.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No notes yet</p>
                                    ) : (
                                        notes.slice(0, 10).map(note => (
                                            <div key={note.id} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary">
                                                        {note.category}
                                                    </Badge>
                                                    <Badge className={
                                                        note.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                                        note.sentiment === 'concerning' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }>
                                                        {note.sentiment}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-700">{note.note_content}</p>
                                                {!note.admin_response && (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Quick response or directive..."
                                                            className="text-xs"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && e.target.value.trim()) {
                                                                    handleNoteResponse(note.id, e.target.value);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {note.admin_response && (
                                                    <div className="bg-blue-50 p-2 rounded text-xs">
                                                        <strong>Admin:</strong> {note.admin_response}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {selectedAlert && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alert Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="font-semibold">Alert Type:</label>
                                            <p>{getAlertIcon(selectedAlert.alert_type)} {selectedAlert.alert_type}</p>
                                        </div>
                                        <div>
                                            <label className="font-semibold">Severity:</label>
                                            <Badge className={getSeverityColor(selectedAlert.severity_level)}>
                                                Level {selectedAlert.severity_level}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="font-semibold">AI Summary:</label>
                                        <p className="text-gray-700">{selectedAlert.ai_summary}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold">Trigger Message:</label>
                                        <p className="text-gray-700 bg-gray-50 p-2 rounded">{selectedAlert.trigger_message}</p>
                                    </div>
                                    <div>
                                        <label className="font-semibold">Admin Notes:</label>
                                        <Textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            placeholder="Add your notes and any directives for the AI..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleAlertStatusUpdate(selectedAlert.id, 'reviewed', adminResponse)}>
                                            Mark Reviewed
                                        </Button>
                                        <Button onClick={() => handleAlertStatusUpdate(selectedAlert.id, 'monitoring', adminResponse)}>
                                            Start Monitoring
                                        </Button>
                                        <Button onClick={() => handleAlertStatusUpdate(selectedAlert.id, 'resolved', adminResponse)}>
                                            Mark Resolved
                                        </Button>
                                        <Button variant="ghost" onClick={() => setSelectedAlert(null)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="app">
                    <Card>
                        <CardHeader><CardTitle>Application Settings & Code</CardTitle></CardHeader>
                        <CardContent className="prose">
                            <h3>Payment Gateway (Stripe)</h3>
                            <p>To enable subscriptions, set your Stripe API keys in the workspace environment variables:</p>
                            <ul>
                                <li><code>STRIPE_SECRET_KEY</code></li>
                                <li><code>STRIPE_PUBLISHABLE_KEY</code></li>
                            </ul>
                            <p>Once set, the subscription flow will be active.</p>
                             <h3>Editing App Pages and Logic</h3>
                            <p>As the app owner, you have full access to the source code. You can modify pages, components, and logic directly through the Base44 code editor.</p>
                            <p>Navigate to the 'Code' section in your workspace to find and edit files for pages like <code>Dashboard.js</code>, <code>Companion.js</code>, or components in the <code>/components</code> directory.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
