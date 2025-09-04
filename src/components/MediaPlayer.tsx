import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

import { useColorScheme } from "../hooks/useColorScheme";
import { audioService, AudioState, Track } from "../services/AudioService";

interface MediaPlayerProps {
  track?: Track;
}

export default function MediaPlayer({ track }: MediaPlayerProps) {
  const [audioState, setAudioState] = useState<AudioState>(audioService.getState());
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setAudioState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (track && track.id !== audioState.currentTrack?.id) {
      audioService.loadTrack(track);
    }
  }, [track]);

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      audioService.pause();
    } else {
      audioService.play();
    }
  };

  const handleSeek = (value: number) => {
    const position = (value / 100) * audioState.duration;
    audioService.seek(position);
  };

  const handleVolumeChange = (value: number) => {
    audioService.setVolume(value / 100);
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const seekPercentage = audioState.duration > 0 ? (audioState.position / audioState.duration) * 100 : 0;

  const isDark = colorScheme === "dark";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const backgroundColor = isDark ? "#1A1A1A" : "#F5F5F5";
  const cardColor = isDark ? "#2A2A2A" : "#FFFFFF";

  if (!audioState.currentTrack) {
    return (
      <View style={[styles.container, { backgroundColor: cardColor }]}>
        <Text style={[styles.noTrackText, { color: textColor }]}>No track selected</Text>
      </View>
    );
  }

  const currentTrack = audioState.currentTrack;

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: textColor }]} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={[styles.trackArtist, { color: textColor + "80" }]} numberOfLines={1}>
          {currentTrack.artist || "Unknown Artist"}
        </Text>

        {/* Additional metadata */}
        <View style={styles.metadataContainer}>
          {currentTrack.album && currentTrack.album !== "Unknown Album" && (
            <Text style={[styles.metadataText, { color: textColor + "60" }]} numberOfLines={1}>
              {currentTrack.album}
              {currentTrack.year && ` (${currentTrack.year})`}
            </Text>
          )}
          {currentTrack.genre && (
            <Text style={[styles.metadataText, { color: textColor + "60" }]} numberOfLines={1}>
              {currentTrack.genre}
            </Text>
          )}
          {currentTrack.trackNumber && (
            <Text style={[styles.metadataText, { color: textColor + "60" }]}>
              Track {currentTrack.trackNumber}
              {currentTrack.diskNumber && ` • Disc ${currentTrack.diskNumber}`}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={[styles.timeText, { color: textColor }]}>{formatTime(audioState.position)}</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.progressSlider}
            value={seekPercentage}
            onValueChange={handleSeek}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor={isDark ? "#BB86FC" : "#6200EE"}
            maximumTrackTintColor={textColor + "30"}
            thumbTintColor={isDark ? "#BB86FC" : "#6200EE"}
          />
        </View>
        <Text style={[styles.timeText, { color: textColor }]}>{formatTime(audioState.duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => audioService.stop()}>
          <Icon name="stop" size={24} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: isDark ? "#BB86FC" : "#6200EE" }]}
          onPress={handlePlayPause}
          disabled={audioState.isLoading}
        >
          {audioState.isLoading ? (
            <Icon name="hourglass" size={32} color="#FFFFFF" />
          ) : (
            <Icon name={audioState.isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Icon name="shuffle" size={24} color={textColor + "60"} />
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <Icon name="volume-low" size={20} color={textColor} />
        <Slider
          style={styles.volumeSlider}
          value={audioState.volume * 100}
          onValueChange={handleVolumeChange}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor={isDark ? "#BB86FC" : "#6200EE"}
          maximumTrackTintColor={textColor + "30"}
          thumbTintColor={isDark ? "#BB86FC" : "#6200EE"}
        />
        <Icon name="volume-high" size={20} color={textColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  noTrackText: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  trackArtist: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  metadataContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timeText: {
    fontSize: 12,
    minWidth: 35,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  progressSlider: {
    height: 40,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  controlButton: {
    padding: 15,
    marginHorizontal: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  volumeSlider: {
    flex: 1,
    height: 30,
    marginHorizontal: 10,
  },
});
