import React from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function TripManager({ user, trips = [], onSelectTrip, onRefresh }) {
    
    const handleCreateTrip = async () => {
        if (!user) {
            alert("Please login first");
            return;
        }
        const title = prompt("Enter Trip Title:", "My New Adventure 🌏");
        if (!title) return;

        try {
            const response = await fetch(`${API_BASE_URL}/trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title, 
                    userId: user.id || user._id, // ENSURE USER ID IS SENT
                    status: 'In Progress', 
                    isPublic: false 
                }),
            });
            if (response.ok) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    const handleDeleteTrip = async (e, tripId) => {
        e.stopPropagation();
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

    const toggleSharing = async (e, trip) => {
        e.stopPropagation();
        const newStatus = !trip.isPublic;
        try {
            const response = await fetch(`${API_BASE_URL}/trips/${trip.id || trip._id}/sharing`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: newStatus }),
            });
            if (response.ok) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Error updating sharing:', error);
        }
    };

    const copyShareLink = (e, trip) => {
        e.stopPropagation();
        const link = `${window.location.origin}/share/${trip.id || trip._id}`;
        navigator.clipboard.writeText(link);
        alert("Share link copied to clipboard!");
    };

    return (
        <div className="flex-1 w-full bg-[#f6f8f5] font-sans text-[#1A1A1A] flex flex-col pt-8 px-4 md:px-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="max-w-2xl mx-auto w-full">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">My Journeys</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1.5">Manage and share your trips</p>
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
                        className="group w-full aspect-square sm:aspect-auto sm:h-48 rounded-[32px] border-2 border-dashed border-slate-200 hover:border-[#0f8201] hover:bg-[#0f8201]/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-transparent"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#0f8201]/10 group-hover:bg-[#0f8201] group-hover:text-white text-[#0f8201] flex items-center justify-center transition-all duration-300 transform group-hover:rotate-90">
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </div>
                        <span className="text-slate-500 font-bold text-sm group-hover:text-[#0f8201] transition-colors tracking-wide">New Trip</span>
                    </button>

                    {/* Trip Cards */}
                    {trips.map(trip => (
                        <div
                            key={trip.id || trip._id}
                            onClick={() => onSelectTrip(trip)}
                            className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#0f8201]/20 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex-1 pr-2">
                                    <h2 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#0f8201] transition-colors leading-tight mb-2 line-clamp-2">
                                        {trip.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${trip.isPublic ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-gray-100 text-slate-500 border-gray-200'}`}>
                                            {trip.isPublic ? 'Public' : 'Private'}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest bg-[#0f8201]/10 px-2 py-1 rounded-lg text-[#0f8201] border border-[#0f8201]/10">
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={(e) => handleDeleteTrip(e, trip.id || trip._id)}
                                        className="w-8 h-8 rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>

                            {/* Share Actions Area */}
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50 relative z-10">
                                <button 
                                    onClick={(e) => toggleSharing(e, trip)}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${trip.isPublic ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-slate-400 hover:bg-gray-100'}`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{trip.isPublic ? 'public' : 'lock'}</span>
                                    {trip.isPublic ? 'Disable Share' : 'Enable Share'}
                                </button>
                                {trip.isPublic && (
                                    <button 
                                        onClick={(e) => copyShareLink(e, trip)}
                                        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all shadow-sm active:scale-90"
                                        title="Copy Link"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    </button>
                                )}
                            </div>

                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0f8201]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700"></div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}
