import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from './types';
import { OmniBox } from './components/OmniBox';
import { ResponseDisplay } from './components/ResponseDisplay';
import { GeminiIcon } from './components/icons';
import { SuggestionPrompts } from './components/SuggestionPrompts';
import { AddressBar } from './components/AddressBar';

// Extend JSX.IntrinsicElements to include webview
declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: React.DetailedHTMLProps<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
        }
    }
}

const App: React.FC = () => {
    const [history, setHistory] = useState<Message[]>([]);
    const [streamingResponse, setStreamingResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [isBrowserView, setIsBrowserView] = useState<boolean>(false);

    const chatRef = useRef<Chat | null>(null);
    const webviewRef = useRef<HTMLWebViewElement>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction: 'You are an advanced AI assistant integrated into a futuristic browser interface. Your name is Aether. Provide clear, concise, and helpful responses. Format your answers using markdown.',
                },
            });
        } catch (e: any) {
            console.error(e);
            setError("Failed to initialize Gemini AI. Please check your API key.");
        }
    }, []);

    useEffect(() => {
        const handleNavigateWebview = (event: Electron.IpcRendererEvent, url: string) => {
            if (webviewRef.current) {
                webviewRef.current.loadURL(url);
                setCurrentUrl(url);
            }
        };

        window.ipcRenderer.on('navigate-webview', handleNavigateWebview);

        return () => {
            window.ipcRenderer.off('navigate-webview', handleNavigateWebview);
        };
    }, []);

    const isValidUrl = (str: string): boolean => {
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

    const handleNavigate = (url: string) => {
        let formattedUrl = url;
        if (!/^(https?:\/\/)/i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }
        setCurrentUrl(formattedUrl);
        setIsBrowserView(true);
        if (webviewRef.current) {
            webviewRef.current.loadURL(formattedUrl);
        }
    };

    const handleSendMessage = async (prompt: string) => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isLoading) return;

        if (isValidUrl(trimmedPrompt)) {
            handleNavigate(trimmedPrompt);
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

    return (
        <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
            <header className="p-4 border-b border-gray-700/50 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                <div className="flex items-center space-x-2">
                    {isBrowserView ? (
                        <button onClick={() => setIsBrowserView(false)} className="text-gray-400 hover:text-white">
                            &larr; Back to Chat
                        </button>
                    ) : (
                        <>
                            <GeminiIcon className="w-6 h-6" />
                            <h1 className="text-lg font-semibold">Aether Browser</h1>
                        </>
                    )}
                </div>
                <div className="mt-2">
                    <AddressBar onNavigate={handleNavigate} />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                {isBrowserView ? (
                    <webview 
                        ref={webviewRef}
                        src={currentUrl} 
                        className="w-full h-full"
                        webpreferences="webviewTag=true, contextIsolation=false, nodeIntegration=true, webSecurity=no, allowpopups=yes"
                    ></webview>
                ) : (
                    <div className="flex flex-col h-full">
                        {!hasHistory && (
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="w-full max-w-2xl text-center">
                                    <GeminiIcon className="w-20 h-20 mx-auto mb-6" />
                                    <h1 className="text-5xl md:text-6xl font-bold gemini-gradient-text mb-8">Aether</h1>
                                    <div className="max-w-xl mx-auto">
                                        <OmniBox onSubmit={handleSendMessage} isLoading={isLoading} />
                                    </div>
                                    <SuggestionPrompts onPromptSelect={handleSendMessage} />
                                </div>
                            </div>
                        )}
                        {hasHistory && (
                             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <ResponseDisplay 
                                    history={history} 
                                    streamingResponse={streamingResponse}
                                    isLoading={isLoading} 
                                />
                            </div>
                        )}
                        <footer className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
                            <div className="max-w-4xl mx-auto">
                                {error && <p className="text-red-500 text-center mb-2">{error}</p>}
                                <OmniBox onSubmit={handleSendMessage} isLoading={isLoading} />
                            </div>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;