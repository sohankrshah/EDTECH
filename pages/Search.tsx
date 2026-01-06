
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_UNIVERSITIES } from '../constants';
import UniversityCard from '../components/UniversityCard';
import { University } from '../types';

const STORAGE_KEY = 'edupath_comparison_list';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('All');
  const [minRanking, setMinRanking] = useState(1);
  const [maxRanking, setMaxRanking] = useState(100);
  const [maxTuition, setMaxTuition] = useState(60000);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  
  // Comparison State - Initialized from localStorage
  const [comparisonList, setComparisonList] = useState<University[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load comparison list", e);
      return [];
    }
  });
  
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync comparisonList to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonList));
  }, [comparisonList]);

  const countries = useMemo(() => ['All', ...new Set(MOCK_UNIVERSITIES.map(u => u.country))], []);
  
  const allPrograms = useMemo(() => {
    const progs = new Set<string>();
    MOCK_UNIVERSITIES.forEach(u => u.programs.forEach(p => progs.add(p)));
    return Array.from(progs).sort();
  }, []);

  const filteredProgramsList = useMemo(() => {
    if (!programSearchQuery.trim()) return allPrograms;
    return allPrograms.filter(p => 
      p.toLowerCase().includes(programSearchQuery.toLowerCase())
    );
  }, [allPrograms, programSearchQuery]);

  const filtered = MOCK_UNIVERSITIES.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.programs.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCountry = filterCountry === 'All' || u.country === filterCountry;
    const matchesRanking = u.ranking >= minRanking && u.ranking <= maxRanking;
    const matchesTuition = u.tuitionValue <= maxTuition;
    const matchesPrograms = selectedPrograms.length === 0 || 
                            u.programs.some(p => selectedPrograms.includes(p));
    
    return matchesSearch && matchesCountry && matchesRanking && matchesTuition && matchesPrograms;
  });

  const toggleProgram = (prog: string) => {
    setSelectedPrograms(prev => 
      prev.includes(prog) ? prev.filter(p => p !== prog) : [...prev, prog]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCountry('All');
    setMinRanking(1);
    setMaxRanking(100);
    setMaxTuition(60000);
    setSelectedPrograms([]);
    setProgramSearchQuery('');
  };

  const toggleComparison = (uni: University) => {
    setComparisonList(prev => {
      const exists = prev.find(item => item.id === uni.id);
      if (exists) {
        return prev.filter(item => item.id !== uni.id);
      }
      if (prev.length >= 4) {
        alert("Maximum comparison limit reached (4 universities).");
        return prev;
      }
      return [...prev, uni];
    });
  };

  const handleSaveComparison = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Optional: Add a success toast here
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative pb-32">
      {/* Sidebar Filters */}
      <aside className={`lg:w-72 space-y-6 ${isFilterSidebarOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-sliders-h text-indigo-600"></i>
              Filters
            </h3>
            <button 
              onClick={resetFilters}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Ranking Range (Min & Max) */}
          <div className="space-y-4 mb-8">
            <label className="text-sm font-semibold text-slate-600 block">World Ranking</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block ml-1">From</span>
                <input 
                  type="number" 
                  min="1" 
                  value={minRanking}
                  onChange={(e) => setMinRanking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block ml-1">To</span>
                <input 
                  type="number" 
                  min="1" 
                  value={maxRanking}
                  onChange={(e) => setMaxRanking(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tuition Fee Range */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-600">Max Tuition</label>
              <span className="text-xs font-bold text-indigo-600">${maxTuition.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="60000" 
              step="1000"
              value={maxTuition} 
              onChange={(e) => setMaxTuition(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Program Availability */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-600">Study Programs</label>
            <div className="relative mb-2">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
              <input 
                type="text" 
                placeholder="Search programs..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                value={programSearchQuery}
                onChange={(e) => setProgramSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {filteredProgramsList.map(prog => (
                <label key={prog} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-all group">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedPrograms.includes(prog)}
                    onChange={() => toggleProgram(prog)}
                  />
                  <span className={`text-xs ${selectedPrograms.includes(prog) ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    {prog}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Search Area */}
      <div className="flex-1 space-y-6">
        {/* Top Search Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search by university name..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-3 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[140px]"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map(u => (
              <div key={u.id} className="relative group">
                <UniversityCard university={u} />
                <button 
                  onClick={() => toggleComparison(u)}
                  className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${
                    comparisonList.some(item => item.id === u.id)
                      ? 'bg-indigo-600 text-white ring-2 ring-white scale-105'
                      : 'bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white'
                  }`}
                >
                  <i className={`fas ${comparisonList.some(item => item.id === u.id) ? 'fa-check' : 'fa-plus'}`}></i>
                  {comparisonList.some(item => item.id === u.id) ? 'Selected' : 'Compare'}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <h3 className="text-xl font-bold text-slate-800">No universities found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-indigo-950 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex -space-x-4">
            {comparisonList.map((uni) => (
              <div key={uni.id} className="w-12 h-12 rounded-full border-4 border-indigo-950 overflow-hidden bg-white shadow-xl">
                <img src={uni.image} className="w-full h-full object-cover" alt={uni.name} />
              </div>
            ))}
            {comparisonList.length < 4 && (
              <div className="w-12 h-12 rounded-full border-4 border-indigo-950 bg-indigo-900 flex items-center justify-center text-indigo-400 text-xs font-bold italic">
                +{4 - comparisonList.length}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold">{comparisonList.length} Universities Picked</p>
            <p className="text-[10px] text-indigo-400 font-medium">Add up to 4 for analysis</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setComparisonList([])}
              className="px-5 py-2 rounded-2xl text-xs font-bold hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
            <button 
              disabled={comparisonList.length < 2}
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-white text-indigo-950 px-8 py-3 rounded-2xl text-xs font-black shadow-lg hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              COMPARE NOW
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">University Comparison</h3>
                <p className="text-slate-500 text-sm">Detailed side-by-side analysis of your top picks</p>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-slate-600"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
              <div className="min-w-[800px]">
                <table className="w-full table-fixed border-separate border-spacing-x-4">
                  <thead>
                    <tr>
                      <th className="w-1/5 pb-8"></th>
                      {comparisonList.map(uni => (
                        <th key={uni.id} className="pb-8">
                          <div className="relative group">
                            <button 
                              onClick={() => toggleComparison(uni)}
                              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <div className="bg-slate-50 rounded-3xl p-4 flex flex-col items-center text-center gap-4 border border-slate-100">
                              <img src={uni.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg" alt={uni.name} />
                              <span className="font-black text-slate-800 text-sm leading-tight">{uni.name}</span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="group">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-trophy text-amber-500"></i>
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Ranking</span>
                        </div>
                      </td>
                      {comparisonList.map(uni => (
                        <td key={uni.id} className="py-6 text-center">
                          <span className="text-xl font-black text-indigo-600">#{uni.ranking}</span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">World Rank</p>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-map-marker-alt text-indigo-400"></i>
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Location</span>
                        </div>
                      </td>
                      {comparisonList.map(uni => (
                        <td key={uni.id} className="py-6 text-center">
                          <p className="text-sm font-bold text-slate-700">{uni.country}</p>
                          <p className="text-xs text-slate-500">{uni.location}</p>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-coins text-emerald-500"></i>
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Tuition</span>
                        </div>
                      </td>
                      {comparisonList.map(uni => (
                        <td key={uni.id} className="py-6 text-center">
                          <p className="text-sm font-black text-emerald-600">{uni.tuition}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated / Year</p>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-info-circle text-slate-400"></i>
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">About</span>
                        </div>
                      </td>
                      {comparisonList.map(uni => (
                        <td key={uni.id} className="py-6 px-4">
                          <p className="text-xs text-slate-500 leading-relaxed text-center italic">
                            "{uni.description}"
                          </p>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-xs text-slate-400 font-medium">
                * Tuition rates are estimates based on international student averages.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-8 py-3 bg-white text-slate-600 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handleSaveComparison}
                  className={`px-10 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 ${
                    isSaving 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <i className={`fas ${isSaving ? 'fa-check' : 'fa-download'}`}></i>
                  {isSaving ? 'Shortlist Saved' : 'Save Comparison'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Search;
