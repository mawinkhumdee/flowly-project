import React from 'react';

export default function BottomNav({ activeTab, onChangeTab }) {
    const tabs = [
        { id: 'timeline', icon: 'timeline', label: 'Timeline' },
        { id: 'map', icon: 'map', label: 'Map' },
        { id: 'trips', icon: 'business_center', label: 'Trips' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface-light dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pb-6 pt-3 flex justify-around items-end z-40 shadow-floating">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChangeTab(tab.id)}
                        className={`flex flex-1 flex-col items-center justify-end gap-1 transition-colors group ${isActive ? 'text-primary' : 'text-muted hover:text-primary'}`}
                    >
                        <div className={`flex h-8 items-center justify-center transition-transform ${!isActive ? 'group-hover:-translate-y-1' : ''}`}>
                            <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                                {tab.icon}
                            </span>
                        </div>
                        <p className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</p>
                    </button>
                );
            })}
        </nav>
    );
}
