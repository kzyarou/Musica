import axios from "axios";

const JAMENDO_API_URL = "https://api.jamendo.com/v3.0";
const CLIENT_ID = "2d041d3c"; // This is a demo client ID from Jamendo

// List of popular genres with their display names, tags, and trending tracks
export const GENRES = [
  {
    id: "rock",
    name: "Rock",
    tag: "rock",
    trendingTrack: {
      id: "rock-trending",
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration: 356,
    },
  },
  {
    id: "electronic",
    name: "Electronic",
    tag: "electronic",
    trendingTrack: {
      id: "electronic-trending",
      title: "Strobe",
      artist: "Deadmau5",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration: 428,
    },
  },
  {
    id: "jazz",
    name: "Jazz",
    tag: "jazz",
    trendingTrack: {
      id: "jazz-trending",
      title: "Take Five",
      artist: "Dave Brubeck",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      duration: 324,
    },
  },
  {
    id: "pop",
    name: "Pop",
    tag: "pop",
    trendingTrack: {
      id: "pop-trending",
      title: "Shape of You",
      artist: "Ed Sheeran",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      duration: 235,
    },
  },
  {
    id: "classical",
    name: "Classical",
    tag: "classical",
    trendingTrack: {
      id: "classical-trending",
      title: "Moonlight Sonata",
      artist: "Ludwig van Beethoven",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      duration: 420,
    },
  },
  {
    id: "hiphop",
    name: "Hip Hop",
    tag: "hip_hop",
    trendingTrack: {
      id: "hiphop-trending",
      title: "Lose Yourself",
      artist: "Eminem",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      duration: 326,
    },
  },
  {
    id: "ambient",
    name: "Ambient",
    tag: "ambient",
    trendingTrack: {
      id: "ambient-trending",
      title: "Weightless",
      artist: "Marconi Union",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      duration: 480,
    },
  },
  {
    id: "folk",
    name: "Folk",
    tag: "folk",
    trendingTrack: {
      id: "folk-trending",
      title: "The Sound of Silence",
      artist: "Simon & Garfunkel",
      cover: "https://i.scdn.co/image/ab67616d0000b273e2e352d5f2e8b1c3c5c0b1c0",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      duration: 227,
    },
  },
];

export const searchTracks = async (query) => {
  try {
    const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
      params: {
        client_id: CLIENT_ID,
        format: "json",
        limit: 20,
        search: query,
        include: "musicinfo",
      },
    });

    return response.data.results.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      cover: track.image,
      url: track.audio,
      duration: track.duration,
    }));
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
};

export const getFeaturedTracks = async () => {
  try {
    const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
      params: {
        client_id: CLIENT_ID,
        format: "json",
        limit: 10,
        featured: true,
        include: "musicinfo",
      },
    });

    return response.data.results.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      cover: track.image,
      url: track.audio,
      duration: track.duration,
    }));
  } catch (error) {
    console.error("Error fetching featured tracks:", error);
    return [];
  }
};

export const getTracksByGenre = async (genre) => {
  try {
    const response = await axios.get(`${JAMENDO_API_URL}/tracks/`, {
      params: {
        client_id: CLIENT_ID,
        format: "json",
        limit: 20,
        tags: genre,
        include: "musicinfo",
        boost: "popularity",
      },
    });

    return response.data.results.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      cover: track.image,
      url: track.audio,
      duration: track.duration,
    }));
  } catch (error) {
    console.error(`Error fetching ${genre} tracks:`, error);
    return [];
  }
};
