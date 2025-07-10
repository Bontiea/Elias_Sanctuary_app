import React, { useState, useEffect } from 'react';
import { UserMemory } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, BrainCircuit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MemoryManager() {
    const [memories, setMemories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMemories();
    }, []);

    const loadMemories = async () => {
        setIsLoading(true);
        try {
            const userMemories = await UserMemory.filter({ is_user_managed: true }, '-created_date');
            setMemories(userMemories);
        } catch (error) {
            console.error("Failed to load memories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await UserMemory.delete(id);
            setMemories(memories.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete memory:", error);
        }
    };

    if (isLoading) {
        return <div>Loading memories...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600"/>
                    Companion's Memories
                </CardTitle>
                <CardDescription>
                    Here are the key things your companion remembers to personalize your conversations. You can remove any memory you don't want it to keep.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {memories.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Your companion hasn't saved any specific memories yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {memories.map(memory => (
                            <div key={memory.id} className="flex items-start justify-between p-3 border rounded-lg bg-purple-50/50">
                                <div className="flex-1">
                                    <p className="font-medium text-purple-800">{memory.memory_content}</p>
                                    <p className="text-xs text-purple-500 capitalize">{memory.memory_type} • Importance: {memory.importance_level}/5</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete this memory. Your companion will no longer recall this information. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(memory.id)} className="bg-red-600 hover:bg-red-700">
                                                Yes, Delete Memory
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}