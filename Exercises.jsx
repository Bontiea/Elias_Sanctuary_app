
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, Ear, PauseCircle, Loader2 } from 'lucide-react';
import { ExerciseCompletion } from '@/api/entities';
import { exercisesData } from '../components/exercises/exercisesData';
import { useNavigate } from 'react-router-dom';
import { tts } from "@/api/functions";

const categories = [
  { id: 'breathing', name: 'Breathing', icon: '🌬️' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' },
  { id: 'gratitude', name: 'Gratitude', icon: '🙏' },
  { id: 'self_compassion', name: 'Self-Compassion', icon: '💖' },
  { id: 'grounding', name: 'Grounding', icon: '🌳' },
  { id: 'visualization', name: 'Visualization', icon: '✨' },
];

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [view, setView] = useState('categories'); // 'categories', 'exercise'
  const navigate = useNavigate();
  
  // New state for audio functionality
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      const completions = await ExerciseCompletion.list();
      setCompletedExercises(completions.map(c => c.exercise_id));
    };
    fetchCompleted();
  }, []);

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setAudioSrc(null);
  };

  const handlePlayAudio = async () => {
    if (audioRef.current && !audioRef.current.paused) {
        handleStopAudio();
    }
    
    if (!currentExercise || isGeneratingAudio || isPlayingAudio) return;

    setIsGeneratingAudio(true);
    
    let textToSpeak = '';

    if (currentExercise.category === 'breathing') {
        const breathingIntros = [
            `Let's begin ${currentExercise.name} together. This is one of my favorite practices because it brings such deep calm.`,
            `Welcome to ${currentExercise.name}. I'm here to guide you through this beautiful breathing practice.`,
            `${currentExercise.name} is a wonderful way to find your center. Let me walk you through it gently.`
        ];
        
        textToSpeak = breathingIntros[Math.floor(Math.random() * breathingIntros.length)];
        textToSpeak += ` Find a comfortable position. When you're ready, we'll begin together. `;
        
        for (let cycle = 1; cycle <= Math.min(currentExercise.repetitions, 3); cycle++) {
            if (cycle === 1) {
                textToSpeak += `Let's start our first cycle. `;
            } else {
                textToSpeak += `Beautiful. Now for cycle ${cycle}. `;
            }
            
            textToSpeak += currentExercise.flow.join('. ') + '. ';
            
            if (cycle < Math.min(currentExercise.repetitions, 3)) {
                const transitions = [
                    `Wonderful. Feel that peace growing within you. `,
                    `Perfect. Notice how your body is already relaxing. `,
                    `Excellent. You're doing beautifully. `
                ];
                textToSpeak += transitions[Math.floor(Math.random() * transitions.length)];
            }
        }
        
        textToSpeak += `You've done such beautiful work. Take a moment to notice the calm you've created within yourself.`;

    } else if (currentExercise.category === 'gratitude') {
        const gratitudeIntros = [
            `${currentExercise.name} is such a heart-opening practice. Let's explore gratitude together.`,
            `Welcome to this gratitude practice. I love guiding people through this because it always brings such joy.`,
            `Let's take this time to connect with the good in your life through ${currentExercise.name}.`
        ];
        
        textToSpeak = gratitudeIntros[Math.floor(Math.random() * gratitudeIntros.length)];
        textToSpeak += ` ${currentExercise.description} `;
        textToSpeak += currentExercise.flow.slice(0, 3).join('. ') + '. ';
        textToSpeak += `Feel your heart opening to all the good in your life.`;

    } else {
        const generalIntros = [
            `I'm so glad you're here for ${currentExercise.name}. This practice can bring such healing.`,
            `Let's journey through ${currentExercise.name} together. I'll be here with you every step.`,
            `${currentExercise.name} is a beautiful practice. Let me guide you through it with care.`
        ];
        
        textToSpeak = generalIntros[Math.floor(Math.random() * generalIntros.length)];
        textToSpeak += ` ${currentExercise.description} `;
        textToSpeak += currentExercise.flow.slice(0, 4).join('. ') + '. ';
        textToSpeak += `You've given yourself such a beautiful gift today.`;
    }

    // Keep under 3500 characters for faster processing
    if (textToSpeak.length > 3500) {
        textToSpeak = textToSpeak.substring(0, 3400) + '... You are doing wonderful work.';
    }

    try {
        const response = await tts({ text: textToSpeak, voice: 'shimmer' });
        if (response.data && response.data.audio) {
            setAudioSrc(response.data.audio);
        } else {
            throw new Error("Failed to generate audio.");
        }
    } catch (error) {
        console.error("TTS generation failed:", error);
        alert("Sorry, the audio guide could not be started at this moment.");
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    if (audioSrc && audioRef.current) {
        audioRef.current.play();
        setIsPlayingAudio(true);
    }
  }, [audioSrc]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const onAudioEnd = () => {
        setIsPlayingAudio(false);
        setAudioSrc(null);
    };

    audioEl.addEventListener('ended', onAudioEnd);
    return () => {
        audioEl.removeEventListener('ended', onAudioEnd);
    };
  }, []);
  
  const goBackToCategories = () => {
      handleStopAudio();
      setView('categories');
      setCurrentExercise(null);
      setSelectedCategory(null);
  };

  const selectExerciseForCategory = (categoryId) => {
    handleStopAudio();
    const categoryExercises = exercisesData[categoryId];
    const availableExercises = categoryExercises.filter(ex => !completedExercises.includes(ex.id));
    
    // If all exercises in a category are completed, loop back to the beginning.
    if (availableExercises.length === 0 && categoryExercises.length > 0) {
      // All exercises in this category are done, start over from the first one.
      setCurrentExercise(categoryExercises[0]);
    } else {
       // Present the next available exercise, or the first if none are available.
       setCurrentExercise(availableExercises[0] || categoryExercises[0]);
    }
    
    setSelectedCategory(categoryId);
    setView('exercise');
  };
  
  const handleComplete = async () => {
    handleStopAudio();
    await ExerciseCompletion.create({
        exercise_id: currentExercise.id,
        category: selectedCategory,
        exercise_name: currentExercise.name,
        completion_date: new Date().toISOString().split('T')[0],
        duration_minutes: currentExercise.repetitions // Saving repetition count
    });
    setCompletedExercises(prev => [...prev, currentExercise.id]);
    goBackToCategories();
  };

  if (view === 'exercise') {
    return (
        <div className="p-6 h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <audio ref={audioRef} src={audioSrc} className="hidden" />
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    <Button variant="ghost" size="sm" onClick={goBackToCategories} className="mb-4 text-purple-600 hover:bg-purple-50">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Categories
                    </Button>
                    <CardTitle className="text-2xl text-purple-700">{currentExercise.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {currentExercise.repetitions} {currentExercise.repetitions === 1 ? 'time' : 'times'}</span>
                        
                        <div className="flex items-center gap-1">
                            {!isPlayingAudio && !isGeneratingAudio && (
                                <Button variant="ghost" size="sm" onClick={handlePlayAudio} className="text-purple-600 hover:bg-purple-50 p-1 h-auto -ml-2">
                                    <Ear className="w-4 h-4 mr-1" /> Audio Guided
                                </Button>
                            )}
                            {isGeneratingAudio && (
                                <div className="flex items-center gap-1 text-purple-600 p-1">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Audio...
                                </div>
                            )}
                            {isPlayingAudio && (
                                <Button variant="ghost" size="sm" onClick={handleStopAudio} className="text-red-500 hover:bg-red-50 p-1 h-auto -ml-2">
                                    <PauseCircle className="w-4 h-4 mr-1" /> Stop Audio
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">{currentExercise.description}</p>
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="font-semibold mb-2">Exercise Flow:</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {currentExercise.flow.map((step, index) => <li key={index}>{step}</li>)}
                        </ul>
                    </div>
                    <Button onClick={handleComplete} className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-purple-700 hover:bg-purple-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
      </Button>
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Healing Exercises</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Card 
            key={category.id} 
            className="p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => selectExerciseForCategory(category.id)}
            >
            <div className="text-5xl mb-4">{category.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
