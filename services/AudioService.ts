import { Audio, AVPlaybackSource } from "expo-av";

export interface Track {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  uri: string;
  fileName: string;
  album?: string;
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
  private sound: Audio.Sound | null = null;
  private listeners: ((state: AudioState) => void)[] = [];
  private state: AudioState = {
    isPlaying: false,
    isLoading: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 1.0,
  };

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
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

  async loadTrack(track: Track) {
    try {
      this.updateState({ isLoading: true });

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.sound = new Audio.Sound();
      const source: AVPlaybackSource = { uri: track.uri };

      await this.sound.loadAsync(source);

      this.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.updateState({
            isPlaying: status.isPlaying || false,
            position: status.positionMillis || 0,
            duration: status.durationMillis || 0,
          });
        }
      });

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
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing:", error);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
      }
      this.updateState({ position: 0 });
    } catch (error) {
      console.error("Error stopping:", error);
    }
  }

  async seek(positionMillis: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(volume);
        this.updateState({ volume });
      }
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }

  getState(): AudioState {
    return { ...this.state };
  }
}

export const audioService = new AudioService();
