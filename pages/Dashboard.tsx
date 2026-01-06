
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { MOCK_APPLICATIONS, MOCK_DOCUMENTS, MOCK_UNIVERSITIES } from '../constants';

const DASHBOARD_LAYOUT_KEY = 'edupath_dashboard_layout_v3';

type WidgetId = 'STATS' | 'PROGRESS_CHART' | 'DOC_HEALTH' | 'ACTIVITY' | 'PRIORITY' | 'SCHOLARSHIPS' | 'TRENDS' | 'FINANCE' | 'WORLD_CLOCKS' | 'JOURNEY';

interface WidgetConfig {
  id: WidgetId;
  visible: boolean;
  title: string;
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'JOURNEY', visible: true, title: 'Application Journey' },
  { id: 'STATS', visible: true, title: 'Key Metrics' },
  { id: 'PROGRESS_CHART', visible: true, title: 'Submission Tracker' },
  { id: 'FINANCE', visible: true, title: 'Financial Forecast' },
  { id: 'PRIORITY', visible: true, title: 'Task Focus' },
  { id: 'WORLD_CLOCKS', visible: true, title: 'World Campus' },
  { id: 'SCHOLARSHIPS', visible: true, title: 'Scholarship Match' },
  { id: 'DOC_HEALTH', visible: true, title: 'Compliance' },
  { id: 'ACTIVITY', visible: true, title: 'Recent History' },
  { id: 'TRENDS', visible: true, title: 'Global Market' },
];

