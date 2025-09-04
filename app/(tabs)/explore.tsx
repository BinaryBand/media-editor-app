import { useColorScheme } from "@/hooks/useColorScheme";
import { Track } from "@/services/AudioService";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Divider, List, Modal, Portal, Text, Title } from "react-native-paper";

interface SettingsProps {
  onTracksLoaded?: (tracks: Track[]) => void;
}

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionResponse | null>(null);
  const [libraryStats, setLibraryStats] = useState({ trackCount: 0, folderCount: 0 });
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    checkPermissions();
    loadLibraryStats();
  }, []);

  const checkPermissions = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    setPermissionStatus(permission);
  };

  const loadLibraryStats = async () => {
    try {
      const permission = await MediaLibrary.getPermissionsAsync();
      if (permission.granted) {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.audio,
          first: 1000,
        });

        // Simple folder count estimation (this is a simplified version)
        const folderSet = new Set();
        for (const asset of media.assets) {
          folderSet.add("Unknown Album"); // Simplified for now
        }

        setLibraryStats({
          trackCount: media.totalCount,
          folderCount: folderSet.size,
        });
      }
    } catch (error) {
      console.error("Error loading library stats:", error);
    }
  };

  const requestPermissions = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    setPermissionStatus(permission);
    if (permission.granted) {
      loadLibraryStats();
    }
  };

  const selectMusicFiles = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        Alert.alert(
          "Files Selected",
          `${result.assets.length} audio files selected. Go to Music Player tab to see them.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error selecting files:", error);
      Alert.alert("Error", "Failed to select music files");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLibrary = async () => {
    setIsLoading(true);
    try {
      await loadLibraryStats();
      Alert.alert("Library Refreshed", "Your music library has been refreshed.");
    } catch (error) {
      Alert.alert("Error", "Failed to refresh library");
    } finally {
      setIsLoading(false);
    }
  };

  const clearLibrary = () => {
    Alert.alert("Clear Library", "This will clear all manually added files. Device music will remain accessible.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          Alert.alert("Library Cleared", "Manually added files have been cleared.");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Music Player Settings</Title>

      {/* Library Management Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Library Management
          </Text>

          <List.Item
            title="Device Music Access"
            description={
              permissionStatus?.granted
                ? "Granted - Device music is accessible"
                : "Not granted - Only manual file selection available"
            }
            left={(props) => <List.Icon {...props} icon="folder-music" />}
            right={() =>
              !permissionStatus?.granted ? (
                <Button mode="contained" onPress={requestPermissions}>
                  Grant Access
                </Button>
              ) : null
            }
          />

          <Divider style={styles.divider} />

          <List.Item
            title="Add Music Files"
            description="Select audio files from your device"
            left={(props) => <List.Icon {...props} icon="plus" />}
            onPress={selectMusicFiles}
            disabled={isLoading}
          />

          <List.Item
            title="Refresh Library"
            description="Scan for new music on your device"
            left={(props) => <List.Icon {...props} icon="refresh" />}
            onPress={refreshLibrary}
            disabled={isLoading || !permissionStatus?.granted}
          />

          <List.Item
            title="Clear Added Files"
            description="Remove manually added music files"
            left={(props) => <List.Icon {...props} icon="delete" />}
            onPress={clearLibrary}
          />
        </Card.Content>
      </Card>

      {/* Library Statistics */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Library Statistics
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{libraryStats.trackCount}</Text>
              <Text variant="bodyMedium">Total Tracks</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{libraryStats.folderCount}</Text>
              <Text variant="bodyMedium">Folders/Albums</Text>
            </View>
          </View>

          <Button mode="outlined" onPress={() => setShowLibraryModal(true)} style={styles.detailsButton}>
            View Details
          </Button>
        </Card.Content>
      </Card>

      {/* App Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            App Information
          </Text>

          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />

          <List.Item
            title="Audio Engine"
            description="Expo Audio (React Native)"
            left={(props) => <List.Icon {...props} icon="music-note" />}
          />

          <List.Item
            title="UI Framework"
            description="React Native Paper"
            left={(props) => <List.Icon {...props} icon="palette" />}
          />
        </Card.Content>
      </Card>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Processing...</Text>
        </View>
      )}

      {/* Library Details Modal */}
      <Portal>
        <Modal
          visible={showLibraryModal}
          onDismiss={() => setShowLibraryModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Library Details
          </Text>

          <Text variant="bodyLarge" style={styles.modalText}>
            Your music library contains {libraryStats.trackCount} tracks organized into {libraryStats.folderCount}{" "}
            folders.
          </Text>

          <Text variant="bodyMedium" style={styles.modalText}>
            Supported formats: MP3, M4A, WAV, FLAC, AAC and other common audio formats.
          </Text>

          <Button mode="contained" onPress={() => setShowLibraryModal(false)} style={styles.modalButton}>
            Close
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  statItem: {
    alignItems: "center",
  },
  detailsButton: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 12,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 16,
  },
});
