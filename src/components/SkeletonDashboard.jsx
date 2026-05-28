import React from "react";
import { Home, Bell, Settings, User } from "lucide-react";

const SkeletonDashboard = () => {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden animate-pulse">
      {/* 🌑 SIDEBAR MOCKUP */}
      <aside className="hidden md:flex flex-col bg-[#0f172a] border-r border-slate-800 w-64 flex-shrink-0">
        {/* Brand / Logo Area */}
        <div className="h-20 flex items-center px-5 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex-shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="w-24 h-4 bg-slate-800 rounded-md" />
              <div className="w-16 h-2 bg-slate-800/60 rounded-md" />
            </div>
          </div>
        </div>

        {/* Sidebar Menu Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-3 py-3 rounded-xl bg-slate-900/30 border border-transparent"
            >
              <div className="w-5 h-5 bg-slate-800 rounded-md flex-shrink-0" />
              <div className="w-28 h-3.5 bg-slate-800 rounded-md" />
            </div>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
          <div className="flex items-center gap-4 px-3 py-3 rounded-xl bg-slate-900/30">
            <div className="w-5 h-5 bg-slate-800 rounded-md flex-shrink-0" />
            <div className="w-16 h-3.5 bg-slate-800 rounded-md" />
          </div>
        </div>
      </aside>

      {/* 🧊 MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ⚡️ HEADER MOCKUP */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">
          {/* Left Breadcrumb */}
          <nav className="flex items-center space-x-3">
            <div className="text-slate-200">
              <Home size={16} />
            </div>
            <span className="text-slate-300">/</span>
            <div className="w-24 h-4 bg-slate-200 rounded-md" />
          </nav>

          {/* Right Profile & Actions */}
          <div className="flex items-center space-x-4">
            {/* Live Indicator Mockup */}
            <div className="hidden lg:flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200 gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <div className="w-20 h-2.5 bg-slate-300 rounded-sm" />
            </div>

            {/* Notification & Settings Mockup */}
            <div className="flex items-center gap-2">
              <div className="p-2.5 text-slate-300">
                <Bell size={19} />
              </div>
              <div className="p-2.5 text-slate-300">
                <Settings size={19} />
              </div>
            </div>

            {/* Profile Dropdown Mockup */}
            <div className="flex items-center pl-4 border-l border-slate-200 gap-3">
              <div className="text-right hidden md:block space-y-1">
                <div className="w-28 h-3.5 bg-slate-200 rounded-md" />
                <div className="w-16 h-2.5 bg-slate-100 rounded-md ml-auto" />
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-300 border border-slate-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* 🧊 MAIN PAGE GRID CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Page Header Mockup */}
            <div className="space-y-2">
              <div className="w-64 h-8 bg-slate-200 rounded-lg" />
              <div className="w-96 h-4 bg-slate-200/80 rounded-md" />
            </div>

            {/* Row of Stat Cards (KPI Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-3 flex-1">
                    <div className="w-28 h-3 bg-slate-200 rounded-md" />
                    <div className="w-16 h-8 bg-slate-200 rounded-lg" />
                    <div className="w-36 h-2.5 bg-slate-100 rounded-md" />
                  </div>
                  <div className="w-12 h-12 bg-slate-100 border border-slate-200/50 rounded-xl flex-shrink-0 ml-4" />
                </div>
              ))}
            </div>

            {/* Central Dashboard Widget Mockup */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-slate-200 rounded-md" />
                <div className="w-48 h-5 bg-slate-200 rounded-md" />
              </div>
              
              {/* Complex Graphical Bars Mockup */}
              <div className="space-y-4 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                      <div className="w-10 h-3.5 bg-slate-200 rounded-md" />
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-200 h-full rounded-full"
                        style={{ width: `${Math.max(20, Math.floor(Math.random() * 80))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Column Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((panel) => (
                <div
                  key={panel}
                  className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-40 h-5 bg-slate-200 rounded-md" />
                    <div className="w-12 h-4 bg-slate-100 rounded-md" />
                  </div>

                  <div className="space-y-4 divide-y divide-slate-100">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex justify-between items-center pt-4 first:pt-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0" />
                          <div className="space-y-1.5">
                            <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                            <div className="w-20 h-2.5 bg-slate-100 rounded-md" />
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-slate-100 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
