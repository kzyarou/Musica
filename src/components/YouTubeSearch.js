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
  const { setTrack, queue, setQueue } = usePlayer();

  useEffect(() => {
    // Load playlists on component mount
    setPlaylists(getPlaylists());
  }, []);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchYouTubeVideos(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching YouTube:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = async (video) => {
    try {
      const details = await getYouTubeVideoDetails(video.id);
      if (details) {
        setTrack({ ...details, quality: selectedQuality });
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
    }
  };

  const handleAddToQueue = async (video) => {
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
    }
  };

  const handleSaveToPlaylist = async (video, playlistName) => {
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
    }
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
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
    }
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
                    <IconButton onClick={() => setShowPlaylistDialog(true)}>
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
        <DialogTitle>Video Quality</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Quality</InputLabel>
            <Select
              value={selectedQuality}
              label="Quality"
              onChange={(e) => setSelectedQuality(e.target.value)}
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
              label="New Playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleCreatePlaylist}
              disabled={!newPlaylistName.trim()}
            >
              Create Playlist
            </Button>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Existing Playlists
          </Typography>
          {Object.keys(playlists).map((playlistName) => (
            <Button
              key={playlistName}
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              onClick={() => {
                handleSaveToPlaylist(selectedVideo, playlistName);
                setShowPlaylistDialog(false);
              }}
            >
              {playlistName}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPlaylistDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default YouTubeSearch;
