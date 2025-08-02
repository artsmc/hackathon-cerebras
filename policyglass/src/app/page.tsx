"use client";

import Image from "next/image";
import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import PasswordResetRequestForm from "./components/PasswordResetRequestForm";
import PasswordResetConfirmForm from "./components/PasswordResetConfirmForm";

export default function Home() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'reset-request' | 'reset-confirm'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  const handleLoginSuccess = (token: string) => {
    // In a real app, you would store the token and redirect
    alert(`Login successful! Token: ${token}`);
  };

  const handleRegisterSuccess = () => {
    alert('Registration successful! Please log in.');
    setCurrentView('login');
  };

  const handleResetRequest = () => {
    // In a real app, you would show a message and redirect to login
    alert('If the email exists, a reset link has been sent. Check your email.');
    setCurrentView('login');
  };

  const handleResetSuccess = () => {
    alert('Password reset successful! Please log in with your new password.');
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <div>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <div className="mt-4">
              <button 
                onClick={() => setCurrentView('register')}
                className="text-blue-500 hover:underline mr-4"
              >
                Register
              </button>
              <button 
                onClick={() => setCurrentView('reset-request')}
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        );
      case 'register':
        return (
          <div>
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            <div className="mt-4">
              <button 
                onClick={() => setCurrentView('login')}
                className="text-blue-500 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        );
      case 'reset-request':
        return (
          <div>
            <PasswordResetRequestForm onResetRequest={handleResetRequest} />
            <div className="mt-4">
              <button 
                onClick={() => setCurrentView('login')}
                className="text-blue-500 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        );
      case 'reset-confirm':
        return (
          <div>
            <PasswordResetConfirmForm token={resetToken} onResetSuccess={handleResetSuccess} />
            <div className="mt-4">
              <button 
                onClick={() => setCurrentView('login')}
                className="text-blue-500 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        );
      default:
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="w-full max-w-md">
          {renderCurrentView()}
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:outline-none"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
            >
              Sign In
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
