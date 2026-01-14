import React, { useState, FormEvent } from 'react';
import { SendIcon, SearchIcon } from './icons';

interface OmniBoxProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const OmniBox: React.FC<OmniBoxProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2">
        <SearchIcon className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask Aether or type a URL..."
        disabled={isLoading}
        className="w-full bg-gray-800 border border-gray-700 rounded-full py-3.5 pl-14 pr-14 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
      />
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-purple-600 hover:text-white disabled:hover:bg-transparent disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};