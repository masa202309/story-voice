
export type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface StorySegment {
  speaker: string;
  text: string;
  voiceName: VoiceName;
  id: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSegmentId: string | null;
  speed: number;
}
