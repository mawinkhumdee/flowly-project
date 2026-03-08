import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LocationDrawer from './LocationDrawer';
import TripManager from './TripManager';
import BottomNav from './BottomNav';
import CompassMap from './CompassMap';

const API_BASE_URL = 'http://localhost:8080/api';

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const estimateTransit = (distance) => {
  const roadDistance = distance * 1.4;
  if (roadDistance < 1.2) {
    const mins = Math.max(2, Math.round((roadDistance / 5) * 60));
    return { mode: 'directions_walk', time: `${mins} min walk` };
  } else {
    const mins = Math.max(5, Math.round((roadDistance / 30) * 60));
    return { mode: 'local_taxi', time: `${mins} min Uber` };
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedStop, setSelectedStop] = useState(null);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trips`);
      const data = await response.json();
      setTrips(data || []);
      if (data && data.length > 0 && !currentTrip) {
        setCurrentTrip(data[0]);
      }
    } catch (error) { console.error('Error fetching trips:', error); }
  };

  const fetchStops = async (tripId) => {
    if (!tripId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stops?tripId=${tripId}`);
      const data = await response.json();
      let finalStops = data || [];
      if (finalStops.length === 0 && trips.length === 0) {
        await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
        await fetchTrips();
        return;
      }
      setStops(finalStops.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    } catch (error) { console.error('Error fetching stops:', error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, []);
  useEffect(() => { if (currentTrip) fetchStops(currentTrip.id || currentTrip._id); }, [currentTrip]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStops = Array.from(stops);
    const sourceIdx = stops.findIndex(s => String(s.id || s._id) === draggableId);
    const [movedItem] = newStops.splice(sourceIdx, 1);

    const destDay = parseInt(destination.droppableId.replace('day-', ''));
    movedItem.day = destDay;

    const targetDayItems = newStops.filter(s => (s.day || 1) === destDay);
    let globalInsertIdx;
    if (targetDayItems.length === 0) {
      globalInsertIdx = newStops.findIndex(s => (s.day || 1) > destDay);
      if (globalInsertIdx === -1) globalInsertIdx = newStops.length;
    } else {
      const targetItemAtDest = targetDayItems[destination.index];
      if (targetItemAtDest) {
        globalInsertIdx = newStops.findIndex(s => String(s.id || s._id) === String(targetItemAtDest.id || targetItemAtDest._id));
      } else {
        const lastInDay = targetDayItems[targetDayItems.length - 1];
        globalInsertIdx = newStops.findIndex(s => String(s.id || s._id) === String(lastInDay.id || lastInDay._id)) + 1;
      }
    }
    newStops.splice(globalInsertIdx, 0, movedItem);

    const updatedStops = newStops.map((stop, idx) => {
      const nextStop = newStops[idx + 1];
      let transit = null;
      if (nextStop && stop.day === nextStop.day) {
        const dist = getDistance(stop.lat, stop.lng, nextStop.lat, nextStop.lng);
        transit = estimateTransit(dist);
      }
      return { ...stop, orderIndex: idx + 1, transit };
    });

    setStops(updatedStops);

    try {
      await fetch(`${API_BASE_URL}/stops/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStops),
      });
    } catch (error) { console.error('Reorder sync failed:', error); fetchStops(currentTrip.id || currentTrip._id); }
  };

  const handleUpdateStop = async (updatedStop) => {
    try {
      const id = updatedStop.id || updatedStop._id;
      const response = await fetch(`${API_BASE_URL}/stops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStop),
      });
      if (response.ok) { await fetchStops(currentTrip.id || currentTrip._id); setSelectedStop(null); }
    } catch (error) { console.error('Update failed:', error); }
  };

  const handleDeleteStop = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stops/${id}`, { method: 'DELETE' });
      if (response.ok) { await fetchStops(currentTrip.id || currentTrip._id); setSelectedStop(null); }
    } catch (error) { console.error('Delete failed:', error); }
  };

  const handleAddStop = async (name) => {
    if (!currentTrip) return;
    try {
      setLoading(true);
      const currentTripId = currentTrip.id || currentTrip._id;
      const lastStop = stops.length > 0 ? stops[stops.length - 1] : null;

      let lat = 35.6762, lng = 139.6503, status = 'New destination';
      try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`, { headers: { 'User-Agent': 'FlowlyTravelApp/1.0' } });
        const geoData = await geoResponse.json();
        if (geoData?.[0]) { 
          lat = parseFloat(geoData[0].lat); 
          lng = parseFloat(geoData[0].lon); 
          status = geoData[0].display_name.split(',')[0];
        }
      } catch (err) { console.warn('Geocoding failed'); }

      await fetch(`${API_BASE_URL}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: currentTripId,
          name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status, day: lastStop ? (lastStop.day || 1) : 1,
          orderIndex: (stops.length > 0 ? Math.max(...stops.map(s => s.orderIndex || 0)) : 0) + 1,
          isCompleted: false, lat, lng, image: `https://loremflickr.com/600/400/${encodeURIComponent(name.split(' ')[0].toLowerCase())},travel/all`
        }),
      });
      
      const freshResponse = await fetch(`${API_BASE_URL}/stops?tripId=${currentTripId}`);
      const freshStops = await freshResponse.json();
      const finalSequence = freshStops.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((stop, idx, arr) => {
        const next = arr[idx + 1];
        let transit = null;
        if (next && stop.day === next.day) {
          const dist = getDistance(stop.lat, stop.lng, next.lat, next.lng);
          transit = estimateTransit(dist);
        }
        return { ...stop, transit };
      });

      await fetch(`${API_BASE_URL}/stops/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalSequence),
      });

      await fetchStops(currentTripId);
    } catch (error) { console.error('Add failed:', error); } finally { setLoading(false); }
  };

  const handleSelectTrip = (trip) => {
    setCurrentTrip(trip);
    setActiveTab('timeline');
  };

  const groupedStops = stops.reduce((acc, stop) => {
    const d = stop.day || 1;
    if (!acc[d]) acc[d] = [];
    acc[d].push(stop);
    return acc;
  }, {});
  const sortedDays = Object.keys(groupedStops).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f5] text-[#1A1A1A] font-sans overflow-hidden">
      {activeTab === 'timeline' && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 w-full max-w-5xl mx-auto">
            <button onClick={() => setActiveTab('trips')} className="p-2 rounded-full hover:bg-black/5"><span className="material-symbols-outlined text-[#1A1A1A]">menu</span></button>
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-[#1A1A1A] flex-1 text-center md:text-left">{currentTrip ? currentTrip.title : 'Loading Trip...'}</h1>
            <button onClick={() => setActiveTab('map')} className="p-2 rounded-full hover:bg-black/5"><span className="material-symbols-outlined text-[#1A1A1A]">explore</span></button>
          </div>
        </header>
      )}

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'timeline' && (
          <main className="h-full overflow-y-auto pt-20 pb-32 px-4 md:px-8 w-full no-scrollbar">
            <div className="max-w-2xl mx-auto">
              {!currentTrip ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50"><span className="material-symbols-outlined animate-spin text-4xl mb-2 text-[#0f8201]">refresh</span><p className="font-bold text-sm">Initializing...</p></div>
              ) : sortedDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4 text-[#0f8201]">route</span>
                  <p className="font-bold text-lg">No stops yet</p>
                  <p className="text-sm">Add your first destination below</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  {sortedDays.map((dayKey) => (
                    <div key={dayKey} className="mb-12">
                      <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#f6f8f5]/90 backdrop-blur-sm py-2 z-30">
                        <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Day {dayKey} Plan</h2>
                        <div className="bg-[#0f8201]/10 px-3 py-1 rounded-full border border-[#0f8201]/20"><span className="text-[10px] md:text-xs font-bold text-[#0f8201] uppercase tracking-wider">{groupedStops[dayKey].length} Places</span></div>
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
                                isDragDisabled={stop.isCompleted} // DISABLE REORDER IF COMPLETE
                              >
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`mb-6 transition-transform ${snapshot.isDragging ? 'z-50' : ''}`}>
                                    <div className="relative pl-12">
                                      <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 shadow-sm ${stop.isCompleted ? 'bg-[#0f8201]' : 'bg-[#f6f8f5]'}`}>
                                        {stop.isCompleted ? <span className="material-symbols-outlined text-white text-xl font-bold">check</span> : <span className="material-symbols-outlined text-[#1A1A1A]/40 text-xl">{stop.category || (groupIdx === 0 && dayKey === sortedDays[0] ? 'flight_land' : (groupIdx === groupedStops[dayKey].length - 1 && dayKey === sortedDays[sortedDays.length-1]) ? 'flag' : 'location_on')}</span>}
                                      </div>
                                      <div onClick={() => setSelectedStop(stop)} className={`bg-white rounded-2xl md:rounded-[24px] overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${stop.isCompleted ? 'opacity-70 border-[#0f8201]/30' : ''}`}>
                                        
                                        {/* HIDE IMAGE IF COMPLETE */}
                                        {!stop.isCompleted && stop.image && (
                                          <div className="h-40 md:h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${stop.image}')` }}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                          </div>
                                        )}

                                        <div className="p-4 md:p-6">
                                          <div className="flex justify-between items-start mb-1 gap-2">
                                            <h3 className={`text-lg md:text-xl font-bold text-[#1A1A1A] leading-tight ${stop.isCompleted ? 'line-through text-black/40' : ''}`}>{stop.name}</h3>
                                            <div className="flex items-center gap-2">
                                              {stop.category && <span className="material-symbols-outlined text-[#0f8201] text-[20px] opacity-60">{stop.category}</span>}
                                              <span className="text-[#0f8201] text-xs font-bold whitespace-nowrap bg-[#0f8201]/10 px-2 py-1 rounded-lg">{stop.time}</span>
                                            </div>
                                          </div>
                                          <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-4">{stop.status}</p>
                                          
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdateStop({...stop, isCompleted: !stop.isCompleted});
                                            }}
                                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${stop.isCompleted ? 'bg-gray-100 text-slate-400' : 'bg-[#0f8201] text-white shadow-lg active:scale-95'}`}
                                          >
                                            <span className="material-symbols-outlined text-lg">{stop.isCompleted ? 'undo' : 'check_circle'}</span>
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
              )}
            </div>
          </main>
        )}
        <div className="flex-1 w-full h-full relative overflow-y-auto no-scrollbar">
          {activeTab === 'trips' && <TripManager trips={trips} onSelectTrip={handleSelectTrip} onRefresh={fetchTrips} />}
          {activeTab === 'map' && <CompassMap stops={stops} tripTitle={currentTrip?.title} onOpenStream={() => setActiveTab('timeline')} />}
        </div>
      </div>

      {activeTab === 'timeline' && currentTrip && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40 w-full pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <form onSubmit={(e) => { e.preventDefault(); const input = e.target.elements.addStop; if (input.value.trim()) { handleAddStop(input.value.trim()); input.value = ''; } }} className="flex items-center gap-2 bg-white p-2.5 rounded-full shadow-2xl border border-[#E5E7EB]">
              <input name="addStop" className="flex-1 bg-transparent border-none text-base font-medium px-4 focus:ring-0 placeholder:text-slate-400" placeholder={loading ? "Finding location..." : "Where next?"} type="text" disabled={loading} />
              <button type="submit" className="w-12 h-12 bg-[#0f8201] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform" disabled={loading}><span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'add'}</span></button>
            </form>
          </div>
        </div>
      )}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
      <LocationDrawer isOpen={!!selectedStop} onClose={() => setSelectedStop(null)} stop={selectedStop} onUpdate={handleUpdateStop} onDelete={handleDeleteStop} />
    </div>
  );
}
