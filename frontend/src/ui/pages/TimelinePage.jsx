// src/ui/pages/TimelinePage.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TimelinePage({ 
  stops, 
  loading, 
  currentTrip, 
  onDragEnd, 
  onSelectStop, 
  onUpdateStop 
}) {
  const groupedStops = stops.reduce((acc, stop) => {
    const d = stop.day || 1;
    if (!acc[d]) acc[d] = [];
    acc[d].push(stop);
    return acc;
  }, {});
  
  const sortedDays = Object.keys(groupedStops).sort((a, b) => parseInt(a) - parseInt(b));

  if (!currentTrip) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-[#0f8201]">refresh</span>
        <p className="font-bold text-sm">Initializing...</p>
      </div>
    );
  }

  if (sortedDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <span className="material-symbols-outlined text-6xl mb-4 text-[#0f8201]">route</span>
        <p className="font-bold text-lg">No stops yet</p>
        <p className="text-sm">Add your first destination below</p>
      </div>
    );
  }

  return (
    <main className="h-full overflow-y-auto pt-20 pb-32 px-4 md:px-8 w-full no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          {sortedDays.map((dayKey) => (
            <div key={dayKey} className="mb-12">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#f6f8f5]/90 backdrop-blur-sm py-2 z-30">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Day {dayKey} Plan</h2>
                <div className="bg-[#0f8201]/10 px-3 py-1 rounded-full border border-[#0f8201]/20">
                  <span className="text-[10px] md:text-xs font-bold text-[#0f8201] uppercase tracking-wider">
                    {groupedStops[dayKey].length} Places
                  </span>
                </div>
              </div>
              <Droppable droppableId={`day-${dayKey}`}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="relative min-h-[50px]">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[#E5E7EB]"></div>
                    {groupedStops[dayKey].map((stop, groupIdx) => (
                      <Draggable 
                        key={String(stop.id || stop._id)} 
                        draggableId={String(stop.id || stop._id)} 
                        index={groupIdx} 
                        isDragDisabled={stop.isCompleted}
                      >
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`mb-6 transition-transform ${snapshot.isDragging ? 'z-50' : ''}`}>
                            <div className="relative pl-12">
                              <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 shadow-sm ${stop.isCompleted ? 'bg-[#0f8201]' : 'bg-[#f6f8f5]'}`}>
                                {stop.isCompleted ? (
                                  <span className="material-symbols-outlined text-white text-xl font-bold">check</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[#1A1A1A]/40 text-xl">
                                    {stop.category || (groupIdx === 0 && dayKey === sortedDays[0] ? 'flight_land' : (groupIdx === groupedStops[dayKey].length - 1 && dayKey === sortedDays[sortedDays.length-1]) ? 'flag' : 'location_on')}
                                  </span>
                                )}
                              </div>
                              <div 
                                onClick={() => onSelectStop(stop)} 
                                className={`bg-white rounded-2xl md:rounded-[24px] overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${stop.isCompleted ? 'opacity-70 border-slate-100' : ''}`}
                              >
                                {!stop.isCompleted && stop.image && (
                                  <div className="h-40 md:h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${stop.image}')` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                  </div>
                                )}
                                <div className={stop.isCompleted ? 'p-3' : 'p-4 md:p-6'}>
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                    <h3 className={`font-bold text-[#1A1A1A] leading-tight ${stop.isCompleted ? 'text-base line-through text-black/30' : 'text-lg md:text-xl'}`}>{stop.name}</h3>
                                    <div className="flex items-center gap-2">
                                      {!stop.isCompleted && stop.category && (
                                        <span className="material-symbols-outlined text-[#0f8201] text-[20px] opacity-60">{stop.category}</span>
                                      )}
                                      <span className={`text-[#0f8201] font-bold whitespace-nowrap bg-[#0f8201]/10 px-2 py-1 rounded-lg ${stop.isCompleted ? 'text-[10px]' : 'text-xs'}`}>{stop.time}</span>
                                    </div>
                                  </div>
                                  {!stop.isCompleted && <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-4">{stop.status}</p>}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onUpdateStop({...stop, isCompleted: !stop.isCompleted});
                                    }} 
                                    className={`w-full font-bold flex items-center justify-center gap-2 transition-all ${stop.isCompleted ? 'py-1 text-[10px] text-slate-400 bg-gray-50 rounded-lg mt-1' : 'py-3 text-sm bg-[#0f8201] text-white rounded-xl shadow-lg active:scale-95'}`}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: stop.isCompleted ? '14px' : '18px' }}>{stop.isCompleted ? 'undo' : 'check_circle'}</span>
                                    {stop.isCompleted ? 'Undo Arrival' : 'Arrived here'}
                                  </button>
                                </div>
                              </div>
                            </div>
                            {stop.transit && (
                              <div className="relative pl-12 my-4 h-10 flex items-center">
                                <div className="absolute left-[19px] -translate-x-1/2 z-20">
                                  <div className="bg-white border border-[#E5E7EB] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm hover:scale-105 transition-all cursor-default">
                                    <span className="material-symbols-outlined text-base text-[#0f8201]">{stop.transit.mode}</span>
                                    <span className="text-[11px] font-bold text-[#0f8201] uppercase tracking-wider">{stop.transit.time}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </main>
  );
}
