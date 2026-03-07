import React, { useState } from 'react';
import LocationDrawer from './LocationDrawer';
import TripManager from './TripManager';
import BottomNav from './BottomNav';
import CompassMap from './CompassMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedStop, setSelectedStop] = useState(null);
  const [stops, setStops] = useState([
    {
      id: 1,
      time: '9:00 AM',
      name: 'Hotel Gracery',
      status: 'Check-out complete',
      isCompleted: true,
      transit: { mode: 'directions_walk', time: '15 min walk' },
    },
    {
      id: 2,
      time: '9:15 AM',
      name: 'Blue Bottle Coffee',
      status: 'Cafe • Arrived',
      isCompleted: false,
      isActive: true,
      actions: ['Menu', 'Notes'],
      transit: { mode: 'train', time: '12 min train', color: 'bg-accent/10' },
    },
    {
      id: 3,
      time: '10:00 AM',
      name: 'TeamLabs Planets',
      status: 'Ticket #8842901',
      isCompleted: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADAmsFh7ELrYF_hVVLG2QMGhGduRZxY8HcLYz9FhDiopiiAzoYrf0qaiBaLXYJNFWfj9cLEbrEDI6L_YhwbnrwL_Ra_K8sbbPSzSk8OzgSzHNK28XvvMfzlt7fjbSZDLp9YtJoYSkITJEc57_bzYtq5ELyDsQQtylt7xOCYgxH1KHOMS2o6Jw7Ksf-kFuzWdz9BFuY_xyOUaKon-R6SQSi3XlN_YcHctUZZ79GZthPkJDORu4_-yCgObcu1mcKFr-GvBs3IeFCl_0c',
      transit: { mode: 'local_taxi', time: '20 min Uber', color: 'bg-accent/10' },
    },
    {
      id: 4,
      time: '1:00 PM',
      name: 'Cafe Mogador',
      status: 'Lunch reservation',
      isCompleted: false,
    },
  ]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light text-text-main font-display selection:bg-highlight selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 z-20 bg-background-light/90 backdrop-blur-sm sticky top-0">
        <div>
          <span className="text-xs font-bold tracking-wider text-muted uppercase block mb-1">Current Trip</span>
          <h1 className="text-2xl font-bold text-primary dark:text-white leading-none tracking-tight">Tokyo Day 1</h1>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-soft hover:bg-gray-50 transition-colors group">
          <span className="material-symbols-outlined transition-transform group-hover:rotate-45">explore</span>
        </button>
      </header>

      {/* Main Content Area based on Tab */}
      {activeTab === 'timeline' && (
        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 relative">
          {/* Timeline Spine Container */}
          <div className="absolute left-[34px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-success via-success to-muted/30 z-0"></div>

          {stops.map((stop, index) => (
            <React.Fragment key={stop.id}>
              {/* Stop Item */}
              <div className={`relative z-10 ${index === stops.length - 1 ? 'mb-12' : 'mb-2'} ${stop.isCompleted ? 'group' : ''}`}>
                <div className="flex items-start gap-6">

                  {/* Timeline Node */}
                  <div className={`flex flex-col items-center mt-8 ${stop.isActive ? 'relative' : ''}`}>
                    {stop.isActive && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-highlight opacity-75 animate-ping"></span>
                    )}
                    {stop.isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center border-[3px] border-background-light box-content">
                        <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>
                      </div>
                    ) : stop.isActive ? (
                      <div className="relative w-5 h-5 rounded-full bg-highlight border-[3px] border-background-light box-content z-10"></div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-background-light border-[3px] border-muted/30 box-content"></div>
                    )}
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setSelectedStop(stop)}
                    className={`flex-1 p-5 rounded-xl transition-all cursor-pointer ${stop.isCompleted ? 'bg-white/60 dark:bg-gray-800/60 shadow-none border border-transparent' :
                      stop.isActive ? 'bg-white dark:bg-gray-800 shadow-soft border-l-4 border-highlight transform translate-x-1' :
                        'bg-white dark:bg-gray-800 shadow-soft hover:shadow-md'
                      }`}>
                    <div className={`flex justify-between items-start ${stop.isCompleted ? 'opacity-50' : ''}`}>
                      <div>
                        <p className={`text-sm font-bold mb-1 ${stop.isCompleted ? 'text-success' : stop.isActive ? 'text-highlight' : 'text-muted'}`}>
                          {stop.time}
                        </p>
                        <h3 className={`text-lg font-bold ${stop.isCompleted ? 'line-through decoration-2 decoration-success/50 text-primary dark:text-white' : 'text-primary dark:text-white'}`}>
                          {stop.name}
                        </h3>

                        {stop.isActive && stop.status.includes('•') ? (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              {stop.status.split('•')[0].trim()}
                            </span>
                            <span className="text-xs text-muted font-medium">• {stop.status.split('•')[1].trim()}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted mt-1 font-medium">{stop.status}</p>
                        )}
                      </div>
                      <div className={`p-1 cursor-grab active:cursor-grabbing ${stop.isCompleted ? 'text-muted' : 'text-muted/50 hover:text-primary'}`}>
                        <span className="material-symbols-outlined text-lg">drag_indicator</span>
                      </div>
                    </div>

                    {stop.image && (
                      <div className="mt-3 h-24 w-full rounded-lg overflow-hidden relative">
                        <img alt={stop.name} src={stop.image} className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}

                    {stop.actions && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                        {stop.actions.map(action => (
                          <button key={action} className="flex-1 py-2 text-xs font-bold text-primary bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Transit Pill */}
              {stop.transit && (
                <div className="relative z-10 py-4 pl-[34px] -ml-[34px] flex justify-center w-full pointer-events-none">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-auto cursor-pointer transition-colors ${stop.transit.color || 'bg-white shadow-sm border border-gray-100 hover:scale-105'}`}>
                    <span className="material-symbols-outlined text-sm text-primary">{stop.transit.mode}</span>
                    <span className="text-xs font-bold text-primary">{stop.transit.time}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* End of Stream Illustration placeholder */}
          <div className="flex justify-center pb-8 opacity-40">
            <div className="h-16 w-0.5 bg-gradient-to-b from-muted/30 to-transparent"></div>
          </div>
        </main>
      )}

      {activeTab === 'trips' && (
        <TripManager onSelectTrip={(trip) => {
          setActiveTab('timeline'); // Mock selecting a trip routes back to stream
        }} />
      )}

      {activeTab === 'map' && (
        <CompassMap onOpenStream={() => setActiveTab('timeline')} />
      )}

      {/* Floating Input Footer (Only on Timeline) */}
      {activeTab === 'timeline' && (
        <div className="absolute bottom-28 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="mx-auto max-w-sm w-full pointer-events-auto">
            <label className="group flex items-center gap-3 bg-surface-light dark:bg-gray-800 p-2 pr-2 pl-5 rounded-full shadow-floating border border-gray-100 transition-all focus-within:ring-2 focus-within:ring-primary/20 hover:scale-[1.02]">
              <span className="material-symbols-outlined text-muted group-focus-within:text-primary transition-colors">search</span>
              <input className="flex-1 bg-transparent border-none text-base font-medium text-primary placeholder:text-muted focus:outline-none focus:ring-0 p-0" placeholder="Add next stop..." type="text" />
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Drawer */}
      <LocationDrawer
        isOpen={!!selectedStop}
        onClose={() => setSelectedStop(null)}
        stop={selectedStop}
      />
    </div>
  );
}
