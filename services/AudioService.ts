import {
  AudioPlayer,
  AudioSource,
  AudioStatus,
  createAudioPlayer,
  PLAYBACK_STATUS_UPDATE,
  setAudioModeAsync,
} from "expo-audio";

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
  private player: AudioPlayer | null = null;
  private listeners: ((state: AudioState) => void)[] = [];
  private state: AudioState = {
    isPlaying: false,
    isLoading: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 1.0,
  };
  private positionUpdateInterval: number | null = null;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      // Set up audio mode for background playback
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
      console.log("Audio service initialized");
    } catch (error) {
      console.error("Error setting up audio:", error);
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

  private startPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }

    this.positionUpdateInterval = setInterval(() => {
      if (this.player && this.player.playing) {
        this.updateState({
          position: this.player.currentTime * 1000, // Convert to milliseconds
          duration: this.player.duration * 1000, // Convert to milliseconds
          isPlaying: this.player.playing,
        });
      }
    }, 500) as any;
  }

  private stopPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  async loadTrack(track: Track) {
    try {
      this.updateState({ isLoading: true });
      this.stopPositionUpdates();

      // Release the previous player
      if (this.player) {
        this.player.remove();
      }

      // Create new audio player with the track URI
      const audioSource: AudioSource = { uri: track.uri };
      this.player = createAudioPlayer(audioSource, 500); // 500ms update interval

      // Set up event listeners for playback status updates
      this.player.addListener(PLAYBACK_STATUS_UPDATE, (status: AudioStatus) => {
        if (status.isLoaded) {
          this.updateState({
            isPlaying: status.playing || false,
            position: (status.currentTime || 0) * 1000,
            duration: (status.duration || 0) * 1000,
          });
        }
      });

      this.updateState({
        currentTrack: track,
        isLoading: false,
        position: 0,
      });

      this.startPositionUpdates();
    } catch (error) {
      console.error("Error loading track:", error);
      this.updateState({ isLoading: false });
    }
  }

  async play() {
    try {
      if (this.player) {
        this.player.play();
        this.startPositionUpdates();
      }
    } catch (error) {
      console.error("Error playing:", error);
    }
  }

  async pause() {
    try {
      if (this.player) {
        this.player.pause();
        this.stopPositionUpdates();
      }
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }

  async stop() {
    try {
      if (this.player) {
        this.player.pause();
        await this.player.seekTo(0);
      }
      this.stopPositionUpdates();
      this.updateState({ position: 0, isPlaying: false });
    } catch (error) {
      console.error("Error stopping:", error);
    }
  }

  async seek(positionMillis: number) {
    try {
      if (this.player) {
        const positionSeconds = positionMillis / 1000;
        await this.player.seekTo(positionSeconds);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.player) {
        this.player.volume = volume;
        this.updateState({ volume });
      }
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }

  getState(): AudioState {
    return { ...this.state };
  }

  // Clean up resources when service is no longer needed
  dispose() {
    this.stopPositionUpdates();
    if (this.player) {
      this.player.remove();
      this.player = null;
    }
  }
}

export const audioService = new AudioService();
