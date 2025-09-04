import MediaPlayer from "@/components/MediaPlayer";
import MusicLibrary from "@/components/MusicLibrary";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Track } from "@/services/AudioService";
import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const colorScheme = useColorScheme();

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
  };

  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#F5F5F5";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={backgroundColor} />
      <SafeAreaView style={styles.safeArea}>
        {/* Music Library - takes up most space */}
        <View style={styles.libraryContainer}>
          <MusicLibrary onTrackSelect={handleTrackSelect} selectedTrackId={selectedTrack?.id} />
        </View>

        {/* Media Player - sticky at bottom */}
        <View style={styles.playerContainer}>
          <MediaPlayer track={selectedTrack} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  libraryContainer: {
    flex: 1,
  },
  playerContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
