// src/App.jsx
import React, { useState, useEffect } from 'react';
import { api } from './infrastructure/api/apiClient';
import { getDistance, estimateTransit } from './domain/services/travelMath';

// Layout & Components
import MainLayout from './ui/layout/MainLayout';
import LocationDrawer from './ui/components/LocationDrawer';

// Pages
import TimelinePage from './ui/pages/TimelinePage';
import TripManagerPage from './ui/pages/TripManagerPage';
import MapPage from './ui/pages/MapPage';
import ProfilePage from './ui/pages/ProfilePage';

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
    try {
      const data = authMode === 'signup' ? await api.signup(authForm) : await api.login(authForm);
      setUser(data);
      localStorage.setItem('flowly_user', JSON.stringify(data));
    } catch (error) { alert(error.message); }
  };

  const handleDevLogin = async () => {
    try {
      let data;
      try {
        data = await api.login({ email: "dev@flowly.travel", password: "password" });
      } catch (e) {
        data = await api.signup({ email: "dev@flowly.travel", password: "password", name: "Developer Admin" });
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
      const data = await api.getTrips(user.id || user._id);
      setTrips(data || []);
      if (data && data.length > 0 && !currentTrip) setCurrentTrip(data[0]);
    } catch (error) { console.error('Error fetching trips:', error); }
  };

  const fetchStops = async (tripId) => {
    if (!tripId || !user) return;
    try {
      setLoading(true);
      const data = await api.getStops(tripId, user.id || user._id);
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
      await api.reorderStops(updatedStops);
    } catch (error) { fetchStops(currentTrip.id || currentTrip._id); }
  };

  const handleUpdateStop = async (updatedStop) => {
    try {
      await api.updateStop(updatedStop.id || updatedStop._id, { ...updatedStop, userId: user.id || user._id });
      fetchStops(currentTrip.id || currentTrip._id);
      setSelectedStop(null);
    } catch (error) { console.error('Update failed:', error); }
  };

  const handleDeleteStop = async (id) => {
    try {
      await api.deleteStop(id);
      fetchStops(currentTrip.id || currentTrip._id);
      setSelectedStop(null);
    } catch (error) { console.error('Delete failed:', error); }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    const name = e.target.elements.addStop.value.trim();
    if (!name || !currentTrip || !user) return;
    e.target.elements.addStop.value = '';

    try {
      setLoading(true);
      const currentTripId = currentTrip.id || currentTrip._id;
      const lastStop = stops.length > 0 ? stops[stops.length - 1] : null;

      let lat = 35.6762, lng = 139.6503, city = '', country = '', status = 'New destination';
      try {
        const geoData = await api.geocode(name);
        if (geoData?.[0]) { 
          lat = parseFloat(geoData[0].lat); 
          lng = parseFloat(geoData[0].lon); 
          status = geoData[0].display_name.split(',')[0];
          // Try to extract city/country from display_name (simple split logic)
          const parts = geoData[0].display_name.split(', ');
          country = parts[parts.length - 1];
          city = parts[parts.length - 3] || parts[0];
        }
      } catch (err) { console.warn('Geocoding failed'); }

      await api.createStop({
        tripId: currentTripId,
        userId: user.id || user._id,
        name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status, city, country, day: lastStop ? (lastStop.day || 1) : 1,
        orderIndex: (stops.length > 0 ? Math.max(...stops.map(s => s.orderIndex || 0)) : 0) + 1,
        isCompleted: false, lat, lng, image: `https://loremflickr.com/600/400/${encodeURIComponent(name.split(' ')[0].toLowerCase())},travel/all`
      });
      
      const freshStops = await api.getStops(currentTripId, user.id || user._id);
      const sequence = freshStops.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)).map((s, i, a) => {
        const n = a[i + 1];
        let t = null;
        if (n && s.day === n.day) t = estimateTransit(getDistance(s.lat, s.lng, n.lat, n.lng));
        return { ...s, transit: t };
      });

      await api.reorderStops(sequence);
      await fetchStops(currentTripId);
    } catch (error) { console.error('Add failed:', error); } finally { setLoading(false); }
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

  return (
    <MainLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      headerTitle={currentTrip ? currentTrip.title : 'My Trips'}
      onHeaderLeftClick={() => setActiveTab('trips')}
      onHeaderRightClick={() => setActiveTab('map')}
      showSearch={activeTab === 'timeline' && !!currentTrip}
      loadingSearch={loading}
      onSearchSubmit={handleAddStop}
    >
      {activeTab === 'timeline' && (
        <TimelinePage 
          stops={stops}
          loading={loading}
          currentTrip={currentTrip}
          onDragEnd={onDragEnd}
          onSelectStop={setSelectedStop}
          onUpdateStop={handleUpdateStop}
        />
      )}

      {activeTab === 'trips' && (
        <TripManagerPage 
          user={user} 
          trips={trips} 
          onSelectTrip={(trip) => { setCurrentTrip(trip); setActiveTab('timeline'); }} 
          onRefresh={fetchTrips} 
        />
      )}

      {activeTab === 'map' && (
        <MapPage 
          stops={stops} 
          tripTitle={currentTrip?.title} 
          onOpenStream={() => setActiveTab('timeline')} 
        />
      )}

      {activeTab === 'profile' && (
        <ProfilePage 
          user={user} 
          trips={trips}
          onLogout={handleLogout} 
        />
      )}

      <LocationDrawer 
        isOpen={!!selectedStop} 
        onClose={() => setSelectedStop(null)} 
        stop={selectedStop} 
        onUpdate={handleUpdateStop} 
        onDelete={handleDeleteStop} 
      />
    </MainLayout>
  );
}
