# Music Player React Application

A modern music player application built with React and Material-UI, featuring YouTube integration and genre-based browsing.

## Features

- Browse music by genre
- Play YouTube videos directly in the app
- Featured tracks section
- Recently played tracks
- Trending YouTube videos
- Modern and responsive UI
- Automatic deployments to Vercel

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- YouTube API key (for video search functionality)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/kzyarou/Musica.git
cd Musica
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your YouTube API key:

```
REACT_APP_YOUTUBE_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm start
```

## Project Structure

```
src/
  ├── components/     # React components
  ├── context/       # React context providers
  ├── services/      # API services
  ├── styles/        # Global styles
  └── App.js         # Main application component
```

## Technologies Used

- React
- Material-UI
- YouTube IFrame API
- Howler.js for audio playback
- Vercel for deployment

## Deployment

This project is automatically deployed to Vercel whenever changes are pushed to the main branch. The deployment process includes:

1. Building the React application
2. Running tests (if configured)
3. Deploying to Vercel's global CDN
4. Providing a unique URL for each deployment

You can view the latest deployment at: [https://musica-kzyarou.vercel.app](https://musica-kzyarou.vercel.app)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
