

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  MessageCircle,
  Calendar,
  Heart,
  BookOpen,
  User,
  Settings,
  Infinity,
  Shield
} from "lucide-react";
import { User as UserEntity, UserProfile } from '@/api/entities';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { name: "Dashboard", page: "Dashboard", icon: Home },
  { name: "AI Companion", page: "Companion", icon: MessageCircle },
  { name: "Calendar", page: "Calendar", icon: Calendar },
  { name: "Check-in", page: "Checkin", icon: Heart },
  { name: "Journal", page: "Journal", icon: BookOpen },
  { name: "Exercises", page: "Exercises", icon: Heart },
];

const settingsItems = [
  { name: "Settings", page: "Settings", icon: Settings },
  { name: "Profile", page: "Profile", icon: User },
];

const unauthenticatedPages = ['Disclaimer', 'Welcome', 'PrivacyPolicy', 'TermsOfService', 'Testimonials'];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await UserEntity.me();
        if (user) {
          if (currentPageName === 'Welcome' || currentPageName === 'Disclaimer') {
            navigate(createPageUrl('Dashboard'));
            return;
          }

          let profiles = await UserProfile.list();
          let userProfile = profiles.length > 0 ? profiles[0] : null;

          if (!userProfile) {
              userProfile = await UserProfile.create({});
          }
          
          if (user.role === 'admin') {
            setIsAdmin(true);
            setIsInitialized(true);
            return;
          }

          const disclaimerAgreed = localStorage.getItem('disclaimer_agreed') === 'true';

          if (!userProfile.has_acknowledged_disclaimer) {
            if (disclaimerAgreed) {
              await UserProfile.update(userProfile.id, { has_acknowledged_disclaimer: true });
              localStorage.removeItem('disclaimer_agreed');
              
              if (!userProfile.subscription_status || userProfile.subscription_status === 'trial') {
                if (userProfile.trial_start_date) {
                  const trialStart = new Date(userProfile.trial_start_date);
                  const now = new Date();
                  const daysDiff = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
                  
                  if (daysDiff > 10) {
                    navigate(createPageUrl('Subscription'));
                    return;
                  }
                } else {
                  navigate(createPageUrl('Subscription'));
                  return;
                }
              }
            }
            else {
              if (currentPageName !== 'Disclaimer') {
                navigate(createPageUrl('Disclaimer'));
                return;
              }
            }
          } else {
            if (!userProfile.subscription_status || userProfile.subscription_status === 'trial') {
              if (userProfile.trial_start_date) {
                const trialStart = new Date(userProfile.trial_start_date);
                const now = new Date();
                const daysDiff = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > 10 && currentPageName !== 'Subscription') {
                  navigate(createPageUrl('Subscription'));
                  return;
                }
              } else if (currentPageName !== 'Subscription') {
                navigate(createPageUrl('Subscription'));
                return;
              }
            }
          }
        }
      } catch (e) {
         if (!unauthenticatedPages.includes(currentPageName)) {
           navigate(createPageUrl('Disclaimer'));
           return;
         }
      } finally {
        setIsInitialized(true);
      }
    };
    initializeUser();
  }, [location.pathname, navigate, currentPageName]);

  if (unauthenticatedPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarProvider>
        <Sidebar className="w-64 bg-white shadow-lg border-r border-purple-100 flex flex-col h-full">
          <SidebarHeader className="p-4 border-b border-purple-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-purple-800">Infinity Companion</h1>
                <p className="text-xs text-gray-500">Your healing journey</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto min-h-0">
            <div className="py-2">
              <SidebarGroup>
                <nav className="space-y-1 px-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                        currentPageName === item.page
                          ? 'text-purple-800 border-purple-600'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700 border-transparent'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SidebarGroup>

              <SidebarGroup className="mt-2">
                <div className="px-6 mb-1">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Settings
                  </h3>
                </div>
                <nav className="space-y-1 px-3">
                  {settingsItems.map((item) => (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                        currentPageName === item.page
                          ? 'text-purple-800 border-purple-600'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700 border-transparent'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SidebarGroup>

              {isAdmin && (
                <SidebarGroup className="mt-2">
                  <div className="px-6 mb-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Admin
                    </h3>
                  </div>
                  <nav className="space-y-1 px-3">
                    <Link
                      to={createPageUrl('Admin')}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                        currentPageName === 'Admin'
                          ? 'text-red-800 border-red-600'
                          : 'text-gray-600 hover:bg-red-50 hover:text-red-700 border-transparent'
                      }`}
                    >
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      Admin Panel
                    </Link>
                  </nav>
                </SidebarGroup>
              )}
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-100 p-3 flex-shrink-0">
            <div className="text-center space-y-1">
              <div>
                <p className="text-xs text-gray-400 mb-0">Created by</p>
                <p className="text-sm font-medium text-purple-600">Solace Creations LLC</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0">Contact Us</p>
                <a 
                  href="mailto:solace.creationsclothingco@gmail.com"
                  className="text-xs text-gray-500 hover:text-purple-600 transition-colors block break-all"
                >
                  solace.creationsclothingco@gmail.com
                </a>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white shadow-sm border-b border-purple-100 p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-purple-600" />
                <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded flex items-center justify-center">
                  <Infinity className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-purple-800">Infinity Companion</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {isInitialized ? children : (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Infinity className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <p className="text-gray-600">Loading your sanctuary...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

