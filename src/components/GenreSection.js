import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Button,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PlayArrow, TrendingUp } from "@mui/icons-material";
import { GENRES } from "../services/musicApi";
import { YOUTUBE_TRENDING } from "../services/youtubeTrending";
import { usePlayer } from "../context/PlayerContext";

function GenreSection() {
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTrack, setQueue } = usePlayer();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const loadTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get YouTube trending tracks for the selected genre
        const genreTracks = YOUTUBE_TRENDING[GENRES[selectedGenre].id] || [];
        if (genreTracks.length === 0) {
          setError(`No tracks found for ${GENRES[selectedGenre].name}`);
        }
        setTracks(genreTracks);
      } catch (error) {
        console.error("Error loading genre tracks:", error);
        setError("Failed to load tracks. Please try again later.");
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [selectedGenre]);

  const handleGenreChange = (event, newValue) => {
    if (newValue !== selectedGenre) {
      setSelectedGenre(newValue);
    }
  };

  const handleTrackClick = (track) => {
    if (!track || !track.id) {
      console.error("Invalid track:", track);
      return;
    }

    try {
      // Set the current track
      setTrack(track);

      // Set the queue to all tracks in the current genre
      setQueue(tracks);

      // Update recently played
      const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");
      const updatedRecent = [
        track,
        ...recent.filter((t) => t.id !== track.id),
      ].slice(0, 5);
      localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent));
    } catch (error) {
      console.error("Error handling track click:", error);
    }
  };

  const currentGenre = GENRES[selectedGenre];
  const trendingTrack = tracks[0] || null;

  return (
    <Box sx={{ mt: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" sx={{ mb: 2, px: { xs: 1, sm: 0 } }}>
        Browse by Genre
      </Typography>

      <Tabs
        value={selectedGenre}
        onChange={handleGenreChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 3,
          px: { xs: 1, sm: 0 },
          "& .MuiTab-root": {
            minWidth: "auto",
            px: { xs: 1, sm: 2 },
          },
        }}
      >
        {GENRES.map((genre) => (
          <Tab key={genre.id} label={genre.name} />
        ))}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
          {error}
        </Alert>
      )}

      {/* Trending Track Section */}
      {trendingTrack && !error && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            mx: { xs: 1, sm: 0 },
            background: "linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TrendingUp sx={{ mr: 1 }} />
            <Typography variant="h6">
              Trending in {currentGenre.name}
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <CardMedia
                component="img"
                sx={{
                  width: "100%",
                  borderRadius: 1,
                  aspectRatio: "1",
                  objectFit: "cover",
                }}
                image={trendingTrack.cover}
                alt={trendingTrack.title}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x300?text=No+Image";
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 500,
                }}
              >
                {trendingTrack.title}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
                sx={{ opacity: 0.8 }}
              >
                {trendingTrack.artist}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => handleTrackClick(trendingTrack)}
                sx={{ mt: 2 }}
                fullWidth={isMobile}
              >
                Play Now
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Typography variant="h5" sx={{ mb: 2, px: { xs: 1, sm: 0 } }}>
        More {currentGenre.name} Tracks
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : tracks.length > 1 ? (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {tracks.slice(1).map((track) => (
            <Grid item xs={6} sm={4} md={3} key={track.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                onClick={() => handleTrackClick(track)}
              >
                <CardMedia
                  component="img"
                  sx={{
                    aspectRatio: "1",
                    objectFit: "cover",
                  }}
                  image={track.cover}
                  alt={track.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                  >
                    {track.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    noWrap
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {track.artist}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !error ? (
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          sx={{ px: { xs: 1, sm: 0 } }}
        >
          No additional tracks found for this genre.
        </Typography>
      ) : null}
    </Box>
  );
}

export default GenreSection;
