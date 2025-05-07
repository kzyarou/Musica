import axios from "axios";

const YOUTUBE_API_KEY = "AIzaSyD1RQUWi5CM_ibm3c4kODQRxGmJfJVHe_Q"; // YouTube API key
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";

// Quality options for YouTube videos
export const QUALITY_OPTIONS = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "hd1080" },
  { label: "720p", value: "hd720" },
  { label: "480p", value: "large" },
  { label: "360p", value: "medium" },
  { label: "240p", value: "small" },
];

export const searchYouTubeVideos = async (query) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: "snippet",
        maxResults: 10,
        q: query,
        type: "video",
        key: YOUTUBE_API_KEY,
        videoEmbeddable: true,
        videoCategoryId: "10", // Music category
      },
    });

    return response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      cover: item.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      duration: 0, // Duration not available in search results
      quality: "auto",
    }));
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
};

export const getYouTubeVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: "contentDetails,snippet,statistics",
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items.length === 0) {
      return null;
    }

    const video = response.data.items[0];
    return {
      id: video.id,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      cover: video.snippet.thumbnails.high.url,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      duration: parseDuration(video.contentDetails.duration),
      quality: "auto",
      views: parseInt(video.statistics.viewCount),
      likes: parseInt(video.statistics.likeCount),
      publishedAt: video.snippet.publishedAt,
    };
  } catch (error) {
    console.error("Error fetching YouTube video details:", error);
    return null;
  }
};

// Helper function to parse YouTube duration format (PT1H2M3S)
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] && parseInt(match[1])) || 0;
  const minutes = (match[2] && parseInt(match[2])) || 0;
  const seconds = (match[3] && parseInt(match[3])) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// Save video to a playlist
export const saveToPlaylist = (video, playlistName) => {
  try {
    const playlists = JSON.parse(localStorage.getItem("playlists") || "{}");
    if (!playlists[playlistName]) {
      playlists[playlistName] = [];
    }

    // Check if video already exists in playlist
    if (!playlists[playlistName].some((v) => v.id === video.id)) {
      playlists[playlistName].push(video);
      localStorage.setItem("playlists", JSON.stringify(playlists));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving to playlist:", error);
    return false;
  }
};

// Get all playlists
export const getPlaylists = () => {
  try {
    return JSON.parse(localStorage.getItem("playlists") || "{}");
  } catch (error) {
    console.error("Error getting playlists:", error);
    return {};
  }
};

// Create a new playlist
export const createPlaylist = (name) => {
  try {
    const playlists = JSON.parse(localStorage.getItem("playlists") || "{}");
    if (!playlists[name]) {
      playlists[name] = [];
      localStorage.setItem("playlists", JSON.stringify(playlists));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return false;
  }
};
