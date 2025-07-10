import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/api/entities';
import { Shield, Infinity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const GoogleIcon = () => (
    <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 65.5C314.6 94.6 282.7 80 248 80c-82.6 0-150.2 67.5-150.2 150.2S165.4 406.2 248 406.2c96.3 0 138.2-79.6 142.2-117.8H248v-83.8h235.9c2.3 12.7 3.6 26.4 3.6 40.8z"></path>
    </svg>
);

export default function AdminLoginPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already logged in as admin
        const checkAdminStatus = async () => {
            try {
                const user = await User.me();
                if (user && user.role === 'admin') {
                    navigate(createPageUrl('Admin'));
                }
            } catch (e) {
                // Not logged in, stay on this page
            }
        };
        checkAdminStatus();
    }, [navigate]);

    const handleAdminLogin = async () => {
        await User.login();
        // After login, the useEffect will check if they're admin and redirect
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-8">
                    <Shield className="w-12 h-12 text-white" />
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Admin Access
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                    Infinity Companion Admin Panel
                </p>
                <p className="text-gray-500 mb-10">
                    Authorized access only
                </p>

                <Button
                    onClick={handleAdminLogin}
                    size="lg"
                    className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base py-6"
                >
                    <GoogleIcon />
                    Admin Login
                </Button>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Infinity className="w-4 h-4" />
                        <span>Infinity Companion Admin Portal</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-8">
                    Powered by Solace Creations LLC
                </p>
            </div>
        </div>
    );
}