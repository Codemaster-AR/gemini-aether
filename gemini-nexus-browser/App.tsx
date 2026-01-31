
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from './types';
import { OmniBox } from './components/OmniBox';
import { ResponseDisplay } from './components/ResponseDisplay';
import { GeminiIcon } from './components/icons';
import { SuggestionPrompts } from './components/SuggestionPrompts';

const App: React.FC = () => {
    const [history, setHistory] = useState<Message[]>([]);
    const [streamingResponse, setStreamingResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction: 'You are an advanced AI assistant integrated into a futuristic browser interface. Your name is Nexus. Provide clear, concise, and helpful responses. Format your answers using markdown.',
                },
            });
        } catch (e: any) {
            console.error(e);
            setError("Failed to initialize Gemini AI. Please check your API key.");
        }
    }, []);

    const isValidUrl = (str: string): boolean => {
        // Simple check for something that looks like a domain.
        if (str.includes('.') && !str.includes(' ') && !str.startsWith('http')) {
            str = `https://${str}`;
        }
        
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };


    const handleSendMessage = async (prompt: string) => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isLoading) return;

        if (isValidUrl(trimmedPrompt)) {
            let url = trimmedPrompt;
            if (!/^(https?:\/\/)/i.test(url)) {
                url = `https://${url}`;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        if (!chatRef.current) return;

        setIsLoading(true);
        setError(null);
        setStreamingResponse('');

        const userMessage: Message = { role: 'user', content: trimmedPrompt };
        setHistory(prev => [...prev, userMessage]);
        
        try {
            const result = await chatRef.current.sendMessageStream({ message: trimmedPrompt });
            let text = '';
            for await (const chunk of result) {
                const responseChunk = chunk as GenerateContentResponse;
                const chunkText = responseChunk.text;
                if(chunkText) {
                    text += chunkText;
                    setStreamingResponse(text);
                }
            }

            const modelMessage: Message = { role: 'model', content: text };
            setHistory(prev => [...prev, modelMessage]);

        } catch (e: any)
        {
            console.error(e);
            setError("Sorry, something went wrong. Please try again.");
            const errorMessage: Message = { role: 'model', content: "Error: Could not get a response." };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setStreamingResponse('');
            setIsLoading(false);
        }
    };

    const hasHistory = history.length > 0;

    if (!hasHistory) {
        return (
            <div className="h-screen w-screen bg-gray-900 text-gray-200 flex items-center justify-center font-sans p-4">
                <div className="w-full max-w-2xl text-center">
                    <GeminiIcon className="w-20 h-20 mx-auto mb-6" />
                    <h1 className="text-5xl md:text-6xl font-bold gemini-gradient-text mb-8">Nexus</h1>
                    <div className="max-w-xl mx-auto">
                        <OmniBox onSubmit={handleSendMessage} isLoading={isLoading} />
                    </div>
                    <SuggestionPrompts onPromptSelect={handleSendMessage} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
            <header className="p-4 border-b border-gray-700/50 flex items-center space-x-2 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <GeminiIcon className="w-6 h-6" />
                <h1 className="text-lg font-semibold">Nexus Browser</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <ResponseDisplay 
                    history={history} 
                    streamingResponse={streamingResponse}
                    isLoading={isLoading} 
                />
            </main>

            <footer className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
                <div className="max-w-4xl mx-auto">
                    {error && <p className="text-red-500 text-center mb-2">{error}</p>}
                    <OmniBox onSubmit={handleSendMessage} isLoading={isLoading} />
                </div>
            </footer>
        </div>
    );
};

export default App;