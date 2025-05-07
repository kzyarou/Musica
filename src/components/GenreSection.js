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
} from "@mui/material";
import { PlayArrow, TrendingUp } from "@mui/icons-material";
import { GENRES } from "../services/musicApi";
import { YOUTUBE_TRENDING } from "../services/youtubeTrending";
import { usePlayer } from "../context/PlayerContext";

function GenreSection() {
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setTrack } = usePlayer();

  useEffect(() => {
    const loadTracks = async () => {
      setLoading(true);
      try {
        // Get YouTube trending tracks for the selected genre
        const genreTracks = YOUTUBE_TRENDING[GENRES[selectedGenre].id] || [];
        setTracks(genreTracks);
      } catch (error) {
        console.error("Error loading genre tracks:", error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [selectedGenre]);

  const handleGenreChange = (event, newValue) => {
    setSelectedGenre(newValue);
  };

  const handleTrackClick = (track) => {
    setTrack(track);
    // Update recently played
    const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");
    const updatedRecent = [
      track,
      ...recent.filter((t) => t.id !== track.id),
    ].slice(0, 5);
    localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent));
  };

  const currentGenre = GENRES[selectedGenre];
  const trendingTrack = tracks[0] || null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Browse by Genre
      </Typography>

      <Tabs
        value={selectedGenre}
        onChange={handleGenreChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            minWidth: "auto",
            px: 2,
          },
        }}
      >
        {GENRES.map((genre) => (
          <Tab key={genre.id} label={genre.name} />
        ))}
      </Tabs>

      {/* Trending Track Section */}
      {trendingTrack && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
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
                sx={{ width: "100%", borderRadius: 1 }}
                image={trendingTrack.cover}
                alt={trendingTrack.title}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                {trendingTrack.title}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {trendingTrack.artist}
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => handleTrackClick(trendingTrack)}
                sx={{ mt: 2 }}
              >
                Play Now
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Typography variant="h5" sx={{ mb: 2 }}>
        More {currentGenre.name} Tracks
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tracks.slice(1).map((track) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
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
                  height="200"
                  image={track.cover}
                  alt={track.title}
                />
                <CardContent>
                  <Typography variant="subtitle1" noWrap>
                    {track.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {track.artist}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default GenreSection;
