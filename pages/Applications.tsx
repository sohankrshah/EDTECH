
import React, { useState } from 'react';
import { MOCK_APPLICATIONS } from '../constants';
import { Application } from '../types';

const Applications: React.FC = () => {
  const [apps, setApps] = useState<Application[]>(MOCK_APPLICATIONS);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const toggleReminder = (id: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === id) {
        const newState = !app.reminderEnabled;
        if (newState) {
          setShowNotificationToast(true);
          setTimeout(() => setShowNotificationToast(false), 3000);
        }
        return { ...app, reminderEnabled: newState };
      }
      return app;
    }));
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { label: 'Expired', color: 'text-red-500 bg-red-50' };
    if (days <= 7) return { label: `Due in ${days} days`, color: 'text-amber-600 bg-amber-50' };
    return { label: `Due in ${days} days`, color: 'text-slate-500 bg-slate-50' };
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Simulation */}
      {showNotificationToast && (
        <div className="fixed top-24 right-8 z-[60] bg-indigo-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
          <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
            <i className="fas fa-bell"></i>
          </div>
          <div>
            <p className="font-bold text-sm">Reminders Enabled!</p>
            <p className="text-xs text-indigo-200">We'll notify you via email 48h before the deadline.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Applications</h2>
          <p className="text-slate-500 text-sm">Track your progress and stay ahead of deadlines.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <i className="fas fa-cog"></i> Notification Settings
          </button>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i> New Application
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {apps.map((app) => {
          const deadlineStatus = getDeadlineStatus(app.deadline);
          return (
            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-all relative overflow-hidden group">
              {/* Deadline Badge */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {app.universityName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{app.universityName}</h3>
                  <p className="text-slate-500 text-sm mb-1">{app.program}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'Draft' ? 'bg-slate-100 text-slate-600' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-500">Application Progress</span>
                  <span className="text-xs font-bold text-indigo-600">{app.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${app.progress}%` }}></div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {app.deadline && (
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-2 mb-1">
                      <i className="far fa-calendar-alt text-slate-400 text-sm"></i>
                      <span className="text-xs font-bold text-slate-700">{app.deadline}</span>
                    </div>
                    {deadlineStatus && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deadlineStatus.color}`}>
                        {deadlineStatus.label}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleReminder(app.id)}
                    className={`p-3 rounded-xl transition-all border ${
                      app.reminderEnabled 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' 
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'
                    }`}
                    title={app.reminderEnabled ? "Reminders enabled" : "Enable reminders"}
                  >
                    <i className={`fas ${app.reminderEnabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                  </button>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all border border-slate-100">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deadline Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <i className="fas fa-paper-plane absolute -right-8 -bottom-8 text-white/5 text-9xl rotate-12"></i>
          <h3 className="text-xl font-bold mb-4">Reminder Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <p className="font-bold text-sm">Email Reminders</p>
                  <p className="text-xs text-white/50">To: alex.chen@email.com</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-indigo-500 rounded-full p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full ml-6"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div>
                  <p className="font-bold text-sm">Push Notifications</p>
                  <p className="text-xs text-white/50">For web and mobile app</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-[10px] text-white/40 uppercase font-bold tracking-[2px]">Automatically calculated based on GMT+0</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <h3 className="text-xl font-bold text-amber-900">Priority Deadlines</h3>
          </div>
          <div className="space-y-4">
            {apps.filter(a => getDeadlineStatus(a.deadline)?.label.includes('7 days')).map(app => (
              <div key={app.id} className="flex items-center justify-between py-3 border-b border-amber-200 last:border-0">
                <div>
                  <p className="font-bold text-amber-900 text-sm">{app.universityName}</p>
                  <p className="text-amber-700/70 text-xs">{app.program}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-600">{getDeadlineStatus(app.deadline)?.label}</p>
                  <button className="text-[10px] font-bold text-amber-800 underline hover:no-underline">Complete Tasks</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="mt-12 bg-slate-100/50 p-8 rounded-3xl border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Application Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-slate-200 z-0"></div>
          {[
            { step: 1, title: 'Profile Build', desc: 'Add grades & interests', icon: 'fa-user' },
            { step: 2, title: 'University Pick', desc: 'Finalize selection', icon: 'fa-list-check' },
            { step: 3, title: 'Docs Upload', desc: 'Submit all paperwork', icon: 'fa-upload' },
            { step: 4, title: 'Submit', desc: 'Official submission', icon: 'fa-paper-plane' },
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-4 shadow-sm transition-all duration-500 ${
                item.step <= 2 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border border-slate-100'
              }`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Applications;