const Dashboard: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize SOP Introduction', done: true },
    { id: 2, text: 'Request LOR from Professor Smith', done: false },
    { id: 3, text: 'Scan Passport bio-page', done: false },
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Aggregated Data
  const activeApps = MOCK_APPLICATIONS.length;
  const verifiedDocs = MOCK_DOCUMENTS.filter(d => d.status === 'Verified').length;
  const totalDocs = MOCK_DOCUMENTS.length;
  const profileReadiness = Math.round(((verifiedDocs / totalDocs) * 60) + (activeApps > 0 ? 40 : 0));

  const appProgressData = useMemo(() => MOCK_APPLICATIONS.map(app => ({
    name: app.universityName.split(' ')[0],
    progress: app.progress,
    color: app.status === 'Accepted' ? '#10b981' : '#6366f1'
  })), []);

  const financeData = [
    { category: 'Tuition', budget: 50000, actual: 55000 },
    { category: 'Housing', budget: 15000, actual: 12000 },
    { category: 'Visa/Flights', budget: 3000, actual: 3500 },
    { category: 'Insurance', budget: 2000, actual: 1800 },
  ];

  const docStatusData = [
    { name: 'Verified', value: verifiedDocs, fill: '#10b981' },
    { name: 'In Review', value: MOCK_DOCUMENTS.filter(d => d.status === 'Uploaded').length, fill: '#6366f1' },
    { name: 'Pending', value: MOCK_DOCUMENTS.filter(d => d.status === 'Missing').length, fill: '#f59e0b' },
  ];

  const toggleWidget = (id: WidgetId) => {
    setLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleTaskToggle = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Drag & Drop
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newLayout = [...layout];
    const item = newLayout.splice(draggedIndex, 1)[0];
    newLayout.splice(index, 0, item);
    setLayout(newLayout);
    setDraggedIndex(index);
  };

  // --- New Render Functions ---

  const renderJourney = () => (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black text-slate-800">Your Global Journey</h3>
        <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">Stage 3 of 5</span>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block"></div>
        {[
          { label: 'Discovery', icon: 'fa-search', status: 'completed' },
          { label: 'Preparation', icon: 'fa-book', status: 'completed' },
          { label: 'Application', icon: 'fa-file-signature', status: 'current' },
          { label: 'Visa Process', icon: 'fa-passport', status: 'pending' },
          { label: 'Departure', icon: 'fa-plane-departure', status: 'pending' },
        ].map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-500 shadow-lg ${
              step.status === 'completed' ? 'bg-emerald-500 text-white' :
              step.status === 'current' ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110' :
              'bg-white text-slate-300 border border-slate-100'
            }`}>
              <i className={`fas ${step.icon}`}></i>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              step.status === 'current' ? 'text-indigo-600' : 'text-slate-400'
            }`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">Financial Forecast</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Budget vs. Estimates</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-rose-500">+$3,200 Gap</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Need more funding</p>
        </div>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financeData} layout="vertical" margin={{ left: -20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
            {/* Fix: 'shadow' is not a valid CSS property in style objects; changed to 'boxShadow' */}
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="budget" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="actual" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderWorldClocks = () => (
    <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl h-full flex flex-col justify-between">
      <h3 className="text-xl font-black mb-6">World Campus</h3>
      <div className="space-y-6">
        {[
          { city: 'Palo Alto', country: 'USA', time: new Date(currentTime.getTime() - 8 * 3600000), weather: 'Sunny 22°C', icon: 'fa-sun' },
          { city: 'Oxford', country: 'UK', time: new Date(currentTime.getTime() + 0 * 3600000), weather: 'Rainy 12°C', icon: 'fa-cloud-rain' },
          { city: 'Zurich', country: 'SUI', time: new Date(currentTime.getTime() + 1 * 3600000), weather: 'Snow 1°C', icon: 'fa-snowflake' },
        ].map((clock, i) => (
          <div key={i} className="flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/50 group-hover:bg-indigo-500/30 group-hover:text-white transition-all">
                <i className={`fas ${clock.icon}`}></i>
              </div>
              <div>
                <h4 className="font-bold text-sm">{clock.city}</h4>
                <p className="text-[10px] text-white/40 uppercase font-black">{clock.country}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black font-mono">{clock.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              <p className="text-[10px] text-emerald-400 font-bold">{clock.weather}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center">Global Admission Windows Active</p>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Applications', value: activeApps, icon: 'fa-paper-plane', color: 'bg-indigo-600', sub: '2 in review' },
        { label: 'Scholarships', value: '$45k', icon: 'fa-piggy-bank', color: 'bg-emerald-600', sub: 'Eligible matches' },
        { label: 'Next Deadline', value: '5d 12h', icon: 'fa-clock', color: 'bg-rose-600', sub: 'Stanford MSCS', pulse: true },
        { label: 'Profile Score', value: '88/100', icon: 'fa-bolt', color: 'bg-amber-600', sub: 'Top 5% student' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform ${stat.pulse ? 'animate-pulse' : ''}`}>
            <i className={`fas ${stat.icon}`}></i>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
          <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );

  const renderPriority = () => (
    <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
          Focus List
        </h3>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{tasks.filter(t => t.done).length} / {tasks.length}</span>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.map(task => (
          <label key={task.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
            task.done ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-slate-100 hover:border-indigo-200'
          }`}>
            <input 
              type="checkbox" 
              checked={task.done} 
              onChange={() => handleTaskToggle(task.id)}
              className="w-5 h-5 rounded-full border-slate-200 text-indigo-500 focus:ring-0"
            />
            <span className={`text-sm font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {task.text}
            </span>
          </label>
        ))}
      </div>
      <button className="mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
        Launch Writing Assistant <i className="fas fa-magic text-xs"></i>
      </button>
    </div>
  );

  const widgetMap: Record<WidgetId, () => React.ReactNode> = {
    JOURNEY: renderJourney,
    STATS: renderStats,
    PRIORITY: renderPriority,
    WORLD_CLOCKS: renderWorldClocks,
    FINANCE: renderFinance,
    PROGRESS_CHART: () => (
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">University Milestones</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Submission status across picks</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">ACCEPTED</span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appProgressData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="progress" radius={[8, 8, 8, 8]} barSize={40}>
                {appProgressData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    DOC_HEALTH: () => (
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col">
        <h3 className="text-xl font-black text-slate-800 text-center mb-4 tracking-tight">Compliance Health</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={docStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value" stroke="none">
                {docStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto p-5 bg-indigo-50 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-900">Missing Critical Records</p>
            <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">Financial Proof needed for ETH Zurich.</p>
          </div>
        </div>
      </div>
    ),
    ACTIVITY: () => (
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
        <h3 className="text-xl font-black text-slate-800 mb-8">Recent History</h3>
        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {[
            { title: 'Transcript Verified', meta: 'High School Records', time: '1h ago', icon: 'fa-check', color: 'bg-emerald-500' },
            { title: 'Uni Choice Changed', meta: 'Stanford → Oxford', time: '3h ago', icon: 'fa-random', color: 'bg-indigo-500' },
            { title: 'AI Essay Drafted', meta: 'Motivation Letter V2', time: 'Yesterday', icon: 'fa-pencil-alt', color: 'bg-amber-500' },
          ].map((a, i) => (
            <div key={i} className="flex gap-8 relative items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 text-white text-[10px] shadow-lg ${a.color}`}>
                <i className={`fas ${a.icon}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                  <span className="text-[10px] font-black text-slate-300 uppercase">{a.time}</span>
                </div>
                <p className="text-slate-400 text-xs font-medium mt-1">{a.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    SCHOLARSHIPS: () => (
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-800">Scholarship Match</h3>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Full List</button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Global Excellence', amount: '$20,000', match: 98, color: 'text-amber-500' },
            { name: 'STEM Innovators', amount: '$15,000', match: 92, color: 'text-blue-500' },
          ].map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${s.color}`}>
                  <i className="fas fa-award"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Due Dec 30</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-indigo-600">{s.amount}</p>
                <p className="text-[10px] text-emerald-500 font-black">{s.match}% Match</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    TRENDS: () => (
      <div className="bg-indigo-50 p-8 rounded-[3rem] border border-indigo-100 h-full flex flex-col">
        <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
          <i className="fas fa-globe-americas"></i> Global Insights
        </h3>
        <div className="flex-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Visa Alert</p>
            <h4 className="font-bold text-slate-800 text-sm">US F1: 14 Days</h4>
            <p className="text-xs text-slate-500 mt-1">20% faster than monthly average.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Success Nugget</p>
            <h4 className="font-bold text-slate-800 text-sm">Stanford values "Community Impact"</h4>
            <p className="text-xs text-slate-500 mt-1">Include 150 words on your local projects.</p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Dynamic Header */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[4rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {getTimeGreeting()}, Alex! <span className="inline-block animate-bounce ml-2">🎓</span>
              </h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    isEditMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  <i className={`fas ${isEditMode ? 'fa-save mr-2' : 'fa-th-large mr-2'}`}></i>
                  {isEditMode ? 'Finish Edit' : 'Personalize View'}
                </button>
              </div>
            </div>
            <p className="text-slate-500 font-medium max-w-lg mb-8">You're currently in the <span className="text-indigo-600 font-black">Application Phase</span>. 2 critical documents are pending verification.</p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3">
                <i className="fas fa-plus-circle"></i> Submit Record
              </button>
              <button className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all flex items-center gap-3">
                <i className="fas fa-robot"></i> Consultation
              </button>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center shrink-0">
            <div className="w-44 h-44 rounded-full border-[14px] border-slate-50 flex items-center justify-center relative bg-white shadow-2xl">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="88" cy="88" r="74" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-50" />
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="74" 
                    stroke="currentColor" 
                    strokeWidth="14" 
                    fill="transparent" 
                    strokeDasharray={464.9} 
                    strokeDashoffset={464.9 - (464.9 * profileReadiness) / 100} 
                    className="text-indigo-600 transition-all duration-1000" 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-800">{profileReadiness}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {layout.map((widget, index) => {
          if (!widget.visible && !isEditMode) return null;

          let gridSpan = "lg:col-span-4";
          if (widget.id === 'JOURNEY' || widget.id === 'STATS') gridSpan = "lg:col-span-12";
          if (widget.id === 'PROGRESS_CHART' || widget.id === 'FINANCE') gridSpan = "lg:col-span-8";

          return (
            <div 
              key={widget.id}
              draggable={isEditMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`${gridSpan} transition-all duration-300 ${isEditMode ? 'scale-[0.98] ring-4 ring-dashed ring-indigo-200 rounded-[3rem] p-4 bg-slate-50/50 cursor-move' : ''} ${
                !widget.visible && isEditMode ? 'opacity-40 grayscale' : 'opacity-100'
              }`}
            >
              {isEditMode && (
                <div className="flex justify-between items-center mb-4 px-4">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{widget.title}</span>
                  <button onClick={() => toggleWidget(widget.id)} className={`p-2 rounded-xl text-xs transition-colors ${widget.visible ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    <i className={`fas ${widget.visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              )}
              {widgetMap[widget.id]()}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
