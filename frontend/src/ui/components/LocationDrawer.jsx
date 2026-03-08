import React, { useState, useEffect } from 'react';

export default function LocationDrawer({ isOpen, onClose, stop, onUpdate, onDelete }) {
    const [name, setName] = useState('');
    const [time, setTime] = useState('');
    const [status, setStatus] = useState('');
    const [category, setCategory] = useState('');
    const [day, setDay] = useState(1);

    useEffect(() => {
        if (stop) {
            setName(stop.name || '');
            setTime(stop.time ? stop.time.replace(' AM', '').replace(' PM', '') : '');
            setStatus(stop.status || '');
            setCategory(stop.category || '');
            setDay(stop.day || 1);
        }
    }, [stop]);

    if (!isOpen || !stop) return null;

    const handleSave = () => {
        onUpdate({
            ...stop,
            name,
            time: time.includes(':') ? (parseInt(time.split(':')[0]) >= 12 ? `${time} PM` : `${time} AM`) : time,
            status,
            category,
            day: parseInt(day)
        });
    };

    const categories = [
        { id: 'restaurant', label: 'Food', icon: 'restaurant' },
        { id: 'attractions', label: 'Sightseeing', icon: 'attractions' },
        { id: 'shopping_bag', label: 'Shop', icon: 'shopping_bag' },
        { id: 'hotel', label: 'Hotel', icon: 'hotel' },
        { id: 'flight_land', label: 'Transport', icon: 'flight_land' },
    ];

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity" onClick={onClose}></div>
            
            {/* Responsive Container */}
            <div className="fixed inset-0 pointer-events-none z-[70] flex items-end md:items-center justify-center p-0 md:p-6">
                <div className="pointer-events-auto w-full max-w-xl bg-white rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-transform duration-300 ease-out translate-y-0">
                    
                    {/* Drag Handle (Mobile only) */}
                    <div className="w-full flex justify-center pt-4 pb-2 md:hidden" onClick={onClose}>
                        <div className="w-12 h-1.5 rounded-full bg-gray-200"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-10 pt-2 md:pt-8 pb-10 text-[#1A1A1A]">
                        {/* Header Actions */}
                        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2">
                            <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 hidden md:flex">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="md:hidden"></div> {/* Spacer for mobile */}
                            <button onClick={handleSave} className="text-white font-bold text-base bg-[#0f8201] hover:bg-[#0f8201]/90 px-8 py-3 rounded-full transition-all shadow-lg active:scale-95">
                                Save Changes
                            </button>
                        </div>

                        {/* Location Title */}
                        <div className="mb-10">
                            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Location Name</label>
                            <input 
                                className="w-full text-2xl md:text-4xl font-bold text-[#1A1A1A] placeholder-slate-300 bg-transparent border-none p-0 focus:outline-none focus:ring-0" 
                                placeholder="Where are you going?" 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>

                        {/* Time & Day Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                                <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 hover:border-[#0f8201]/30 transition-colors">
                                    <span className="material-symbols-outlined text-[#0f8201] text-2xl mr-4">schedule</span>
                                    <input className="bg-transparent border-none p-0 text-lg font-bold text-[#1A1A1A] focus:outline-none w-full" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Plan for Day</label>
                                <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 hover:border-[#0f8201]/30 transition-colors">
                                    <span className="material-symbols-outlined text-[#0f8201] text-2xl mr-4">calendar_today</span>
                                    <select className="bg-transparent border-none p-0 text-lg font-bold text-[#1A1A1A] focus:outline-none w-full appearance-none cursor-pointer" value={day} onChange={(e) => setDay(e.target.value)}>
                                        {[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>Day {d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="mb-10">
                            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Place Category</label>
                            <div className="flex flex-wrap gap-3">
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => setCategory(cat.id)} 
                                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-bold transition-all border ${category === cat.id ? 'bg-[#0f8201] text-white border-[#0f8201] shadow-md scale-105' : 'bg-white text-slate-500 border-gray-200 hover:border-[#0f8201]/30'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-12">
                            <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Notes & Details</label>
                            <textarea 
                                className="w-full bg-gray-50 rounded-2xl border border-gray-100 p-5 text-base text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f8201]/10 resize-none leading-relaxed min-h-[120px]" 
                                placeholder="Booking info, must-see items, or quick notes..." 
                                value={status} 
                                onChange={(e) => setStatus(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Remove Action */}
                        <div className="flex flex-col items-center border-t border-gray-100 pt-8">
                            <button onClick={() => onDelete(stop.id || stop._id)} className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-8 py-4 rounded-full transition-all text-sm font-bold">
                                <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
                                Remove Stop from Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
