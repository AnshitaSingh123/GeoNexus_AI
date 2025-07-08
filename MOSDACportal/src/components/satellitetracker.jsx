import React, { useState, useEffect } from 'react';

// ICONS
const SatelliteTrackerIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-10 w-10"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.515 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
        <path d="M12 10c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" />
        <path d="M12 4c-4.411 0-8 3.589-8 8h2c0-3.309 2.691-6 6-6s6 2.691 6 6h2c0-4.411-3.589-8-8-8z" />
    </svg>
    
);

// Page Wrapper for consistent layout
const PageWrapper = ({ children, setPage }) => (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 md:py-12 transition-colors duration-300">
        <div className="container mx-auto px-6">
            <button onClick={() => setPage('home')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold mb-8 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Back to Home</span>
            </button>
            <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 animate-fade-in">
                {children}
            </main>
        </div>
    </div>
);

// Satellite Info Card Component
const SatelliteCard = ({ satellite }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700/50">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <SatelliteTrackerIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">{satellite.name}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">Position</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-200">{satellite.position}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">Velocity</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-200">{satellite.velocity}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">Altitude</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-200">{satellite.altitude}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 dark:text-gray-400">Status</div>
                        <div className="font-semibold text-green-500">{satellite.status}</div>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 mt-1">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>
        </div>
    </div>
);

// Main Satellite Tracker Page Component
export default function SatelliteTrackerPage({ setPage }) {
    const [time, setTime] = useState(new Date());
    const [satellites, setSatellites] = useState([
        { name: 'Cartosat-3', position: '28.54°, 77.27°', velocity: '7.5 km/s', altitude: '509 km', status: 'Active' },
        { name: 'RISAT-2B', position: '13.00°, 80.23°', velocity: '7.4 km/s', altitude: '557 km', status: 'Active' },
        { name: 'Oceansat-3', position: '19.06°, 72.87°', velocity: '7.2 km/s', altitude: '817 km', status: 'Active' },
    ]);

    // Effect for the live clock
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    // Effect for simulating data updates
    useEffect(() => {
        const intervalId = setInterval(() => {
            setSatellites(sats => sats.map(sat => {
                const [lat, lon] = sat.position.replace(/°/g, '').split(', ');
                const newLat = (parseFloat(lat) + Math.random() * 0.01 - 0.005).toFixed(2);
                const newLon = (parseFloat(lon) + Math.random() * 0.01 - 0.005).toFixed(2);
                return { ...sat, position: `${newLat}°, ${newLon}°` };
            }));`   `
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <PageWrapper title="Satellite Tracker" setPage={setPage}>
            <div className="flex items-center space-x-4 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.515 2 12 2zm-1 15v-5l-4-2 8-6v5l4 2-8 6z"/></svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Satellite Tracker</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block -mt-0.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {time.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {satellites.map(sat => <SatelliteCard key={sat.name} satellite={sat} />)}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-center text-sm">
                <strong>Live Tracking:</strong> Satellite positions update every 5 seconds.
            </div>
        </PageWrapper>
    );
}
