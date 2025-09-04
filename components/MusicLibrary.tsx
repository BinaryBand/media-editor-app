import { useColorScheme } from "@/hooks/useColorScheme";
import { Track } from "@/services/AudioService";
import { metadataService } from "@/services/MetadataService";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, List, Modal, Portal, Searchbar, Text } from "react-native-paper";

interface MusicLibraryProps {
  onTrackSelect: (track: Track) => void;
  selectedTrackId?: string;
}

interface Folder {
  id: string;
  name: string;
  trackCount: number;
}

export default function MusicLibrary({ onTrackSelect, selectedTrackId }: MusicLibraryProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionResponse | null>(null);
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [tracks, selectedFolder, searchQuery]);

  const checkPermissions = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    setPermissionStatus(permission);
    if (permission.granted) {
      loadDeviceMusic();
    }
  };

  const requestPermissions = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    setPermissionStatus(permission);
    if (permission.granted) {
      loadDeviceMusic();
    }
  };

  const loadDeviceMusic = async () => {
    try {
      setIsLoading(true);
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000, // Load first 1000 songs
      });

      const newTracks: Track[] = await Promise.all(
        media.assets.map(async (asset) => {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          const uri = assetInfo.localUri || assetInfo.uri;

          // Use the metadata service to extract metadata and create track
          const trackWithMetadata = await metadataService.createTrackWithMetadata(
            asset.id,
            asset.filename,
            uri,
            asset.duration,
            asset // Pass the asset for metadata extraction
          );

          return trackWithMetadata;
        })
      );

      setTracks(newTracks);
      organizeFolders(newTracks);
    } catch (error) {
      console.error("Error loading device music:", error);
      Alert.alert("Error", "Failed to load music from device");
    } finally {
      setIsLoading(false);
    }
  };

  const organizeFolders = (trackList: Track[]) => {
    const folderMap = new Map<string, number>();

    trackList.forEach((track) => {
      const folder = track.album || "Unknown Album";
      folderMap.set(folder, (folderMap.get(folder) || 0) + 1);
    });

    const folderList: Folder[] = Array.from(folderMap.entries()).map(([name, count]) => ({
      id: name,
      name,
      trackCount: count,
    }));

    setFolders(folderList);
  };

  const filterTracks = () => {
    let filtered = tracks;

    if (selectedFolder && selectedFolder !== "all") {
      filtered = tracks.filter((track) => track.album === selectedFolder);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTracks(filtered);
  };

  const clearLibrary = () => {
    Alert.alert("Clear Library", "Are you sure you want to clear all tracks?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setTracks([]);
          setFolders([]);
          setSelectedFolder(null);
        },
      },
    ]);
  };

  const renderTrack = ({ item }: { item: Track }) => {
    const isSelected = item.id === selectedTrackId;
    const { secondary } = metadataService.getDetailedTrackInfo(item);

    return (
      <List.Item
        title={item.title}
        description={secondary}
        left={(props) => <List.Icon {...props} icon="music-note" />}
        right={(props) => (isSelected ? <List.Icon {...props} icon="play" /> : null)}
        onPress={() => onTrackSelect(item)}
        style={isSelected ? { backgroundColor: isDark ? "rgba(187, 134, 252, 0.2)" : "rgba(98, 0, 238, 0.1)" } : {}}
      />
    );
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <List.Item
      title={item.name}
      description={`${item.trackCount} tracks`}
      left={(props) => <List.Icon {...props} icon="folder-music" />}
      onPress={() => {
        setSelectedFolder(item.id);
        setShowFolderModal(false);
      }}
    />
  );

  if (!permissionStatus) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permissionStatus.granted) {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall" style={styles.permissionTitle}>
          Music Library Access
        </Text>
        <Text variant="bodyLarge" style={styles.permissionText}>
          Allow access to your music library to browse and play songs by folders
        </Text>
        <Button mode="contained" onPress={requestPermissions} style={styles.permissionButton}>
          Grant Permission
        </Button>
        <Text variant="bodyMedium" style={styles.settingsText}>
          Or go to Settings tab to manually add music files
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search music..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        <Chip selected={selectedFolder === "all" || !selectedFolder} onPress={() => setSelectedFolder("all")}>
          All ({tracks.length})
        </Chip>
        <Button mode="outlined" icon="folder-open" onPress={() => setShowFolderModal(true)}>
          Browse Folders
        </Button>
      </View>

      {selectedFolder && selectedFolder !== "all" && (
        <Card style={styles.folderCard}>
          <Card.Content>
            <Text variant="titleMedium">{selectedFolder}</Text>
            <Text variant="bodyMedium">{filteredTracks.length} tracks</Text>
          </Card.Content>
        </Card>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Loading music and extracting metadata...</Text>
        </View>
      ) : filteredTracks.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="headlineSmall">No music found</Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {tracks.length === 0 ? "Your music library will appear here" : "No tracks match your search"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          style={styles.trackList}
        />
      )}

      <Portal>
        <Modal
          visible={showFolderModal}
          onDismiss={() => setShowFolderModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Browse by Folder
          </Text>
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            renderItem={renderFolder}
            style={styles.folderList}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  searchbar: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  folderCard: {
    marginBottom: 10,
  },
  trackList: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 16,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  folderList: {
    flexGrow: 0,
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: 10,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    marginVertical: 5,
    minWidth: 200,
  },
  settingsText: {
    textAlign: "center",
    marginTop: 10,
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    opacity: 0.7,
  },
});
