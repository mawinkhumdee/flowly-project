import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LocationDrawer from './LocationDrawer';
import TripManager from './TripManager';
import BottomNav from './BottomNav';
import CompassMap from './CompassMap';
import Profile from './Profile';

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
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  
  const [selectedStop, setSelectedStop] = useState(null);
  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('flowly_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'signup' ? '/signup' : '/login';
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        localStorage.setItem('flowly_user', JSON.stringify(data));
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) { console.error('Auth error:', error); }
  };

  const handleDevLogin = async () => {
    try {
      // Try to login first
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "dev@flowly.travel", password: "password" }),
      });
      let data = await response.json();
      
      if (!response.ok) {
        // If fail, signup the dev user
        const signupRes = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "dev@flowly.travel", password: "password", name: "Developer Admin" }),
        });
        data = await signupRes.json();
      }
      
      setUser(data);
      localStorage.setItem('flowly_user', JSON.stringify(data));
    } catch (error) { console.error('Dev login failed:', error); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('flowly_user');
    setCurrentTrip(null);
    setStops([]);
    setActiveTab('timeline');
  };

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/trips?userId=${user.id || user._id}`);
      const data = await response.json();
      setTrips(data || []);
      if (data && data.length > 0 && !currentTrip) setCurrentTrip(data[0]);
    } catch (error) { console.error('Error fetching trips:', error); }
  };

  const fetchStops = async (tripId) => {
    if (!tripId || !user) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stops?tripId=${tripId}&userId=${user.id || user._id}`);
      const data = await response.json();
      setStops((data || []).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    } catch (error) { console.error('Error fetching stops:', error); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchTrips(); }, [user]);
  useEffect(() => { if (currentTrip && user) fetchStops(currentTrip.id || currentTrip._id); }, [currentTrip, user]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || !user) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStops = Array.from(stops);
    const sourceIdx = stops.findIndex(s => String(s.id || s._id) === draggableId);
    const [movedItem] = newStops.splice(sourceIdx, 1);
    movedItem.day = parseInt(destination.droppableId.replace('day-', ''));

    const targetDayItems = newStops.filter(s => (s.day || 1) === movedItem.day);
    let globalInsertIdx = newStops.length;
    if (targetDayItems[destination.index]) {
        globalInsertIdx = newStops.findIndex(s => String(s.id || s._id) === String(targetDayItems[destination.index].id || targetDayItems[destination.index]._id));
    } else if (targetDayItems.length > 0) {
        const last = targetDayItems[targetDayItems.length - 1];
        globalInsertIdx = newStops.findIndex(s => String(s.id || s._id) === String(last.id || last._id)) + 1;
    }

    newStops.splice(globalInsertIdx, 0, movedItem);
    const updatedStops = newStops.map((stop, idx) => {
      const next = newStops[idx + 1];
      let transit = null;
      if (next && stop.day === next.day) transit = estimateTransit(getDistance(stop.lat, stop.lng, next.lat, next.lng));
      return { ...stop, orderIndex: idx + 1, transit };
    });

    setStops(updatedStops);
    try {
      await fetch(`${API_BASE_URL}/stops/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStops),
      });
    } catch (error) { fetchStops(currentTrip.id || currentTrip._id); }
  };

  const handleUpdateStop = async (updatedStop) => {
    try {
      const id = updatedStop.id || updatedStop._id;
      const response = await fetch(`${API_BASE_URL}/stops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedStop, userId: user.id || user._id }),
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
    if (!currentTrip || !user) return;
    try {
      setLoading(true);
      const currentTripId = currentTrip.id || currentTrip._id;
      const lastStop = stops.length > 0 ? stops[stops.length - 1] : null;

      let lat = 35.6762, lng = 139.6503, status = 'New destination';
      try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`, { headers: { 'User-Agent': 'FlowlyTravelApp/1.0' } });
        const geoData = await geoResponse.json();
        if (geoData?.[0]) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); status = geoData[0].display_name.split(',')[0]; }
      } catch (err) { console.warn('Geocoding failed'); }

      await fetch(`${API_BASE_URL}/stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: currentTripId,
          userId: user.id || user._id,
          name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status, day: lastStop ? (lastStop.day || 1) : 1,
          orderIndex: (stops.length > 0 ? Math.max(...stops.map(s => s.orderIndex || 0)) : 0) + 1,
          isCompleted: false, lat, lng, image: `https://loremflickr.com/600/400/${encodeURIComponent(name.split(' ')[0].toLowerCase())},travel/all`
        }),
      });
      
      const freshRes = await fetch(`${API_BASE_URL}/stops?tripId=${currentTripId}&userId=${user.id || user._id}`);
      const freshStops = await freshRes.json();
      const sequence = freshStops.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((s, i, a) => {
        const n = a[i + 1];
        let t = null;
        if (n && s.day === n.day) t = estimateTransit(getDistance(s.lat, s.lng, n.lat, n.lng));
        return { ...s, transit: t };
      });

      await fetch(`${API_BASE_URL}/stops/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sequence),
      });

      await fetchStops(currentTripId);
    } catch (error) { console.error('Add failed:', error); } finally { setLoading(false); }
  };

  const handleSelectTrip = (trip) => {
    setCurrentTrip(trip);
    setActiveTab('timeline');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] px-6">
        <div className="w-full max-w-md bg-white rounded-[40px] p-10 md:p-12 shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-[#0f8201]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-[#0f8201] text-4xl font-bold">route</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#1A1A1A]">Welcome to Flowly</h1>
          <p className="text-slate-400 mb-8 font-medium">Your minimalist travel timeline.</p>
          
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white shadow-sm text-[#0f8201]' : 'text-slate-500'}`}>Log In</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-white shadow-sm text-[#0f8201]' : 'text-slate-500'}`}>Sign Up</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input className="w-full bg-gray-50 border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#0f8201]/20 transition-all" placeholder="Enter your name" type="text" required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input className="w-full bg-gray-50 border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#0f8201]/20 transition-all" placeholder="name@example.com" type="email" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input className="w-full bg-gray-50 border-gray-100 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#0f8201]/20 transition-all" placeholder="Min. 8 characters" type="password" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-[#0f8201] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#0f8201]/90 transition-all active:scale-95 mt-4">
              {authMode === 'login' ? 'Sign In to Flowly' : 'Create My Account'}
            </button>
          </form>
          
          <button onClick={handleDevLogin} className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-[#0f8201] transition-colors">
            Quick Simulation Login (Dev)
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-[#1A1A1A] flex-1 text-center md:text-left">{currentTrip ? currentTrip.title : 'My Trips'}</h1>
            <button onClick={() => setActiveTab('map')} className="p-2 rounded-full hover:bg-black/5"><span className="material-symbols-outlined text-[#1A1A1A]">explore</span></button>
          </div>
        </header>
      )}

      <div className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'timeline' && (
          <main className="h-full overflow-y-auto pt-20 pb-32 px-4 md:px-8 w-full no-scrollbar">
            <div className="max-w-2xl mx-auto">
              {sortedDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50"><span className="material-symbols-outlined text-6xl mb-4 text-[#0f8201]">route</span><p className="font-bold text-lg">No stops yet</p></div>
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
                              <Draggable key={String(stop.id || stop._id)} draggableId={String(stop.id || stop._id)} index={groupIdx} isDragDisabled={stop.isCompleted}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`mb-6 transition-transform ${snapshot.isDragging ? 'z-50' : ''}`}>
                                    <div className="relative pl-12">
                                      <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white z-10 shadow-sm ${stop.isCompleted ? 'bg-[#0f8201]' : 'bg-[#f6f8f5]'}`}>
                                        {stop.isCompleted ? <span className="material-symbols-outlined text-white text-xl font-bold">check</span> : <span className="material-symbols-outlined text-[#1A1A1A]/40 text-xl">{stop.category || (groupIdx === 0 && dayKey === sortedDays[0] ? 'flight_land' : (groupIdx === groupedStops[dayKey].length - 1 && dayKey === sortedDays[sortedDays.length-1]) ? 'flag' : 'location_on')}</span>}
                                      </div>
                                      <div onClick={() => setSelectedStop(stop)} className={`bg-white rounded-2xl md:rounded-[24px] overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${stop.isCompleted ? 'opacity-70 border-slate-100' : ''}`}>
                                        {!stop.isCompleted && stop.image && <div className="h-40 md:h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: `url('${stop.image}')` }}><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div></div>}
                                        <div className={stop.isCompleted ? 'p-3' : 'p-4 md:p-6'}>
                                          <div className="flex justify-between items-start mb-1 gap-2">
                                            <h3 className={`font-bold text-[#1A1A1A] leading-tight ${stop.isCompleted ? 'text-base line-through text-black/30' : 'text-lg md:text-xl'}`}>{stop.name}</h3>
                                            <div className="flex items-center gap-2">
                                              {!stop.isCompleted && stop.category && <span className="material-symbols-outlined text-[#0f8201] text-[20px] opacity-60">{stop.category}</span>}
                                              <span className={`text-[#0f8201] font-bold whitespace-nowrap bg-[#0f8201]/10 px-2 py-1 rounded-lg ${stop.isCompleted ? 'text-[10px]' : 'text-xs'}`}>{stop.time}</span>
                                            </div>
                                          </div>
                                          {!stop.isCompleted && <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-4">{stop.status}</p>}
                                          <button onClick={(e) => { e.stopPropagation(); handleUpdateStop({...stop, isCompleted: !stop.isCompleted}); }} className={`w-full font-bold flex items-center justify-center gap-2 transition-all ${stop.isCompleted ? 'py-1 text-[10px] text-slate-400 bg-gray-50 rounded-lg mt-1' : 'py-3 text-sm bg-[#0f8201] text-white rounded-xl shadow-lg active:scale-95'}`}>
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
              )}
            </div>
          </main>
        )}
        <div className="flex-1 w-full h-full relative overflow-y-auto no-scrollbar bg-[#f6f8f5]">
          {activeTab === 'trips' && <TripManager user={user} trips={trips} onSelectTrip={handleSelectTrip} onRefresh={fetchTrips} />}
          {activeTab === 'map' && <CompassMap stops={stops} tripTitle={currentTrip?.title} onOpenStream={() => setActiveTab('timeline')} />}
          {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
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
