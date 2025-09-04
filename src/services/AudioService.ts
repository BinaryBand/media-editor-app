import TrackPlayer, { Event, Track as RNTPTrack, State } from "react-native-track-player";

export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  uri: string;
  fileName: string;
  album?: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  diskNumber?: number;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: Track | null;
  position: number;
  duration: number;
  volume: number;
}

class AudioService {
  private listeners: ((state: AudioState) => void)[] = [];
  private state: AudioState = {
    isPlaying: false,
    isLoading: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 1.0,
  };
  private isInitialized = false;

  constructor() {
    this.setupTrackPlayer();
  }

  private async setupTrackPlayer() {
    try {
      await TrackPlayer.setupPlayer();
      this.isInitialized = true;

      // Set up event listeners
      TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
        const isPlaying = state.state === State.Playing;
        this.updateState({ isPlaying });
      });

      TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (progress) => {
        this.updateState({
          position: progress.position * 1000, // Convert to milliseconds
          duration: progress.duration * 1000, // Convert to milliseconds
        });
      });

      console.log("AudioService initialized with TrackPlayer");
    } catch (error) {
      console.error("Error setting up TrackPlayer:", error);
    }
  }

  subscribe(listener: (state: AudioState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateState(updates: Partial<AudioState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  async loadTrack(track: Track) {
    try {
      if (!this.isInitialized) {
        await this.setupTrackPlayer();
      }

      this.updateState({ isLoading: true });

      // Convert Track to TrackPlayer format
      const trackPlayerTrack: RNTPTrack = {
        id: track.id,
        url: track.uri,
        title: track.title,
        artist: track.artist || "Unknown Artist",
        album: track.album,
        genre: track.genre,
        date: track.year?.toString(),
        duration: track.duration ? track.duration / 1000 : undefined, // Convert to seconds
      };

      // Clear the queue and add the new track
      await TrackPlayer.reset();
      await TrackPlayer.add(trackPlayerTrack);

      this.updateState({
        currentTrack: track,
        isLoading: false,
        position: 0,
      });
    } catch (error) {
      console.error("Error loading track:", error);
      this.updateState({ isLoading: false });
    }
  }

  async play() {
    try {
      if (!this.isInitialized) {
        await this.setupTrackPlayer();
      }
      await TrackPlayer.play();
    } catch (error) {
      console.error("Error playing:", error);
    }
  }

  async pause() {
    try {
      await TrackPlayer.pause();
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }

  async stop() {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.seekTo(0);
      this.updateState({ position: 0, isPlaying: false });
    } catch (error) {
      console.error("Error stopping:", error);
    }
  }

  async seek(positionMillis: number) {
    try {
      const positionSeconds = positionMillis / 1000;
      await TrackPlayer.seekTo(positionSeconds);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  async setVolume(volume: number) {
    try {
      await TrackPlayer.setVolume(volume);
      this.updateState({ volume });
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }

  getState(): AudioState {
    return { ...this.state };
  }

  // Clean up resources when service is no longer needed
  dispose() {
    TrackPlayer.reset();
  }
}

export const audioService = new AudioService();
