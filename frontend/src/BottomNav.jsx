import React from 'react';

export default function BottomNav({ activeTab, onChangeTab }) {
    const tabs = [
        { id: 'timeline', icon: 'timeline', label: 'Timeline' },
        { id: 'map', icon: 'map', label: 'Map' },
        { id: 'trips', icon: 'list_alt', label: 'Trips' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E5E7EB] px-6 py-3 flex justify-around items-center z-50">
            <div className="w-full max-w-2xl mx-auto flex justify-around items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChangeTab(tab.id)}
                            className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive ? 'text-[#0f8201]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[#0f8201]/10' : ''}`}>
                                <span className={`material-symbols-outlined text-[26px] ${isActive ? 'fill-1' : ''}`}>
                                    {tab.icon}
                                </span>
                            </div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {tab.label}
                            </p>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
