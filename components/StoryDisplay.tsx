
import React, { useMemo } from 'react';
import { StorySegment, VoiceName } from '../types';

interface Props {
  segments: StorySegment[];
  currentSegmentId: string | null;
  onSegmentClick: (id: string) => void;
  onVoiceChange: (speaker: string, voice: VoiceName) => void;
  onDownloadSegment: (id: string) => void;
}

const VOICE_OPTIONS: { value: VoiceName; label: string; desc: string }[] = [
  { value: 'Kore', label: 'Kore', desc: 'Energetic & Clear' },
  { value: 'Puck', label: 'Puck', desc: 'Playful & Youthful' },
  { value: 'Charon', label: 'Charon', desc: 'Serious & Deep' },
  { value: 'Fenrir', label: 'Fenrir', desc: 'Gruff & Intense' },
  { value: 'Zephyr', label: 'Zephyr', desc: 'Gentle & Ethereal' },
];

const StoryDisplay: React.FC<Props> = ({ segments, currentSegmentId, onSegmentClick, onVoiceChange, onDownloadSegment }) => {
  const uniqueSpeakers = useMemo(() => {
    const speakers = new Map<string, VoiceName>();
    segments.forEach(seg => {
      if (!speakers.has(seg.speaker)) {
        speakers.set(seg.speaker, seg.voiceName);
      }
    });
    return Array.from(speakers.entries());
  }, [segments]);

  return (
    <div className="space-y-8 pb-32">
      {/* Cast Manager Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-users text-indigo-600"></i>
            Cast & Voices
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {uniqueSpeakers.map(([speaker, currentVoice]) => (
            <div key={speaker} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">{speaker}</span>
                <span className="text-[10px] text-slate-500 uppercase">Voice Profile</span>
              </div>
              <select
                value={currentVoice}
                onChange={(e) => onVoiceChange(speaker, e.target.value as VoiceName)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {VOICE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.desc})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Story Segments List */}
      <div className="space-y-4">
        <div className="px-1 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Script</h2>
          <span className="text-[10px] text-slate-300 font-medium italic">Click to play specific part</span>
        </div>
        {segments.map((seg) => {
          const isActive = currentSegmentId === seg.id;
          return (
            <div 
              key={seg.id}
              onClick={() => onSegmentClick(seg.id)}
              className={`
                p-6 rounded-2xl border-2 transition-all cursor-pointer group relative
                ${isActive 
                  ? 'bg-indigo-50 border-indigo-300 shadow-md ring-1 ring-indigo-200 scale-[1.01]' 
                  : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter
                    ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {seg.speaker}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    <i className="fa-solid fa-microphone-lines mr-1 opacity-50"></i>
                    {seg.voiceName}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadSegment(seg.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Download segment audio"
                >
                  <i className="fa-solid fa-download text-xs"></i>
                </button>
              </div>
              <p className={`
                text-lg font-serif leading-relaxed transition-colors
                ${isActive ? 'text-indigo-900' : 'text-slate-700'}
              `}>
                {seg.text}
              </p>
              {isActive && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-600 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryDisplay;
