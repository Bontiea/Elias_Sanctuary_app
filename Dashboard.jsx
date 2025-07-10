
import React, { useState, useEffect } from "react";
import { DailyContent, EmotionLog, UserProfile, ExerciseCompletion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageCircle, 
  Heart, 
  BookOpen, 
  Sparkles, 
  Calendar,
  Flame,
  TrendingUp
} from "lucide-react";
import { format, isValid } from "date-fns";
import { motion } from "framer-motion";

import WelcomeMessage from "../components/dashboard/WelcomeMessage";
import DailyContentCard from "../components/dashboard/DailyContentCard";  
import QuickActions from "../components/dashboard/QuickActions";
import StreakCounter from "../components/dashboard/StreakCounter";
import RecentActivity from "../components/dashboard/RecentActivity";
import InstallPWAButton from "../components/dashboard/InstallPWAButton";
// Removed Testimonials import as it's now inlined

export default function Dashboard() {
  const [todayContent, setTodayContent] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [recentEmotion, setRecentEmotion] = useState(null);
  const [recentExercise, setRecentExercise] = useState(null); // Add state for recent exercise
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      
      const content = await DailyContent.filter({ date: todayString });
      if (content.length > 0) {
        setTodayContent(content[0]);
      }

      const profile = await UserProfile.list();
      if (profile.length > 0) {
        setUserProfile(profile[0]);
      }

      const recentEmotions = await EmotionLog.list('-created_date', 1);
      if (recentEmotions.length > 0) {
        setRecentEmotion(recentEmotions[0]);
      }

      // Fetch the most recent exercise completion
      const recentExercises = await ExerciseCompletion.list('-created_date', 1);
      if (recentExercises.length > 0) {
        setRecentExercise(recentExercises[0]);
      }

      const allEmotions = await EmotionLog.list('-created_date');
      calculateStreak(allEmotions);

    } catch (error) {
      console.error("A critical error occurred while loading dashboard data:", error);
      // In case of error, we still want to show the page, just without the data
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (emotions) => {
    if (!emotions || emotions.length === 0) {
        setCheckInStreak(0);
        return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for consistent comparison
    
    // Group emotions by date and get unique dates
    const emotionDates = emotions.map(e => {
        const d = new Date(e.date);
        return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
    }).filter(Boolean);
    const uniqueDates = [...new Set(emotionDates)].sort((a, b) => new Date(b) - new Date(a)); // Sort desc to easily check consecutive days from today

    // Check consecutive days starting from today
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = format(checkDate, 'yyyy-MM-dd');
      
      if (uniqueDates.includes(dateString)) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
    setCheckInStreak(streak);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 lg:p-8">
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        
        <motion.div variants={itemVariants}>
          <WelcomeMessage 
            greeting={getTimeGreeting()}
            userName={userProfile?.display_name}
            isLoading={isLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <InstallPWAButton />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <motion.div variants={itemVariants}>
              <DailyContentCard 
                content={todayContent}
                isLoading={isLoading}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <QuickActions isLoading={isLoading} />
            </motion.div>
            
          </div>

          <div className="space-y-6">
            
            <motion.div variants={itemVariants}>
              <StreakCounter 
                streak={checkInStreak}
                recentEmotion={recentEmotion}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <RecentActivity 
                recentEmotion={recentEmotion}
                recentExercise={recentExercise}
                isLoading={isLoading}
              />
            </motion.div>
            
          </div>
        </div>
        
        {/* TESTIMONIALS SECTION - COPIED DIRECTLY */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-purple-800 mb-2">
                Trusted on The Healing Journey
              </h2>
              <p className="text-lg text-gray-600">
                Join over <span className="font-bold text-purple-600">15K+ souls</span> finding solace and support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg h-full flex flex-col">
                <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&fit=crop&crop=faces" 
                    alt="Sarah M." 
                    className="w-16 h-16 rounded-full object-cover mb-4 border-3 border-purple-100 shadow-md"
                  />
                  <h3 className="font-semibold text-purple-800 mb-1">Sarah M.</h3>
                  <div className="mb-3 flex gap-1 text-yellow-400">
                    <span className="text-sm">★★★★★</span>
                  </div>
                  <p className="text-gray-600 text-sm italic flex-1">"This app has been my safe space during some really tough times. The AI companion never judges and always knows what to say. It feels like a warm hug in my pocket."</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg h-full flex flex-col">
                <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop&crop=faces" 
                    alt="Marcus K." 
                    className="w-16 h-16 rounded-full object-cover mb-4 border-3 border-purple-100 shadow-md"
                  />
                  <h3 className="font-semibold text-purple-800 mb-1">Marcus K.</h3>
                  <div className="mb-3 flex gap-1 text-yellow-400">
                    <span className="text-sm">★★★★★</span>
                  </div>
                  <p className="text-gray-600 text-sm italic flex-1">"I was skeptical at first, but having someone to talk to at 2am when anxiety hits has been life-changing. Truly a sanctuary for the mind."</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg h-full flex flex-col">
                <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop&crop=faces" 
                    alt="Elena R." 
                    className="w-16 h-16 rounded-full object-cover mb-4 border-3 border-purple-100 shadow-md"
                  />
                  <h3 className="font-semibold text-purple-800 mb-1">Elena R.</h3>
                  <div className="mb-3 flex gap-1 text-yellow-400">
                    <span className="text-sm">★★★★★</span>
                  </div>
                  <p className="text-gray-600 text-sm italic flex-1">"The daily check-ins helped me understand my emotional patterns better. It's more than an app; it's a tool for self-discovery. I feel more in control now."</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg h-full flex flex-col">
                <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop&crop=faces" 
                    alt="James P." 
                    className="w-16 h-16 rounded-full object-cover mb-4 border-3 border-purple-100 shadow-md"
                  />
                  <h3 className="font-semibold text-purple-800 mb-1">James P.</h3>
                  <div className="mb-3 flex gap-1 text-yellow-400">
                    <span className="text-sm">★★★★★</span>
                  </div>
                  <p className="text-gray-600 text-sm italic flex-1">"The guided exercises are fantastic. Simple, effective, and easy to fit into my day. A great companion for anyone on a healing journey."</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-12">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg">
            <CardContent className="p-8 text-center">
              <Link to={createPageUrl('Testimonials')} className="text-purple-600 hover:underline font-medium block mb-6">
                Read Real Testimonials
              </Link>
              <h3 className="text-xl font-bold text-purple-800 mb-4">Need Support?</h3>
              <p className="text-gray-600 mb-4">We're here to help you on your healing journey.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-600">Solace Creations LLC</p>
                <a 
                  href="mailto:solace.creationsclothingco@gmail.com"
                  className="text-purple-600 hover:text-purple-800 underline transition-colors block"
                >
                  solace.creationsclothingco@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
