
import React from 'react';

interface Props {
  isPlaying: boolean;
  isDownloading: boolean;
  speed: number;
  onToggle: () => void;
  onSpeedChange: (s: number) => void;
  onStop: () => void;
  onDownloadAll: () => void;
}

const Controls: React.FC<Props> = ({ isPlaying, isDownloading, speed, onToggle, onSpeedChange, onStop, onDownloadAll }) => {
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggle}
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
        </button>
        <button 
          onClick={onStop}
          className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center"
          title="Stop"
        >
          <i className="fa-solid fa-stop text-sm"></i>
        </button>
        <div className="w-px h-8 bg-slate-200 mx-1"></div>
        <button 
          onClick={onDownloadAll}
          disabled={isDownloading}
          className={`
            w-10 h-10 rounded-xl transition-all flex items-center justify-center
            ${isDownloading 
              ? 'bg-slate-50 text-slate-300 animate-pulse cursor-not-allowed' 
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }
          `}
          title="Download full audio (WAV)"
        >
          {isDownloading ? (
            <i className="fa-solid fa-spinner animate-spin text-sm"></i>
          ) : (
            <i className="fa-solid fa-file-export text-sm"></i>
          )}
        </button>
      </div>

      <div className="flex-grow px-2 w-full sm:max-w-[240px]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speed</span>
          <span className="text-xs font-bold text-indigo-600">{speed}x</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`
                flex-1 py-1 rounded-md text-[10px] font-bold transition-all
                ${speed === s 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;
