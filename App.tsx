
import React, { useState, useRef, useCallback } from 'react';
import { analyzeStory, generateSpeech, decodeBase64, decodeAudioData, audioBufferToWav } from './services/geminiService';
import { StorySegment, PlaybackState, VoiceName } from './types';
import Header from './components/Header';
import StoryInput from './components/StoryInput';
import StoryDisplay from './components/StoryDisplay';
import Controls from './components/Controls';

const App: React.FC = () => {
  const [storyText, setStoryText] = useState('');
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentSegmentId: null,
    speed: 1.0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const handleAnalyze = async () => {
    if (!storyText.trim()) return;
    setIsAnalyzing(true);
    setPlayback({ isPlaying: false, currentSegmentId: null, speed: 1.0 });
    audioCacheRef.current.clear();
    
    try {
      const analyzedSegments = await analyzeStory(storyText);
      setSegments(analyzedSegments);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stopPlayback = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setPlayback(prev => ({ ...prev, isPlaying: false, currentSegmentId: null }));
  }, []);

  const fetchAudioBuffer = async (segment: StorySegment): Promise<AudioBuffer> => {
    initAudio();
    const ctx = audioCtxRef.current!;
    let buffer = audioCacheRef.current.get(segment.id);
    
    if (!buffer) {
      const base64 = await generateSpeech(segment.text, segment.voiceName);
      const data = decodeBase64(base64);
      buffer = await decodeAudioData(data, ctx);
      audioCacheRef.current.set(segment.id, buffer);
    }
    return buffer;
  };

  const playSegment = useCallback(async (index: number) => {
    if (index >= segments.length) {
      stopPlayback();
      return;
    }

    const segment = segments[index];
    setPlayback(prev => ({ ...prev, isPlaying: true, currentSegmentId: segment.id }));

    try {
      const buffer = await fetchAudioBuffer(segment);
      const ctx = audioCtxRef.current!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playback.speed;
      source.connect(ctx.destination);
      
      currentSourceRef.current = source;
      
      source.onended = () => {
        if (currentSourceRef.current === source) {
          playSegment(index + 1);
        }
      };

      source.start();
    } catch (error) {
      console.error("Playback failed for segment:", segment.id, error);
      playSegment(index + 1); 
    }
  }, [segments, playback.speed, stopPlayback]);

  const togglePlayback = () => {
    if (playback.isPlaying) {
      stopPlayback();
    } else {
      const startIndex = playback.currentSegmentId 
        ? segments.findIndex(s => s.id === playback.currentSegmentId) 
        : 0;
      playSegment(startIndex === -1 ? 0 : startIndex);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setPlayback(prev => ({ ...prev, speed: newSpeed }));
    if (currentSourceRef.current) {
      currentSourceRef.current.playbackRate.value = newSpeed;
    }
  };

  const handleVoiceChange = (speaker: string, newVoice: VoiceName) => {
    setSegments(prev => prev.map(seg => {
      if (seg.speaker === speaker) {
        audioCacheRef.current.delete(seg.id);
        return { ...seg, voiceName: newVoice };
      }
      return seg;
    }));
  };

  const downloadSegment = async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;
    try {
      const buffer = await fetchAudioBuffer(segment);
      const blob = audioBufferToWav(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `story_segment_${segment.speaker.toLowerCase().replace(/\s/g, '_')}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download segment audio.");
    }
  };

  const downloadFullStory = async () => {
    if (segments.length === 0) return;
    setIsDownloading(true);
    initAudio();
    const ctx = audioCtxRef.current!;

    try {
      const buffers: AudioBuffer[] = [];
      for (const segment of segments) {
        const buf = await fetchAudioBuffer(segment);
        buffers.push(buf);
      }

      // Merge buffers
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const mergedBuffer = ctx.createBuffer(1, totalLength, 24000);
      const channelData = mergedBuffer.getChannelData(0);
      
      let offset = 0;
      for (const buf of buffers) {
        channelData.set(buf.getChannelData(0), offset);
        offset += buf.length;
      }

      const blob = audioBufferToWav(mergedBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `full_story_reading.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Full download failed:", error);
      alert("Failed to combine and download full story audio.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8">
      <Header />
      
      <main className="flex-grow space-y-8 mt-8">
        {segments.length === 0 ? (
          <StoryInput 
            text={storyText} 
            setText={setStoryText} 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setSegments([])}
                className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                <i className="fa-solid fa-arrow-left"></i>
                New Story
              </button>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {segments.length} Story Segments
              </div>
            </div>
            
            <StoryDisplay 
              segments={segments} 
              currentSegmentId={playback.currentSegmentId} 
              onSegmentClick={(id) => {
                const index = segments.findIndex(s => s.id === id);
                stopPlayback();
                playSegment(index);
              }}
              onVoiceChange={handleVoiceChange}
              onDownloadSegment={downloadSegment}
            />
          </div>
        )}
      </main>

      {segments.length > 0 && (
        <Controls 
          isPlaying={playback.isPlaying} 
          isDownloading={isDownloading}
          speed={playback.speed}
          onToggle={togglePlayback}
          onSpeedChange={handleSpeedChange}
          onStop={stopPlayback}
          onDownloadAll={downloadFullStory}
        />
      )}
    </div>
  );
};

export default App;
