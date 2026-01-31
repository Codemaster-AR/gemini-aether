
import React from 'react';
import { GlobeIcon, LightbulbIcon, SearchIcon, FilmIcon } from './icons';

interface SuggestionPromptsProps {
    onPromptSelect: (prompt: string) => void;
}

const suggestions = [
    { text: "Find the best restaurants near me", icon: <GlobeIcon className="w-5 h-5 text-gray-300" /> },
    { text: "Build a weekly meal plan and grocery list", icon: <LightbulbIcon className="w-5 h-5 text-gray-300" /> },
    { text: "Compare phone plans and pick the best deal", icon: <SearchIcon className="w-5 h-5 text-gray-300" /> },
    { text: "Find movies and shows I recently viewed", icon: <FilmIcon className="w-5 h-5 text-gray-300" /> },
];

export const SuggestionPrompts: React.FC<SuggestionPromptsProps> = ({ onPromptSelect }) => {
    return (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onPromptSelect(suggestion.text)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group text-gray-300 hover:text-white"
                    aria-label={`Suggestion: ${suggestion.text}`}
                >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-700/50 group-hover:bg-purple-600/50 transition-colors">
                        {suggestion.icon}
                    </div>
                    <div>
                        <p className="font-medium text-sm text-left">{suggestion.text}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
