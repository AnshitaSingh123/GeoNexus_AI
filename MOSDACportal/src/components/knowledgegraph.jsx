import React, { useState, useEffect, useRef } from 'react';

// ICONS (re-used for consistency)
const KnowledgeGraphIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-10 w-10 animate-fade-in"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" />
        <path d="M19 14h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm-9-4c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" />
    </svg>
);

// Geometric shapes for different node types
const GeometricShape = ({ type, color, size = 60, isHovered = false }) => {
    const shapeClass = `transition-all duration-500 ease-out ${isHovered ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}`;
    
    switch (type) {
        case 'Satellite':
            return (
                <div className={`${shapeClass} relative`} style={{ width: size, height: size }}>
                    <div 
                        className="absolute inset-0 rounded-lg transform rotate-45 shadow-2xl"
                        style={{ 
                            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                            animation: isHovered ? 'pulse 2s infinite' : 'none'
                        }}
                    />
                    <div className="absolute inset-2 bg-white/20 rounded-lg transform rotate-45" />
                </div>
            );
        case 'Mission':
            return (
                <div className={`${shapeClass} relative`} style={{ width: size, height: size }}>
                    <div 
                        className="absolute inset-0 rounded-full shadow-2xl"
                        style={{ 
                            background: `conic-gradient(from 0deg, ${color}, ${color}aa, ${color})`,
                            animation: isHovered ? 'spin 3s linear infinite' : 'none'
                        }}
                    />
                    <div className="absolute inset-2 bg-white/20 rounded-full" />
                </div>
            );
        case 'Data':
            return (
                <div className={`${shapeClass} relative`} style={{ width: size, height: size }}>
                    <div 
                        className="absolute inset-0 shadow-2xl"
                        style={{ 
                            background: `linear-gradient(60deg, ${color}, ${color}cc, ${color})`,
                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                            animation: isHovered ? 'bounce 1s infinite' : 'none'
                        }}
                    />
                    <div 
                        className="absolute inset-2 bg-white/20"
                        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                    />
                </div>
            );
        case 'Location':
            return (
                <div className={`${shapeClass} relative`} style={{ width: size, height: size }}>
                    <div 
                        className="absolute inset-0 shadow-2xl"
                        style={{ 
                            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}88)`,
                            clipPath: 'polygon(30% 0%, 0% 50%, 30% 100%, 100% 70%, 70% 30%)',
                            animation: isHovered ? 'wiggle 0.5s ease-in-out infinite' : 'none'
                        }}
                    />
                    <div 
                        className="absolute inset-2 bg-white/20"
                        style={{ clipPath: 'polygon(30% 0%, 0% 50%, 30% 100%, 100% 70%, 70% 30%)' }}
                    />
                </div>
            );
        default:
            return (
                <div className={`${shapeClass} relative`} style={{ width: size, height: size }}>
                    <div 
                        className="absolute inset-0 rounded-full shadow-2xl"
                        style={{ 
                            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                            animation: isHovered ? 'pulse 2s infinite' : 'none'
                        }}
                    />
                </div>
            );
    }
};

// Animated connection line
const AnimatedLine = ({ x1, y1, x2, y2, isActive = false }) => {
    const [dashOffset, setDashOffset] = useState(0);
    
    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                setDashOffset(prev => (prev + 1) % 20);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isActive]);
    
    return (
        <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
                                        className={`transition-all duration-300 ${isActive ? 'stroke-blue-400 stroke-2' : 'stroke-gray-300 dark:stroke-gray-600 stroke-1'}`}
            strokeDasharray={isActive ? "5,5" : "none"}
            strokeDashoffset={isActive ? -dashOffset : 0}
            style={{
                filter: isActive ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'none'
            }}
        />
    );
};

// Page Wrapper for consistent layout
const PageWrapper = ({ children, setPage }) => (
    <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 min-h-screen py-8 md:py-12 transition-colors duration-300 overflow-hidden">
        {/* Enhanced 3D Background Animation */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-800/30 to-gray-700/30 rounded-full opacity-40 blur-3xl animate-float-slow" />
            <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-gradient-to-r from-gray-700/30 to-blue-800/30 rounded-full opacity-30 blur-3xl animate-float-reverse" />
            <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-700/30 to-gray-800/30 rounded-full opacity-35 blur-3xl animate-float-alt" />
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-gray-600/20 to-blue-700/20 rounded-full opacity-25 blur-3xl animate-pulse-slow" />
        </div>

        {/* Geometric background pattern */}
        <div className="absolute inset-0 -z-5 opacity-5">
            <div className="absolute top-20 left-20 w-4 h-4 bg-white transform rotate-45 animate-ping" />
            <div className="absolute top-40 right-40 w-3 h-3 bg-white rounded-full animate-pulse" />
            <div className="absolute bottom-32 left-32 w-5 h-5 bg-white transform rotate-45 animate-bounce" />
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-white rounded-full animate-ping" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <button 
                onClick={() => setPage('home')} 
                className="flex items-center space-x-2 text-blue-300 hover:text-blue-100 font-semibold mb-8 transition-all duration-300 hover:scale-105 hover:translate-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back to Home</span>
            </button>
            <main className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 animate-fade-in">
                {children}
            </main>
        </div>
    </div>
);

// The main Knowledge Graph Page Component
export default function KnowledgeGraphPage({ setPage }) {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All Types');
    
    const nodes = [
        { id: 'Cartosat-3', x: 250, y: 150, color: '#4F46E5', type: 'Satellite' },
        { id: 'RISAT-2B', x: 350, y: 300, color: '#4F46E5', type: 'Satellite' },
        { id: 'Earth Obs', x: 400, y: 200, color: '#8B5CF6', type: 'Mission' },
        { id: 'India', x: 200, y: 250, color: '#DB2777', type: 'Location' },
        { id: 'HR Imagery', x: 550, y: 150, color: '#F59E0B', type: 'Data' },
        { id: 'SAR Data', x: 500, y: 280, color: '#10B981', type: 'Data' },
    ];
    
    const links = [
        { source: 'Cartosat-3', target: 'Earth Obs' },
        { source: 'RISAT-2B', target: 'Earth Obs' },
        { source: 'Cartosat-3', target: 'India' },
        { source: 'RISAT-2B', target: 'India' },
        { source: 'Earth Obs', target: 'HR Imagery' },
        { source: 'Earth Obs', target: 'SAR Data' },
        { source: 'Cartosat-3', target: 'HR Imagery' },
        { source: 'RISAT-2B', target: 'SAR Data' },
    ];
    
    const nodeMap = nodes.reduce((acc, node) => ({ ...acc, [node.id]: node }), {});
    
    const getConnectedNodes = (nodeId) => {
        const connected = new Set();
        links.forEach(link => {
            if (link.source === nodeId) connected.add(link.target);
            if (link.target === nodeId) connected.add(link.source);
        });
        return connected;
    };
    
    const isConnectionActive = (link) => {
        if (!hoveredNode && !selectedNode) return false;
        const activeNode = hoveredNode || selectedNode;
        return link.source === activeNode || link.target === activeNode;
    };

    const legend = [
        { name: 'Cartosat-3', type: 'Satellite', color: '#4F46E5' },
        { name: 'Earth Observation', type: 'Mission', color: '#8B5CF6' },
        { name: 'High Resolution Imagery', type: 'Data', color: '#F59E0B' },
        { name: 'India', type: 'Location', color: '#DB2777' },
        { name: 'RISAT-2B', type: 'Satellite', color: '#4F46E5' },
        { name: 'SAR Data', type: 'Data', color: '#10B981' },
    ];

    return (
        <PageWrapper setPage={setPage}>
            <div className="flex justify-between items-center mb-6 animate-fade-in">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-blue-800/20 to-gray-700/20 backdrop-blur-sm rounded-xl animate-pulse">
                        <KnowledgeGraphIcon className="h-8 w-8 text-blue-300" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        3D Knowledge Graph Explorer
                    </h2>
                </div>
                <button className="text-blue-300 hover:text-blue-100 transition-all duration-300 hover:scale-110 hover:rotate-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center space-x-4 mb-6 animate-fade-in">
                <div className="relative flex-grow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search entities..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 focus:border-blue-400 focus:ring-0 rounded-xl py-3 pl-12 pr-4 text-white placeholder-blue-200 transition-all duration-300 focus:scale-105" 
                    />
                </div>
                <div className="relative">
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="appearance-none w-48 bg-white/10 backdrop-blur-sm border-2 border-white/20 focus:border-blue-400 focus:ring-0 rounded-xl py-3 pl-4 pr-10 text-white transition-all duration-300 focus:scale-105"
                    >
                        <option>All Types</option>
                        <option>Satellite</option>
                        <option>Mission</option>
                        <option>Data</option>
                        <option>Location</option>
                    </select>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>

            <div className="border-2 border-white/20 rounded-2xl p-6 h-[60vh] flex items-center justify-center bg-gradient-to-br from-white/5 to-blue-800/5 backdrop-blur-sm animate-fade-in relative overflow-hidden">
                {/* 3D Grid Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                    }} />
                </div>
                
                <svg viewBox="0 0 800 400" className="w-full h-full relative z-10">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Render connections */}
                    <g>
                        {links.map((link, i) => (
                            <AnimatedLine
                                key={i}
                                x1={nodeMap[link.source].x}
                                y1={nodeMap[link.source].y}
                                x2={nodeMap[link.target].x}
                                y2={nodeMap[link.target].y}
                                isActive={isConnectionActive(link)}
                            />
                        ))}
                    </g>
                    
                    {/* Render nodes */}
                    <g>
                        {nodes.map(node => {
                            const isHovered = hoveredNode === node.id;
                            const isSelected = selectedNode === node.id;
                            const isConnected = hoveredNode && getConnectedNodes(hoveredNode).has(node.id);
                            
                            return (
                                <foreignObject
                                    key={node.id}
                                    x={node.x - 30}
                                    y={node.y - 30}
                                    width="60"
                                    height="60"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className={`transform transition-all duration-300 ${isHovered || isSelected ? 'scale-110' : 'scale-100'} ${isConnected ? 'scale-105' : ''}`}>
                                            <GeometricShape 
                                                type={node.type} 
                                                color={node.color} 
                                                size={isHovered || isSelected ? 70 : 60}
                                                isHovered={isHovered || isSelected}
                                            />
                                        </div>
                                        <div className={`mt-2 text-xs font-semibold text-center transition-all duration-300 ${
                                            isHovered || isSelected ? 'text-white scale-110' : 'text-blue-200'
                                        }`}>
                                            {node.id}
                                        </div>
                                    </div>
                                </foreignObject>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Enhanced Legend */}
            <div className="mt-8 border-t border-white/20 pt-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4">Legend</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {legend.map((item, index) => (
                        <div 
                            key={item.name} 
                            className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-pointer"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex-shrink-0">
                                <GeometricShape type={item.type} color={item.color} size={40} />
                            </div>
                            <div className="flex-grow">
                                <div className="text-white font-medium">{item.name}</div>
                                <div className="text-sm text-blue-200 bg-white/10 px-2 py-1 rounded-md inline-block">
                                    {item.type}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Node Details Panel */}
            {selectedNode && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-800/20 to-gray-700/20 backdrop-blur-sm rounded-xl border border-white/20 animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-2">Selected: {selectedNode}</h3>
                    <div className="text-blue-200">
                        <p>Type: {nodeMap[selectedNode].type}</p>
                        <p>Connected to: {Array.from(getConnectedNodes(selectedNode)).join(', ')}</p>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}

// Custom CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float-slow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes float-reverse {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(20px) rotate(-180deg); }
    }
    
    @keyframes float-alt {
        0%, 100% { transform: translateX(0px) rotate(0deg); }
        50% { transform: translateX(-15px) rotate(90deg); }
    }
    
    @keyframes pulse-slow {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
    }
    
    @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-5deg); }
        75% { transform: rotate(5deg); }
    }
    
    .animate-float-slow {
        animation: float-slow 6s ease-in-out infinite;
    }
    
    .animate-float-reverse {
        animation: float-reverse 8s ease-in-out infinite;
    }
    
    .animate-float-alt {
        animation: float-alt 7s ease-in-out infinite;
    }
    
    .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
    }
    
    .animate-fade-in {
        animation: fadeIn 0.8s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);