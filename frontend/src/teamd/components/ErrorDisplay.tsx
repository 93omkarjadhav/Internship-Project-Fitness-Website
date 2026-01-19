import React from 'react';
import { X, ArrowUp } from 'lucide-react';

interface ErrorDisplayProps {
  onRefresh: () => void;
}

export default function ErrorDisplay({ onRefresh }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-Plus Jakarta Sans">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-grey-200 bg-white">
        <div className="flex items-center gap-3">
          <img 
            src="/ai-icon.png" 
            alt="AI Assistant" 
            className="w-10 h-10 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-base font-bold text-gray-900">FitFare AI Assistant</h1>
            <p className="text-xs text-gray-500">GPT-7 • 241 chats left</p>
          </div>
        </div>
        {/* <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <img 
            src="/Settings.png" 
            alt="Settings" 
            className="w-10 h-10"
          />
        </button> */}
      </div>

      {/* Content */}
      <div className="flex-1 font-Plus Jakarta Sans overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 flex flex-col items-center justify-center">

        {/* Error Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
            <X size={48} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center max-w-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            You don't have an active connection
          </h2>
          <p className="text-m text-gray-600">
            Also, please disable your use VPN in order to continue
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition mb-12"
        >
          <ArrowUp size={18} />
          <span className="text-sm font-medium">Pull to refresh</span>
        </button>
      </div>

      {/* Disabled Input Section */}
      <div className="bg-gray-100 px-4 py-3 pb-6 border-t border-gray-200 opacity-50 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-full">

            <button className="flex-shrink-1 p-0.5">
              <img 
                src="/Voice.png"
                alt="Voice message" 
                className="w-4 h-5" 
              />
            </button>

            <input
              type="text"
              placeholder="Type to start chatting..."
              disabled
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500 font-Plus Jakarta Sans"
            />

            <button className="flex-shrink-0 p-1">
              <img 
                src="/paperclip.png"
                alt="Attach file" 
                className="w-5 h-5" 
              />
            </button>
          </div>

          <button
            disabled
            className="flex-shrink-0 p-2.5 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <img 
              src="/Sent.png"
              alt="Send" 
              className="w-10 h-10" 
            />
          </button>
        </div>
      </div>

    </div>
  );
}
