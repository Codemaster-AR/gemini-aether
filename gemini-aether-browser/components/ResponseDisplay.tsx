import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { UserIcon, GeminiIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ResponseDisplayProps {
  history: Message[];
  streamingResponse: string;
  isLoading: boolean;
}

const MessageBlock: React.FC<{ message: Message }> = ({ message }) => {
    const isModel = message.role === 'model';
    
    // Basic markdown to HTML conversion for code blocks
    const formattedContent = message.content.replace(/```([\s\S]*?)```/g, (match, code) => {
        const language = code.match(/^(.*?)\n/)?.[1] || '';
        const rawCode = language ? code.substring(language.length + 1) : code;
        return `<pre class="bg-gray-800 rounded-md p-4 my-2 overflow-x-auto"><div class="text-xs text-gray-400 mb-2">${language}</div><code class="font-mono text-sm">${rawCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    }).replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 text-sm font-mono">$1</code>');


    return (
        <div className={`flex items-start gap-4 my-4 max-w-4xl mx-auto ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-purple-500' : 'bg-blue-500'}`}>
                {isModel ? <GeminiIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
            </div>
            <div className={`p-4 rounded-lg prose prose-invert prose-sm max-w-none ${isModel ? 'bg-gray-800/50' : 'bg-blue-900/50'}`}>
                <div dangerouslySetInnerHTML={{ __html: formattedContent.replace(/\n/g, '<br />') }} />
            </div>
        </div>
    );
};

const StreamingMessageBlock: React.FC<{ content: string }> = ({ content }) => {
    if (!content) return null;
    return (
        <div className="flex items-start gap-4 my-4 max-w-4xl mx-auto">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-500">
                <GeminiIcon className="w-5 h-5 text-white" />
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50 prose prose-invert prose-sm max-w-none">
                <p>{content}<span className="blinking-cursor"></span></p>
            </div>
        </div>
    );
};


export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ history, streamingResponse, isLoading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, streamingResponse]);

    return (
        <div className="space-y-4">
            {history.map((msg, index) => (
                <MessageBlock key={index} message={msg} />
            ))}
            
            {streamingResponse && <StreamingMessageBlock content={streamingResponse} />}

            {isLoading && !streamingResponse && (
                <div className="flex justify-center items-center gap-2 max-w-4xl mx-auto text-gray-400">
                    <LoadingSpinner />
                    <span>Aether is thinking...</span>
                </div>
            )}
            <div ref={scrollRef} />
        </div>
    );
};