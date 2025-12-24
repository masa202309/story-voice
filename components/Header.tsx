
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center space-y-2">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-lg mb-4">
        <i className="fa-solid fa-book-open text-2xl"></i>
      </div>
      <h1 className="text-4xl font-bold font-serif text-slate-900">StoryVoice AI</h1>
      <p className="text-slate-500 max-w-md mx-auto">
        Transform your stories into cinematic audio experiences with character-aware narration.
      </p>
    </header>
  );
};

export default Header;
