import React from 'react';

export default function LocationDrawer({ isOpen, onClose, stop }) {
    if (!isOpen || !stop) return null;

    return (
        <>
            {/* Overlay Backdrop */}
            <div
                className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Bottom Sheet Drawer */}
            <div className="absolute bottom-0 left-0 w-full h-[85vh] md:h-[65vh] md:max-w-md md:left-1/2 md:-translate-x-1/2 bg-surface-light rounded-t-[32px] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out translate-y-0">

                {/* Drag Handle Area */}
                <div
                    className="w-full flex justify-center pt-4 pb-2 cursor-pointer active:cursor-grabbing"
                    onClick={onClose}
                >
                    <div className="w-12 h-1.5 rounded-full bg-gray-200"></div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-8 text-text-main">

                    {/* Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={onClose}
                            className="text-muted hover:text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-background-light"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="text-primary font-bold text-sm bg-background-light hover:bg-accent/20 px-4 py-2 rounded-full transition-colors"
                        >
                            Save
                        </button>
                    </div>

                    {/* Title Input */}
                    <div className="mb-8">
                        <label className="sr-only" htmlFor="location-name">Location Name</label>
                        <input
                            className="w-full text-3xl font-bold text-primary placeholder-muted bg-transparent border-none p-0 focus:outline-none"
                            id="location-name"
                            placeholder="Enter location..."
                            type="text"
                            defaultValue={stop.name}
                        />
                        <div className="flex items-center gap-2 mt-2 text-muted">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            <span className="text-sm font-medium">Auto-detected location area</span>
                        </div>
                    </div>

                    {/* Time & Duration Cluster */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Arrival Time */}
                        <div className="group flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Arrival</label>
                            <div className="flex items-center bg-background-light group-focus-within:bg-white group-focus-within:shadow-floating transition-all rounded-[20px] px-4 py-4 cursor-pointer hover:bg-gray-50">
                                <span className="material-symbols-outlined text-primary mr-3">schedule</span>
                                <input
                                    className="bg-transparent border-none p-0 text-lg font-bold text-primary focus:outline-none w-full cursor-pointer"
                                    type="time"
                                    defaultValue={stop.time.replace(' AM', '').replace(' PM', '')}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="group flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1">Duration</label>
                            <div className="flex items-center bg-background-light group-focus-within:bg-white group-focus-within:shadow-floating transition-all rounded-[20px] px-4 py-4 cursor-pointer hover:bg-gray-50">
                                <span className="material-symbols-outlined text-primary mr-3">hourglass_empty</span>
                                <select className="bg-transparent border-none p-0 text-lg font-bold text-primary focus:outline-none w-full cursor-pointer appearance-none">
                                    <option>30m</option>
                                    <option>45m</option>
                                    <option defaultValue>1h 30m</option>
                                    <option>2h 00m</option>
                                </select>
                                <span className="material-symbols-outlined text-muted text-sm ml-auto pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="mb-8">
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1 mb-3 block">Category</label>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-soft whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">restaurant</span>
                                Food
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-background-light text-muted hover:text-primary hover:bg-gray-200 transition-colors rounded-full text-sm font-bold whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">attractions</span>
                                Sightseeing
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-background-light text-muted hover:text-primary hover:bg-gray-200 transition-colors rounded-full text-sm font-bold whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                                Shop
                            </button>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mb-10 group">
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider ml-1 mb-2 block" htmlFor="notes">Notes</label>
                        <div className="relative">
                            <textarea
                                className="w-full bg-background-light group-focus-within:bg-white group-focus-within:shadow-floating transition-all rounded-[24px] border-none p-5 text-base text-primary placeholder-muted/70 focus:outline-none resize-none leading-relaxed"
                                id="notes"
                                placeholder="Add details like gate codes, reservation names..."
                                rows="4"
                                defaultValue={stop.status}
                            ></textarea>
                            <div className="absolute right-4 top-4 text-muted/30 pointer-events-none">
                                <span className="material-symbols-outlined -rotate-45">attach_file</span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="flex flex-col items-center justify-center gap-4 mt-auto">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-danger/80 hover:text-danger hover:bg-red-50 px-6 py-3 rounded-full transition-all text-sm font-bold text-red-500"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                            Remove Stop
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
