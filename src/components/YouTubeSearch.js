import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  InputAdornment,
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Snackbar,
  Alert,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  PlayArrow,
  YouTube,
  QueueMusic,
  PlaylistAdd,
  Settings,
} from "@mui/icons-material";
import {
  searchYouTubeVideos,
  getYouTubeVideoDetails,
  QUALITY_OPTIONS,
  saveToPlaylist,
  getPlaylists,
  createPlaylist,
} from "../services/youtubeApi";
import { usePlayer } from "../context/PlayerContext";

function YouTubeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [playlists, setPlaylists] = useState({});
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [error, setError] = useState(null);
  const { setTrack, queue, setQueue } = usePlayer();

  useEffect(() => {
    // Load playlists on component mount
    try {
      const loadedPlaylists = getPlaylists();
      setPlaylists(loadedPlaylists);
    } catch (error) {
      console.error("Error loading playlists:", error);
      setError("Failed to load playlists");
    }
  }, []);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setError(null);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchYouTubeVideos(query);
      setSearchResults(results);
      if (results.length === 0) {
        setError("No results found");
      }
    } catch (error) {
      console.error("Error searching YouTube:", error);
      setError("Failed to search YouTube. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = async (video) => {
    if (!video || !video.id) {
      console.error("Invalid video:", video);
      return;
    }

    setLoading(true);
    try {
      const details = await getYouTubeVideoDetails(video.id);
      if (details) {
        setTrack({ ...details, quality: selectedQuality });
        // Update recently played
        const recent = JSON.parse(
          localStorage.getItem("recentlyPlayed") || "[]"
        );
        const updatedRecent = [
          { ...details, quality: selectedQuality },
          ...recent.filter((v) => v.id !== video.id),
        ].slice(0, 5);
        localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent));
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
      setError("Failed to load video details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = async (video) => {
    if (!video || !video.id) {
      console.error("Invalid video:", video);
      return;
    }

    setLoading(true);
    try {
      const details = await getYouTubeVideoDetails(video.id);
      if (details) {
        const newQueue = [...queue, { ...details, quality: selectedQuality }];
        setQueue(newQueue);
        setSnackbar({
          open: true,
          message: "Added to queue",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
      setError("Failed to add video to queue");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPlaylist = async (video, playlistName) => {
    if (!video || !video.id || !playlistName) {
      console.error("Invalid video or playlist:", { video, playlistName });
      return;
    }

    setLoading(true);
    try {
      const details = await getYouTubeVideoDetails(video.id);
      if (details) {
        const success = saveToPlaylist(
          { ...details, quality: selectedQuality },
          playlistName
        );
        if (success) {
          setSnackbar({
            open: true,
            message: "Added to playlist",
            severity: "success",
          });
          setPlaylists(getPlaylists());
          setShowPlaylistDialog(false);
        } else {
          setSnackbar({
            open: true,
            message: "Video already in playlist",
            severity: "warning",
          });
        }
      }
    } catch (error) {
      console.error("Error saving to playlist:", error);
      setError("Failed to save to playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }

    try {
      const success = createPlaylist(newPlaylistName.trim());
      if (success) {
        setPlaylists(getPlaylists());
        setNewPlaylistName("");
        setSnackbar({
          open: true,
          message: "Playlist created",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Playlist already exists",
          severity: "warning",
        });
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      setError("Failed to create playlist");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <YouTube sx={{ fontSize: 40, color: "red", mr: 2 }} />
        <Typography variant="h5">YouTube Search</Typography>
        <Box sx={{ ml: "auto" }}>
          <Tooltip title="Quality Settings">
            <IconButton onClick={() => setShowQualityDialog(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for songs on YouTube"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {searchResults.length > 0 && (
        <Grid container spacing={2}>
          {searchResults.map((video) => (
            <Grid item xs={12} key={video.id}>
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 120, height: 90 }}
                  image={video.cover}
                  alt={video.title}
                  onClick={() => handleVideoSelect(video)}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/120x90?text=No+Image";
                  }}
                />
                <CardContent
                  sx={{ flex: 1 }}
                  onClick={() => handleVideoSelect(video)}
                >
                  <Typography variant="subtitle1" noWrap>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {video.artist}
                  </Typography>
                </CardContent>
                <Box>
                  <Tooltip title="Add to Queue">
                    <IconButton onClick={() => handleAddToQueue(video)}>
                      <QueueMusic />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add to Playlist">
                    <IconButton
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowPlaylistDialog(true);
                      }}
                    >
                      <PlaylistAdd />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleVideoSelect(video)}>
                    <PlayArrow />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quality Settings Dialog */}
      <Dialog
        open={showQualityDialog}
        onClose={() => setShowQualityDialog(false)}
      >
        <DialogTitle>Video Quality Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Quality</InputLabel>
            <Select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              label="Quality"
            >
              {QUALITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQualityDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Playlist Dialog */}
      <Dialog
        open={showPlaylistDialog}
        onClose={() => setShowPlaylistDialog(false)}
      >
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="New Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim()}
            >
              Create New Playlist
            </Button>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Existing Playlists
            </Typography>
            {Object.keys(playlists).map((playlistName) => (
              <Button
                key={playlistName}
                fullWidth
                variant="outlined"
                onClick={() =>
                  handleSaveToPlaylist(selectedVideo, playlistName)
                }
                sx={{ mb: 1 }}
              >
                {playlistName}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPlaylistDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default YouTubeSearch;
