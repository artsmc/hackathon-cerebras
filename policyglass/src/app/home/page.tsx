"use client";

import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submit logic here
    console.log("Submitted value:", inputValue);
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          PolicyGlass
        </h1>
        
        <div className="flex w-full max-w-6xl gap-8">
          {/* Left Column - 25% width */}
          <div className="w-1/4 pl-8 pr-4">
            {/* Description Div */}
            <div className="mb-8 p-6 bg-background border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-foreground">About PolicyGlass</h2>
              <p className="text-foreground">
                PolicyGlass is an innovative platform that helps you analyze and understand complex policy documents. 
                Our AI-powered tool breaks down legal jargon into comprehensible insights, making policy analysis 
                accessible to everyone. Simply enter a policy document or topic in the input field to get started.
              </p>
            </div>
            
            {/* Input Div */}
            <div className="p-6 bg-background border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Analyze a Policy</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="policyInput" className="block text-sm font-medium mb-2 text-foreground">
                    Enter policy topic or document
                  </label>
                  <textarea
                    id="policyInput"
                    className="w-full p-3 border border-gray-300 rounded-md text-foreground bg-white"
                    rows={4}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter a policy topic, paste document text, or provide a URL..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-foreground text-background px-4 py-2 rounded-md hover:bg-[#383838] transition-colors"
                >
                  Analyze Policy
                </button>
              </form>
            </div>
          </div>
          
          {/* Right Column - 60% width */}
          <div className="w-3/5 pr-8 pl-4 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
              {/* Placeholder for background image */}
              <div className="text-center p-8">
                <p className="text-gray-500 mb-4">
                  Background image will be displayed here
                </p>
                <p className="text-sm text-gray-400">
                  Image source can be pasted in the designated area
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
