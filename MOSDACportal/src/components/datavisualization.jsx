import React, { useState, useEffect, useRef } from 'react';

// Premium Page Wrapper with Blue theme and Geometric Shapes
const PageWrapper = ({ children, setPage }) => (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-screen py-8 md:py-12 relative overflow-hidden">
        {/* Animated geometric background */}
        <div className="absolute inset-0 opacity-10">
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-blue-400 rotate-45 animate-spin-slow"></div>
            <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-40 left-40 w-16 h-16 bg-indigo-500/30 transform rotate-45 animate-bounce-slow"></div>
            <div className="absolute top-1/3 right-1/4 w-20 h-20 border-2 border-indigo-400 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/3 w-28 h-28 border-2 border-blue-300 rotate-12 animate-spin-slow delay-2000"></div>
            
            {/* Hexagonal patterns */}
            <div className="absolute top-1/4 left-1/3 w-24 h-24 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse">
                    <polygon points="50,5 85,25 85,75 50,95 15,75 15,25" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"/>
                </svg>
            </div>
            <div className="absolute bottom-1/4 left-1/4 w-16 h-16 opacity-15">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                    <polygon points="50,5 85,25 85,75 50,95 15,75 15,25" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400"/>
                </svg>
            </div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-12 gap-4 h-full">
                    {Array.from({ length: 144 }, (_, i) => (
                        <div key={i} className="border border-blue-400 animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                </div>
            </div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute inset-0 opacity-15">
            <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Circuit-like lines */}
        <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,20 L20,20 L20,40 L40,40 L40,60 L60,60 L60,80 L80,80 L80,100" 
                      fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400 animate-pulse"/>
                <path d="M100,30 L80,30 L80,10 L60,10 L60,50 L40,50 L40,90 L20,90 L20,70 L0,70" 
                      fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400 animate-pulse delay-1000"/>
            </svg>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
            <button 
                onClick={() => setPage('home')} 
                className="group flex items-center space-x-3 text-blue-100 hover:text-white font-semibold mb-8 transition-all duration-300 hover:scale-105"
            >
                <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 group-hover:bg-blue-500/30 group-hover:border-blue-300/50 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <span>Back to Home</span>
            </button>
            
            <main className="bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500/20 p-6 md:p-10 animate-fade-in">
                {children}
            </main>
        </div>
    </div>
);

// 3D Interactive Line Chart Component with Blue Theme
const LineChart = () => {
    const [tooltip, setTooltip] = useState(null);
    const [animationProgress, setAnimationProgress] = useState(0);
    const svgRef = useRef(null);
    
    const data = [
        { name: 'Jan', users: 400 }, { name: 'Feb', users: 300 },
        { name: 'Mar', users: 600 }, { name: 'Apr', users: 820 },
        { name: 'May', users: 500 }, { name: 'Jun', users: 700 },
    ];
    
    const width = 600;
    const height = 300;
    const padding = 60;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationProgress(1);
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    const xScale = (i) => padding + i * (width - 2 * padding) / (data.length - 1);
    const yScale = (value) => height - padding - (value / 1000) * (height - 2 * padding);

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.users)}`).join(' ');
    const yAxisLabels = [0, 200, 400, 600, 800];

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#1d4ed8" />
                            <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Y-axis grid lines */}
                    {yAxisLabels.map((label, i) => (
                        <g key={label}>
                            <line 
                                x1={padding} y1={yScale(label)} 
                                x2={width - padding} y2={yScale(label)} 
                                className="stroke-blue-400/30" 
                                strokeDasharray="4"
                                style={{
                                    strokeDashoffset: animationProgress ? 0 : 100,
                                    transition: `stroke-dashoffset ${0.5 + i * 0.1}s ease-out`
                                }}
                            />
                            <text 
                                x={padding - 15} y={yScale(label) + 5} 
                                textAnchor="end" 
                                className="text-xs fill-blue-200/80 font-medium"
                            >
                                {label}
                            </text>
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => (
                        <text 
                            key={d.name} 
                            x={xScale(i)} 
                            y={height - padding + 25} 
                            textAnchor="middle" 
                            className="text-sm fill-blue-200/80 font-medium"
                        >
                            {d.name}
                        </text>
                    ))}

                    {/* Area under curve */}
                    <path 
                        d={`${linePath} L ${xScale(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`}
                        fill="url(#areaGradient)"
                        style={{
                            pathLength: animationProgress,
                            transition: 'path-length 2s ease-out'
                        }}
                    />

                    {/* Main line */}
                    <path 
                        d={linePath} 
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        style={{
                            pathLength: animationProgress,
                            transition: 'path-length 2s ease-out'
                        }}
                    />

                    {/* Data points with 3D effect */}
                    {data.map((d, i) => (
                        <g key={d.name}>
                            {/* Outer glow */}
                            <circle 
                                cx={xScale(i)} cy={yScale(d.users)} 
                                r="12" 
                                className="fill-blue-400/30"
                                style={{
                                    opacity: animationProgress,
                                    transition: `opacity ${1 + i * 0.2}s ease-out`
                                }}
                            />
                            {/* Shadow circle */}
                            <circle 
                                cx={xScale(i) + 2} cy={yScale(d.users) + 2} 
                                r="8" 
                                className="fill-slate-900/40"
                                style={{
                                    opacity: animationProgress,
                                    transition: `opacity ${1 + i * 0.2}s ease-out`
                                }}
                            />
                            {/* Main circle */}
                            <circle 
                                cx={xScale(i)} cy={yScale(d.users)} 
                                r="8" 
                                className="fill-white cursor-pointer hover:fill-blue-300 transition-all duration-300 hover:scale-125"
                                style={{
                                    opacity: animationProgress,
                                    transition: `opacity ${1 + i * 0.2}s ease-out, fill 0.3s ease, transform 0.3s ease`
                                }}
                            />
                            {/* Inner circle */}
                            <circle 
                                cx={xScale(i)} cy={yScale(d.users)} 
                                r="4" 
                                className="fill-blue-500"
                                style={{
                                    opacity: animationProgress,
                                    transition: `opacity ${1 + i * 0.2}s ease-out`
                                }}
                            />
                            {/* Hover target */}
                            <circle 
                                cx={xScale(i)} cy={yScale(d.users)} 
                                r="20" 
                                className="fill-transparent cursor-pointer"
                                onMouseOver={() => setTooltip({ x: xScale(i), y: yScale(d.users), ...d })}
                                onMouseOut={() => setTooltip(null)}
                            />
                        </g>
                    ))}
                </svg>

                {/* Enhanced tooltip */}
                {tooltip && (
                    <div 
                        className="absolute p-4 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl border border-blue-400/30 backdrop-blur-sm pointer-events-none transform -translate-x-1/2 animate-fade-in"
                        style={{ left: tooltip.x, top: tooltip.y - 80 }}
                    >
                        <div className="font-bold text-lg">{tooltip.name}</div>
                        <div className="text-blue-100">Users: <span className="font-semibold text-blue-300">{tooltip.users.toLocaleString()}</span></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 3D Interactive Pie Chart Component with Blue Theme
const PieChart = () => {
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const [animationProgress, setAnimationProgress] = useState(0);
    
    const data = [
        { name: 'Land Products', value: 30, color: '#1e40af', gradient: 'from-blue-600 to-blue-700' },
        { name: 'Ocean Products', value: 40, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
        { name: 'Atmospheric Products', value: 20, color: '#60a5fa', gradient: 'from-blue-400 to-blue-500' },
        { name: 'Climate Products', value: 10, color: '#93c5fd', gradient: 'from-blue-300 to-blue-400' },
    ];
    
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulative = 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationProgress(1);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const getPath = (value, isHovered) => {
        const startAngle = (cumulative / total) * 360;
        const endAngle = ((cumulative + value) / total) * 360;
        const radius = isHovered ? 58 : 50;
        const x1 = 50 + radius * Math.cos(Math.PI * startAngle / 180);
        const y1 = 50 + radius * Math.sin(Math.PI * startAngle / 180);
        const x2 = 50 + radius * Math.cos(Math.PI * endAngle / 180);
        const y2 = 50 + radius * Math.sin(Math.PI * endAngle / 180);
        const largeArcFlag = value / total > 0.5 ? 1 : 0;
        return `M 50,50 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative w-80 h-80 bg-slate-800/30 backdrop-blur-sm rounded-full border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 transform -rotate-90">
                        <defs>
                            {data.map((item, index) => (
                                <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={item.color} stopOpacity="0.9" />
                                    <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                                </linearGradient>
                            ))}
                            <filter id="pieGlow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge> 
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {data.map((item, index) => {
                            const path = getPath(item.value, hoveredSlice === index);
                            const currentCumulative = cumulative;
                            cumulative += item.value;
                            
                            return (
                                <g key={index}>
                                    {/* Shadow path */}
                                    <path 
                                        d={getPath(item.value, false)}
                                        fill="rgba(0,0,0,0.3)"
                                        transform="translate(1, 1)"
                                        style={{
                                            clipPath: `inset(0 ${100 - (animationProgress * 100)}% 0 0)`,
                                            transition: `clip-path ${1 + index * 0.2}s ease-out`
                                        }}
                                    />
                                    {/* Main path */}
                                    <path 
                                        d={path}
                                        fill={`url(#gradient-${index})`}
                                        filter="url(#pieGlow)"
                                        onMouseOver={() => setHoveredSlice(index)}
                                        onMouseOut={() => setHoveredSlice(null)}
                                        className="cursor-pointer transition-all duration-300 hover:brightness-110"
                                        style={{
                                            clipPath: `inset(0 ${100 - (animationProgress * 100)}% 0 0)`,
                                            transition: `clip-path ${1 + index * 0.2}s ease-out, fill 0.3s ease, transform 0.3s ease`,
                                            transformOrigin: '50px 50px'
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {hoveredSlice !== null ? (
                            <div className="text-center animate-fade-in">
                                <div className="text-sm text-blue-200 font-medium">{data[hoveredSlice].name}</div>
                                <div className="text-3xl font-bold text-white">{data[hoveredSlice].value}%</div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-sm text-blue-200 font-medium">Total</div>
                                <div className="text-3xl font-bold text-white">100%</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Legend with 3D cards */}
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div 
                        key={item.name} 
                        className="group flex items-center space-x-4 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                    >
                        <div 
                            className="w-6 h-6 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                            style={{
                                background: `linear-gradient(135deg, ${item.color}CC, ${item.color})`
                            }}
                        ></div>
                        <div className="flex-1">
                            <div className="text-white font-medium group-hover:text-blue-300 transition-colors duration-300">{item.name}</div>
                            <div className="text-blue-200/60 text-sm">Usage Distribution</div>
                        </div>
                        <div className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                            {item.value}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Premium Data Visualization Component
export default function PremiumDataVisualizationPage({ setPage }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <PageWrapper setPage={setPage}>
            {/* Header with live time */}
            <div className="text-center mb-16 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent rounded-3xl blur-xl"></div>
                
                <div className="relative">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm mb-6">
                        <span className="text-blue-100 text-sm font-medium">
                            Live Data • {currentTime.toLocaleTimeString()}
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent mb-6 animate-gradient">
                        Analytics Command Center
                    </h1>
                    
                    <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
                        Real-time satellite data insights with advanced 3D visualization and interactive analytics
                    </p>
                </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {[
                    { title: 'Active Users', value: '2.4K', trend: '+12%', color: 'from-blue-500 to-blue-600' },
                    { title: 'Data Processed', value: '847GB', trend: '+24%', color: 'from-indigo-500 to-indigo-600' },
                    { title: 'API Calls', value: '156K', trend: '+8%', color: 'from-blue-600 to-indigo-600' }
                ].map((stat, index) => (
                    <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500" style={{backgroundImage: `linear-gradient(to right, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`}}></div>
                        
                        <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <div className="text-blue-200/70 text-sm font-medium mb-2">{stat.title}</div>
                            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-blue-400 text-sm font-medium">{stat.trend} from last month</div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Chart sections */}
            <div className="space-y-16">
                <div className="group">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center group-hover:text-blue-300 transition-colors duration-300">
                        Monthly User Activity Trends
                    </h2>
                    <LineChart />
                </div>
                
                <div className="group">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center group-hover:text-indigo-300 transition-colors duration-300">
                        Product Distribution Analytics
                    </h2>
                    <PieChart />
                </div>
            </div>
            
            {/* Footer with additional info */}
            <div className="mt-16 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-blue-100 text-sm font-medium">System Status: All Services Operational</span>
                </div>
            </div>
        </PageWrapper>
    );
}

// Add custom CSS animations with blue theme
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes gradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .animate-fade-in {
        animation: fade-in 0.6s ease-out;
    }
    
    .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 3s ease infinite;
    }
    
    .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
    }
    
    .animate-bounce-slow {
        animation: bounce-slow 3s ease-in-out infinite;
    }
`;
document.head.appendChild(style);