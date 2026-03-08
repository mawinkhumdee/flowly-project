import React from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function TripManager({ trips = [], onSelectTrip, onRefresh }) {
    
    const handleCreateTrip = async () => {
        const title = prompt("Enter Trip Title:", "New Summer Trip 🌴");
        if (!title) return;

        try {
            const response = await fetch(`${API_BASE_URL}/trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, status: 'In Progress' }),
            });
            if (response.ok) {
                const newTrip = await response.json();
                await onRefresh();
                onSelectTrip(newTrip);
            }
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    const handleDeleteTrip = async (e, tripId) => {
        e.stopPropagation(); // Prevent selecting the trip when clicking delete
        if (!window.confirm("Are you sure you want to delete this trip and all its stops?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    };

    return (
        <div className="flex-1 w-full bg-[#f6f8f5] font-sans text-[#1A1A1A] flex flex-col pt-8 px-4 md:px-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="max-w-2xl mx-auto w-full">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">My Journeys</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1.5">Your adventure map</p>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
                    </button>
                </header>

                {/* Main Content Grid */}
                <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

                    {/* Create New Card */}
                    <button 
                        onClick={handleCreateTrip}
                        className="group w-full aspect-square sm:aspect-auto sm:h-48 rounded-3xl border-2 border-dashed border-slate-200 hover:border-[#0f8201] hover:bg-[#0f8201]/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-transparent"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#0f8201]/10 group-hover:bg-[#0f8201] group-hover:text-white text-[#0f8201] flex items-center justify-center transition-all duration-300 transform group-hover:rotate-90">
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </div>
                        <span className="text-slate-500 font-bold text-sm group-hover:text-[#0f8201] transition-colors tracking-wide">Start a New Trip</span>
                    </button>

                    {/* Trip Cards */}
                    {trips.map(trip => (
                        <div
                            key={trip.id || trip._id}
                            onClick={() => onSelectTrip(trip)}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#0f8201]/20 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex-1 pr-4">
                                    <h2 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#0f8201] transition-colors leading-tight mb-2 line-clamp-2">
                                        {trip.title}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg text-slate-500 group-hover:bg-[#0f8201]/10 group-hover:text-[#0f8201] transition-colors">
                                            {trip.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => handleDeleteTrip(e, trip.id || trip._id)}
                                    className="w-10 h-10 rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                </button>
                            </div>

                            {/* Abstract Route Preview Decoration */}
                            <div className="h-20 w-full mt-auto rounded-2xl bg-[#f6f8f5] relative overflow-hidden flex items-center justify-center group-hover:bg-[#0f8201]/5 transition-colors">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#0f8201 1px, transparent 1px)`, backgroundSize: '12px 12px' }}></div>
                                <svg className="opacity-20 transform group-hover:scale-110 transition-transform duration-700" width="120" height="40" viewBox="0 0 120 40">
                                    <path d="M10 30 Q 30 10, 60 20 T 110 10" fill="none" stroke="#0f8201" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="10" cy="30" r="4" fill="#0f8201" />
                                    <circle cx="110" cy="10" r="4" fill="#0f8201" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}
