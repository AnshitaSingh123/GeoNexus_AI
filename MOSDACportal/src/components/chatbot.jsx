import React, { useState, useEffect, useRef } from 'react';

// Geometric AI Assistant Icon (Dark Mode)
const AIAssistantIcon = ({ className, animate = false }) => (
    <div className={`relative ${animate ? 'animate-float' : ''}`}>
        <div className="relative w-10 h-10 transform rotate-45">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg"></div>
            <div className="absolute inset-1 bg-gradient-to-br from-blue-600 to-purple-700 rounded-md"></div>
            <div className="absolute inset-2 bg-gray-800 rounded-sm flex items-center justify-center transform -rotate-45">
                <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
            </div>
        </div>
    </div>
);

// Geometric User Icon (Dark Mode)
const UserIcon = ({ className }) => (
    <div className="relative group">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        </div>
    </div>
);

// Geometric Background Pattern (Dark Mode)
const GeometricBackground = () => {
    const shapes = [
        { id: 1, type: 'triangle', color: 'bg-blue-600/20', position: 'top-20 left-20', size: 'w-16 h-16', rotation: 'rotate-45' },
        { id: 2, type: 'circle', color: 'bg-purple-600/20', position: 'top-40 right-32', size: 'w-12 h-12', rotation: 'rotate-12' },
        { id: 3, type: 'square', color: 'bg-emerald-600/20', position: 'bottom-32 left-40', size: 'w-20 h-20', rotation: 'rotate-45' },
        { id: 4, type: 'hexagon', color: 'bg-orange-600/20', position: 'bottom-20 right-20', size: 'w-14 h-14', rotation: 'rotate-12' },
        { id: 5, type: 'line', color: 'bg-gradient-to-r from-blue-600/30 to-transparent', position: 'top-1/2 left-10', size: 'w-32 h-0.5', rotation: 'rotate-45' },
        { id: 6, type: 'line', color: 'bg-gradient-to-r from-purple-600/30 to-transparent', position: 'top-1/3 right-10', size: 'w-24 h-0.5', rotation: '-rotate-45' }
    ];

    return (
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            {shapes.map(shape => (
                <div 
                    key={shape.id}
                    className={`absolute ${shape.position} ${shape.size} ${shape.color} ${shape.rotation} ${
                        shape.type === 'circle' ? 'rounded-full' : 
                        shape.type === 'square' ? 'rounded-lg' : 
                        shape.type === 'triangle' ? 'rounded-sm' : ''
                    }`}
                />
            ))}
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4b5563_1px,transparent_1px),linear-gradient(to_bottom,#4b5563_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
    );
};

