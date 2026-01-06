
import React from 'react';
import { University } from '../types';

interface Props {
  university: University;
}

const UniversityCard: React.FC<Props> = ({ university }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48">
        <img 
          src={university.image} 
          alt={university.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
          #{university.ranking} Global
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{university.name}</h3>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-semibold whitespace-nowrap">
            {university.country}
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {university.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {university.programs.slice(0, 3).map(p => (
            <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {p}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-indigo-600 font-bold text-sm">{university.tuition}</span>
          <button className="text-indigo-700 hover:text-indigo-900 text-sm font-semibold flex items-center gap-1 group/btn">
            View Details 
            <i className="fas fa-arrow-right text-xs group-hover/btn:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;
