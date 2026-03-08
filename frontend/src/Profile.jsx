import React from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function Profile({ user, onLogout }) {
    if (!user) return null;

    return (
        <div className="flex-1 w-full bg-[#f6f8f5] font-sans text-[#1A1A1A] flex flex-col pt-12 px-6 md:px-12 pb-32 overflow-y-auto no-scrollbar">
            <div className="max-w-xl mx-auto w-full">
                
                {/* User Info Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center mb-8">
                    <div className="relative mb-6">
                        <img 
                            src={user.picture} 
                            alt={user.name} 
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#0f8201]/10 shadow-lg object-cover"
                        />
                        <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#0f8201] rounded-full border-4 border-white flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[16px] font-bold">verified</span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{user.name}</h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium mb-6">{user.email}</p>
                    
                    <button 
                        onClick={onLogout}
                        className="px-8 py-3 bg-red-50 text-red-500 rounded-full font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                    </button>
                </div>

                {/* Settings Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4 mb-2">Trip Settings</h3>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#0f8201]/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0f8201]/5 text-[#0f8201] flex items-center justify-center group-hover:bg-[#0f8201] group-hover:text-white transition-all">
                                <span className="material-symbols-outlined">share</span>
                            </div>
                            <div>
                                <p className="font-bold text-base">Automatic Sharing</p>
                                <p className="text-xs text-slate-400">Share new trips with frequent friends</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-[#0f8201] rounded-full relative p-1 flex items-center justify-end">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#0f8201]/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">group_add</span>
                            </div>
                            <div>
                                <p className="font-bold text-base">Travel Buddy Invites</p>
                                <p className="text-xs text-slate-400">Allow others to invite you to trips</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0f8201] transition-colors">chevron_right</span>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#0f8201]/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            <div>
                                <p className="font-bold text-base">Arrival Alerts</p>
                                <p className="text-xs text-slate-400">Notify friends when you mark a stop as done</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0f8201] transition-colors">chevron_right</span>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Flowly Travel v1.0</p>
                </div>

            </div>
        </div>
    );
}
