
import React from 'react';

interface Props {
  text: string;
  setText: (t: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const StoryInput: React.FC<Props> = ({ text, setText, onAnalyze, isAnalyzing }) => {
  const isButtonDisabled = isAnalyzing || !text.trim();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
        Enter your story
      </label>
      <textarea
        className="w-full h-64 p-4 text-lg bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-serif leading-relaxed"
        placeholder="Once upon a time, in a land far away..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={isButtonDisabled}
          className={`
            px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-3
            ${isButtonDisabled 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin"></i>
              Analyzing Story...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Generate Cinematic Reading
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StoryInput;
