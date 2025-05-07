# Musica - Modern Music Player

A modern music player application built with React, featuring YouTube integration, genre-based browsing, and playlist management.

## Features

- 🎵 Play music from YouTube
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design
- 🎧 Genre-based music browsing
- 📋 Playlist management
- 💾 Download tracks for offline listening
- 🌙 Dark mode support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/musica.git
cd musica
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Mobile

### Android

1. Install Android Studio and Android SDK
2. Add Android platform:

```bash
npm run cap:add:android
```

3. Sync the build:

```bash
npm run cap:sync
```

4. Open in Android Studio:

```bash
npm run cap:open:android
```

### iOS (requires macOS)

1. Install Xcode
2. Add iOS platform:

```bash
npm run cap:add:ios
```

3. Sync the build:

```bash
npm run cap:sync
```

4. Open in Xcode:

```bash
npm run cap:open:ios
```

## Technologies Used

- React
- Material-UI
- Capacitor
- YouTube API
- Howler.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
