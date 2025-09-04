# 🎵 Media Editor App

A professional React Native music player app with advanced folder browsing, device music library integration, and modern Material Design UI.

## 🌟 Features

### 🎵 **Music Player**

- **Professional Audio Playback**: Full-featured player with play/pause/stop/seek controls
- **Progress Tracking**: Real-time playback position with seek capability
- **Volume Control**: Integrated volume slider
- **Track Information**: Display title, artist, duration, and album details
- **Background Audio**: Continues playing when app is backgrounded

### 📁 **Folder Browsing & Organization**

- **Device Music Library**: Automatic scanning of device music with permission handling
- **Folder-Based Organization**: Browse music organized by albums/folders
- **Smart Search**: Real-time search across track titles and artists
- **Filter by Folder**: Combine folder selection with search for precise discovery
- **Batch Operations**: Load up to 1000+ tracks efficiently

### ⚙️ **Settings & Management**

- **Library Management**: Centralized control for all music operations
- **File Selection**: Manual file picking with multiple selection support
- **Permission Handling**: Smooth device access with fallback options
- **Library Statistics**: Track and folder counts with detailed view
- **Refresh Capability**: Re-scan device for new music

### 🎨 **Modern UI/UX**

- **Material Design 3**: Professional interface using React Native Paper
- **Dark/Light Themes**: Automatic theme switching based on system preference
- **Responsive Design**: Adapts beautifully to different screen sizes
- **Loading States**: Professional loading indicators and progress feedback
- **Clean Architecture**: Separated music consumption from management tasks

## 🛠️ **Technology Stack**

- **Framework**: React Native with Expo
- **Audio Engine**: Expo AV (with migration path to Expo Audio)
- **UI Library**: React Native Paper (Material Design 3)
- **File System**: Expo Document Picker + Media Library
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: React hooks with custom audio service
- **TypeScript**: Full type safety throughout the application

## 📱 **Screenshots**

_Music Player Tab_

- Clean interface focused on music consumption
- Search and folder filtering
- Professional track listing with play indicators

_Settings Tab_

- Comprehensive library management
- Permission handling
- Statistics and app information

## 🚀 **Getting Started**

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS)
- Expo Go app on your device (for easy testing)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/BinaryBand/media-editor-app.git
cd media-editor-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm start
```

4. **Run on your device**
   - Scan the QR code with Expo Go app, or
   - Press `a` for Android / `i` for iOS in the terminal

### 🎵 **Usage**

#### First Time Setup

1. **Launch the app** and navigate to the Settings tab
2. **Grant permissions** to access your device's music library
3. **Browse your music** in the Music Player tab, organized by folders
4. **Search and play** your favorite tracks!

#### Adding Music Manually

1. Go to **Settings → Add Music Files**
2. Select multiple audio files from your device
3. Return to **Music Player tab** to see and play your selections

#### Folder Browsing

1. Tap **"Browse Folders"** in the Music Player tab
2. Select any album/folder to filter tracks
3. Use **search** in combination with folder selection for precise discovery

## 🏗️ **Project Structure**

```
media-editor-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx      # Music Player tab
│   │   └── explore.tsx    # Settings tab
│   └── _layout.tsx        # Root layout with providers
├── components/
│   ├── MediaPlayer.tsx    # Audio player controls
│   └── MusicLibrary.tsx   # Music library interface
├── services/
│   └── AudioService.ts    # Audio playback management
└── assets/                # Images and fonts
```

## 🎯 **Key Components**

### **AudioService**

- Centralized audio playback management
- Real-time state updates
- Background audio support
- Volume and position control

### **MediaPlayer**

- Professional playback controls
- Progress bar with seek capability
- Volume control
- Track information display

### **MusicLibrary**

- Device music scanning
- Folder organization
- Search and filter functionality
- Permission handling

### **Settings**

- Library management interface
- Statistics and information
- File selection capabilities

## 🔧 **Development**

### **Available Scripts**

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

### **Building for Production**

For production builds, consider using:

- **EAS Build** for managed workflow
- **Expo Development Build** for custom native code

## 📋 **Supported Audio Formats**

- **MP3** - Most common format
- **M4A** - Apple/iTunes format
- **WAV** - Uncompressed audio
- **FLAC** - Lossless compression
- **AAC** - Advanced Audio Codec
- **OGG** - Open source format

## ⚠️ **Known Limitations**

- **Expo Go Limitations**: Full media library access requires development build
- **Platform Differences**: Some features may vary between iOS/Android
- **Performance**: Large libraries (1000+ tracks) may have longer load times

## 🛣️ **Roadmap**

- [ ] **Playlist Management**: Create and manage custom playlists
- [ ] **Equalizer**: Audio enhancement controls
- [ ] **Lyrics Display**: Show synchronized lyrics
- [ ] **Cloud Integration**: Support for streaming services
- [ ] **Offline Mode**: Enhanced offline playback features
- [ ] **Social Features**: Share tracks and playlists

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Expo Team** for the excellent development platform
- **React Native Paper** for beautiful Material Design components
- **React Native Community** for the slider component

## 📞 **Support**

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/BinaryBand/media-editor-app/issues) section
2. Create a new issue with detailed information
3. Join the discussion in existing threads

---

**Built with ❤️ using React Native and Expo**
