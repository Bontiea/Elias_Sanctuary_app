import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Disclaimer from "./Disclaimer";

import Companion from "./Companion";

import Checkin from "./Checkin";

import Calendar from "./Calendar";

import Exercises from "./Exercises";

import Journal from "./Journal";

import Profile from "./Profile";

import Settings from "./Settings";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsOfService from "./TermsOfService";

import Admin from "./Admin";

import Welcome from "./Welcome";

import Subscription from "./Subscription";

import AdminLogin from "./AdminLogin";

import Testimonials from "./Testimonials";

import DailySummary from "./DailySummary";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Disclaimer: Disclaimer,
    
    Companion: Companion,
    
    Checkin: Checkin,
    
    Calendar: Calendar,
    
    Exercises: Exercises,
    
    Journal: Journal,
    
    Profile: Profile,
    
    Settings: Settings,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsOfService: TermsOfService,
    
    Admin: Admin,
    
    Welcome: Welcome,
    
    Subscription: Subscription,
    
    AdminLogin: AdminLogin,
    
    Testimonials: Testimonials,
    
    DailySummary: DailySummary,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Disclaimer" element={<Disclaimer />} />
                
                <Route path="/Companion" element={<Companion />} />
                
                <Route path="/Checkin" element={<Checkin />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Exercises" element={<Exercises />} />
                
                <Route path="/Journal" element={<Journal />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/Testimonials" element={<Testimonials />} />
                
                <Route path="/DailySummary" element={<DailySummary />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}