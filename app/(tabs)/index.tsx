import MediaPlayer from "@/components/MediaPlayer";
import MusicLibrary from "@/components/MusicLibrary";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Track } from "@/services/AudioService";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
  const colorScheme = useColorScheme();

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
  };

  const isDark = colorScheme === "dark";
  const backgroundColor = isDark ? "#000000" : "#F5F5F5";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Media Player */}
        <MediaPlayer track={selectedTrack} />

        {/* Music Library */}
        <MusicLibrary onTrackSelect={handleTrackSelect} selectedTrackId={selectedTrack?.id} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
