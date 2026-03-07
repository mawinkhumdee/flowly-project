import React from 'react';

export default function CompassMap({ onOpenStream }) {
    return (
        <div className="absolute inset-0 w-full h-full bg-[#E5E0D8] overflow-hidden z-0 flex flex-col antialiased"
            style={{
                backgroundImage: `radial-gradient(#dcd8d0 1px, transparent 1px),
                          linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                backgroundSize: '20px 20px, 100px 100px, 100px 100px'
            }}
        >
            {/* Abstract Map Features (Background) */}
            <div className="absolute bg-[#D6E4EE] rounded-full w-[400px] h-[400px] -right-20 top-20 opacity-60"></div>
            <div className="absolute bg-[#E3EEDD] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] w-[300px] h-[200px] left-10 bottom-40 opacity-50"></div>

            {/* Roads */}
            <div className="absolute bg-white opacity-80 rounded-full w-[120%] h-4 -left-10 top-1/3 -rotate-12"></div>
            <div className="absolute bg-white opacity-80 rounded-full w-[120%] h-3 -left-10 top-1/2 rotate-6"></div>
            <div className="absolute bg-white opacity-80 rounded-full w-4 h-[120%] left-1/3 -top-10 rotate-12"></div>
            <div className="absolute bg-white opacity-80 rounded-full w-3 h-[120%] right-1/4 -top-10 -rotate-3"></div>

            {/* SVG Layer for Route Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                {/* Completed Route */}
                <path d="M 120 180 Q 180 250 220 380" fill="none" stroke="#8CB369" strokeLinecap="round" strokeWidth="4"></path>
                {/* Future Route */}
                <path className="opacity-40" d="M 220 380 Q 260 520 180 650" fill="none" stroke="#3B4D61" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="4"></path>
            </svg>

            {/* Map Markers */}

            {/* Pin 1: Completed */}
            <div className="absolute top-[180px] left-[120px] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-success text-white rounded-full shadow-sm text-sm font-bold border-2 border-white transition-transform transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-success shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Tsukiji Market
                </div>
            </div>

            {/* Pin 2: Current (Active) */}
            <div className="absolute top-[380px] left-[220px] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer">
                <div className="absolute inset-0 bg-highlight rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-highlight text-white rounded-full shadow-floating text-lg font-bold border-4 border-white">
                    2
                </div>

                {/* Tooltip Card Dummy */}
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-surface-light rounded-xl shadow-floating p-4 flex flex-col gap-3 animate-bounce origin-bottom transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-primary text-lg leading-tight">Mori Art Museum</h3>
                            <p className="text-muted text-xs font-medium mt-1">Stop 2 • Arrived 10:15 AM</p>
                        </div>
                        <button className="text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined transition-transform hover:rotate-90">close</span>
                        </button>
                    </div>

                    <div className="w-full h-[100px] rounded-lg bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAw2rXF35AHVzBsbF1da8zvfM0adGU9RGf_ZYQClHXTwZYVn4oRPI6RVjsQpne_MBx7rIUNXJCBtrdQG-K7I6IAbIu4sCvLi1XV0ooJL3MvcAxjN0saCXrOafx9FU3fc9Jo4-XIi4XtKjPFaVJdBA22aA1_VYO2MO5scIifZ06E9TnRX85uT-fMFIOxzZ_5dhSUhwIrWZNK23vbwY93fPyU3Bvb4SyCrTpT9zLqaQ4_K2jP4rJSkWQTjoOfeq9f5xZILHM8vqiFiQ6g')" }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-2 left-3 text-white text-xs font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
                            Ticket Required
                        </div>
                    </div>

                    <button className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[18px]">navigation</span>
                        Navigate
                    </button>

                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface-light rotate-45"></div>
                </div>
            </div>

            {/* Pin 3: Future */}
            <div className="absolute top-[650px] left-[180px] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full shadow-sm text-sm font-bold border-2 border-white transition-transform transform group-hover:scale-110">
                    3
                </div>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Gonpachi Nishi-Azabu
                </div>
            </div>

            {/* UI Overlay Layer */}
            <div className="relative z-40 flex flex-col h-full pointer-events-none justify-between max-w-md mx-auto w-full">
                {/* Header */}
                <header className="w-full pt-12 pb-6 px-6 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-primary tracking-tight">Tokyo Day 1</h1>
                            <div className="flex items-center gap-2 text-muted text-sm font-medium mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-highlight"></span>
                                <span>In Progress</span>
                                <span>•</span>
                                <span>5 stops</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Bottom map controls */}
                <div className="w-full p-6 pb-[120px] flex items-end justify-between pointer-events-none">
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <button className="w-12 h-12 bg-surface-light rounded-full shadow-soft flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition-all">
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                        <div className="flex flex-col bg-surface-light rounded-[24px] shadow-soft overflow-hidden">
                            <button className="w-12 h-12 flex items-center justify-center text-primary hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="w-12 h-12 flex items-center justify-center text-primary hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                        </div>
                    </div>

                    {/* List View Toggle FAB */}
                    <button
                        onClick={onOpenStream}
                        className="pointer-events-auto group flex items-center gap-3 bg-primary text-white pl-5 pr-6 py-4 rounded-full shadow-floating hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">format_list_bulleted</span>
                        <span className="font-bold text-base tracking-wide">Stream</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