// Dark Page Wrapper
const PageWrapper = ({ children, setPage }) => (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen relative">
        <GeometricBackground />
        
        <div className="container mx-auto px-4 h-screen flex flex-col relative z-10">
            <button 
                onClick={() => setPage('home')} 
                className="flex-shrink-0 flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium my-6 group transition-colors duration-200"
            >
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span>Back to Home</span>
            </button>
            
            <main className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl shadow-xl flex-grow flex flex-col relative overflow-hidden">
                {/* Geometric accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                {children}
            </main>
        </div>
    </div>
);

// Dark Message Bubble with TTS controls
const MessageBubble = ({ message, isUser, onSpeak, isSpeaking, currentSpeakingId }) => {
    const isCurrentlySpeaking = currentSpeakingId === message.id && isSpeaking;
    
    return (
        <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
            {!isUser && (
                <div className="flex-shrink-0 mb-1">
                    <AIAssistantIcon />
                </div>
            )}
            
            <div className={`max-w-md transform transition-all duration-200 hover:scale-[1.02] ${
                isUser ? 'hover:shadow-lg' : 'hover:shadow-md'
            }`}>
                <div className={`px-4 py-3 rounded-2xl ${
                    isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md shadow' 
                    : 'bg-gray-700 border border-gray-600 text-gray-100 rounded-bl-md shadow-sm'
                }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    
                    {/* TTS controls for bot messages */}
                    {!isUser && (
                        <div className="mt-2 flex justify-end">
                            <button 
                                onClick={() => onSpeak(message)}
                                className={`p-1 rounded-full ${isCurrentlySpeaking ? 'bg-red-500/20' : 'bg-blue-500/20'} hover:bg-blue-500/30 transition-colors`}
                                title={isCurrentlySpeaking ? "Stop playback" : "Listen to response"}
                            >
                                {isCurrentlySpeaking ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {isUser && (
                <div className="flex-shrink-0 mb-1">
                    <UserIcon />
                </div>
            )}
        </div>
    );
};

// Dark Typing Indicator
const TypingIndicator = () => (
    <div className="flex items-end gap-3 justify-start">
        <div className="flex-shrink-0 mb-1">
            <AIAssistantIcon animate={true} />
        </div>
        
        <div className="bg-gray-700 border border-gray-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

// Dark Quick Suggestion Button
const QuickSuggestionButton = ({ text, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-gray-700 border border-gray-600 text-gray-200 px-4 py-2 rounded-full text-sm hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-300 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
    >
        {text}
    </button>
);

// Geometric Decorative Elements (Dark)
const GeometricDecor = () => {
    const dots = [
        { id: 1, color: 'bg-blue-500/60', position: 'top-4 right-4', size: 'w-3 h-3' },
        { id: 2, color: 'bg-purple-500/40', position: 'top-8 right-8', size: 'w-2 h-2' },
        { id: 3, color: 'bg-emerald-500/50', position: 'bottom-4 left-4', size: 'w-4 h-4' },
        { id: 4, color: 'bg-orange-500/60', position: 'bottom-8 left-8', size: 'w-2 h-2' }
    ];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {dots.map(dot => (
                <div 
                    key={dot.id}
                    className={`absolute ${dot.position} ${dot.size} ${dot.color} rounded-full`}
                />
            ))}
        </div>
    );
};

// Main Chatbot Component with Dark UI and Speech Recognition
export default function ChatbotPage({ setPage }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "Hello! I'm your MOSDAC AI assistant. I can help you find satellite data, explore missions, and navigate our knowledge base. What would you like to know?",
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
    const recognitionRef = useRef(null);
    const speechSynthesisRef = useRef(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Clean up speech synthesis on unmount
    useEffect(() => {
        return () => {
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSendMessage = (text) => {
        const content = text.trim();
        if (!content) return;

        const newMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: content,
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        
        setIsTyping(true);
        setTimeout(() => {
            const botResponse = {
                id: messages.length + 2,
                sender: 'bot',
                text: `Thank you for your question about "${content}". Let me analyze this and provide you with insights based on the available data.`,
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 2000);
    };

    const startSpeechRecognition = () => {
        if (isListening) {
            stopSpeechRecognition();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setInputValue("Listening...");
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            setInputValue(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setInputValue("");
        };

        recognition.onend = () => {
            setIsListening(false);
            if (inputValue && inputValue !== "Listening...") {
                handleSendMessage(inputValue);
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopSpeechRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const handleSpeak = (message) => {
        if (isSpeaking && currentSpeakingId === message.id) {
            // If this message is currently speaking, stop it
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            return;
        }

        // Stop any currently playing speech
        window.speechSynthesis.cancel();

        // Start speaking the new message
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setCurrentSpeakingId(message.id);
    };

    const quickSuggestions = [
        'Recent satellite missions',
        'Mumbai data search',
        'Cartosat-3 docs',
    ];

    return (
        <PageWrapper setPage={setPage}>
            <GeometricDecor />
            
            {/* Dark Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <AIAssistantIcon animate={true} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-100">MOSDAC AI</h1>
                        <div className="flex items-center space-x-2 text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isUser={msg.sender === 'user'} 
                            onSpeak={handleSpeak}
                            isSpeaking={isSpeaking}
                            currentSpeakingId={currentSpeakingId}
                        />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Dark Input Area */}
            <div className="flex-shrink-0 p-6 border-t border-gray-700">
                {/* Quick Suggestions */}
                {messages.length <= 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {quickSuggestions.map(q => (
                            <QuickSuggestionButton
                                key={q}
                                text={q}
                                onClick={() => handleSendMessage(q)}
                            />
                        ))}
                    </div>
                )}
                
                {/* Input with Mic Button */}
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder={isListening ? "Listening..." : "Type your message..."} 
                        className="flex-grow bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl py-3 pl-4 pr-12 text-gray-200 placeholder-gray-400 transition-all duration-200"
                    />
                    
                    {/* Send Button */}
                    <button 
                        onClick={() => handleSendMessage(inputValue)}
                        className="absolute right-14 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-200 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                    
                    {/* Microphone Button */}
                    <button
                        onClick={startSpeechRecognition}
                        className={`ml-2 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                            isListening 
                                ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                                : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                        }`}
                        title={isListening ? "Stop listening" : "Start voice input"}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </PageWrapper>
    );
}