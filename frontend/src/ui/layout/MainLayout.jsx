// src/ui/layout/MainLayout.jsx
import React from 'react';
import BottomNav from '../components/BottomNav';

export default function MainLayout({ 
  children, 
  activeTab, 
  onChangeTab, 
  headerTitle, 
  onHeaderLeftClick, 
  onHeaderRightClick,
  showSearch = false,
  loadingSearch = false,
  onSearchSubmit
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f8f5] text-[#1A1A1A] font-sans overflow-hidden">
      
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 w-full max-w-5xl mx-auto">
          <button onClick={onHeaderLeftClick} className="p-2 rounded-full hover:bg-black/5">
            <span className="material-symbols-outlined text-[#1A1A1A]">
              {activeTab === 'timeline' ? 'menu' : 'arrow_back'}
            </span>
          </button>
          <h1 className="font-bold text-lg md:text-xl tracking-tight text-[#1A1A1A] flex-1 text-center md:text-left">
            {headerTitle}
          </h1>
          <button onClick={onHeaderRightClick} className="p-2 rounded-full hover:bg-black/5">
            <span className="material-symbols-outlined text-[#1A1A1A]">explore</span>
          </button>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Floating Search (Conditional) */}
      {showSearch && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40 w-full pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <form onSubmit={onSearchSubmit} className="flex items-center gap-2 bg-white p-2.5 rounded-full shadow-2xl border border-[#E5E7EB]">
              <input 
                name="addStop" 
                className="flex-1 bg-transparent border-none text-base font-medium px-4 focus:ring-0 placeholder:text-slate-400" 
                placeholder={loadingSearch ? "Finding location..." : "Where next?"} 
                type="text" 
                disabled={loadingSearch} 
              />
              <button type="submit" className="w-12 h-12 bg-[#0f8201] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform" disabled={loadingSearch}>
                <span className="material-symbols-outlined text-2xl">{loadingSearch ? 'sync' : 'add'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  );
}
