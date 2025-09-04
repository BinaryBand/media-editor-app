import { PermissionsAndroid, Platform } from "react-native";
import TrackPlayer, { Track as RNTPTrack } from "react-native-track-player";
import { Track } from "./AudioService";

export interface MetadataResult {
  title?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  diskNumber?: number;
}

class MetadataService {
  private isTrackPlayerInitialized = false;

  /**
   * Initialize TrackPlayer for metadata extraction
   */
  private async initializeTrackPlayer() {
    if (this.isTrackPlayerInitialized) return;

    try {
      await TrackPlayer.setupPlayer({});
      this.isTrackPlayerInitialized = true;
    } catch (error) {
      console.warn("Failed to initialize TrackPlayer:", error);
    }
  }

  /**
   * Request storage permissions for Android
   */
  private async requestStoragePermissions(): Promise<boolean> {
    if (Platform.OS !== "android") return true;

    try {
      const permissions = [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];

      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
      }

      const results = await PermissionsAndroid.requestMultiple(permissions);
      return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
    } catch (error) {
      console.warn("Error requesting storage permissions:", error);
      return false;
    }
  }

  /**
   * Extract metadata from an audio file using react-native-track-player
   */
  async extractMetadata(uri: string, filename: string): Promise<MetadataResult> {
    await this.initializeTrackPlayer();

    try {
      // Create a temporary track to extract metadata
      const tempTrack: RNTPTrack = {
        id: "temp-metadata-extract",
        url: uri,
        title: filename,
      };

      // Add track temporarily to extract metadata
      await TrackPlayer.add(tempTrack);

      // Get the track with metadata
      const tracks = await TrackPlayer.getQueue();
      const trackWithMetadata = tracks.find((t) => t.id === "temp-metadata-extract");

      // Clean up
      await TrackPlayer.reset();

      if (trackWithMetadata) {
        return {
          title: trackWithMetadata.title,
          artist: trackWithMetadata.artist,
          album: trackWithMetadata.album,
          albumArtist: trackWithMetadata.artist, // Use artist as fallback
          genre: trackWithMetadata.genre,
          year: trackWithMetadata.date ? this.extractYearFromDate(trackWithMetadata.date) : undefined,
          trackNumber: undefined, // Not directly available in RNTP
          diskNumber: undefined, // Not directly available in RNTP
        };
      }
    } catch (error) {
      console.warn("Error extracting metadata with TrackPlayer:", error);
    }

    // Fallback to filename parsing
    return this.parseMetadataFromFilename(filename);
  }

  /**
   * Extract year from various date formats
   */
  private extractYearFromDate(date: string | number): number | undefined {
    if (typeof date === "number") return date;
    if (typeof date === "string") {
      const yearMatch = date.match(/(\d{4})/);
      if (yearMatch) return parseInt(yearMatch[1], 10);
    }
    return undefined;
  }

  /**
   * Fallback metadata extraction from filename
   */
  private parseMetadataFromFilename(filename: string): MetadataResult {
    // Remove file extension
    let cleanName = filename.replace(/\.[^/.]+$/, "");

    let title = cleanName;
    let artist: string | undefined = undefined;

    // Try to extract meaningful title from common naming patterns
    // Pattern: "Artist - Title"
    if (cleanName.includes(" - ")) {
      const parts = cleanName.split(" - ");
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(" - "); // Take everything after first " - "
      }
    }

    // Pattern: "01 Title" or "01. Title"
    title = title.replace(/^\d+\.?\s*/, "");

    // Clean up underscores and multiple spaces
    title = title.replace(/_/g, " ").replace(/\s+/g, " ").trim();

    return {
      title: title || cleanName,
      artist: artist,
      album: undefined,
      albumArtist: undefined,
      genre: undefined,
      year: undefined,
      trackNumber: undefined,
      diskNumber: undefined,
    };
  }

  /**
   * Create a Track object with extracted metadata
   */
  async createTrackWithMetadata(id: string, fileName: string, uri: string, duration: number): Promise<Track> {
    // Extract metadata using TrackPlayer
    const metadata = await this.extractMetadata(uri, fileName);

    return {
      id,
      fileName,
      uri,
      duration: duration * 1000, // Convert to milliseconds
      title: metadata.title || this.parseMetadataFromFilename(fileName).title || fileName.replace(/\.[^/.]+$/, ""),
      artist: metadata.artist || "Unknown Artist",
      album: metadata.album || "Unknown Album",
      albumArtist: metadata.albumArtist,
      genre: metadata.genre,
      year: metadata.year,
      trackNumber: metadata.trackNumber,
      diskNumber: metadata.diskNumber,
    };
  }

  /**
   * Format a track's metadata for display
   */
  formatTrackInfo(track: Track): string {
    const parts: string[] = [];

    if (track.artist && track.artist !== "Unknown Artist") {
      parts.push(track.artist);
    }

    if (track.album && track.album !== "Unknown Album") {
      parts.push(track.album);
    }

    if (track.year) {
      parts.push(track.year.toString());
    }

    if (track.genre) {
      parts.push(track.genre);
    }

    return parts.length > 0 ? parts.join(" • ") : "No metadata available";
  }

  /**
   * Get detailed track information as a formatted string
   */
  getDetailedTrackInfo(track: Track): { primary: string; secondary: string } {
    const primary = track.title;
    const secondary = this.formatTrackInfo(track);

    return { primary, secondary };
  }
}

export const metadataService = new MetadataService();
