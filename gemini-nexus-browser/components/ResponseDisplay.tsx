
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
    }).replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-