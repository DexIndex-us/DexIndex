import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
}

export const StatBar: React.FC<StatBarProps> = ({ label, value, max = 255 }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Color calculation based on stat value
  let color = 'bg-red-500';
  if (value >= 60) color = 'bg-orange-400';
  if (value >= 90) color = 'bg-yellow-400';
  if (value >= 110) color = 'bg-green-400';
  if (value >= 150) color = 'bg-cyan-400';

  const formatLabel = (str: string) => {
    switch (str) {
      case 'hp': return 'HP';
      case 'attack': return 'Atk';
      case 'defense': return 'Def';
      case 'special-attack': return 'SpA';
      case 'special-defense': return 'SpD';
      case 'speed': return 'Spd';
      default: return str;
    }
  };

  return (
    <div className="flex items-center text-xs mb-1.5">
      <div className="w-8 font-bold text-slate-500 uppercase">{formatLabel(label)}</div>
      <div className="w-8 text-right font-mono font-medium mr-2 text-slate-700">{value}</div>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};