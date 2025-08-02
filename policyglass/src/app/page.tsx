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
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
