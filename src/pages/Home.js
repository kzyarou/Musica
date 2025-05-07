import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { usePlayer } from "../context/PlayerContext";
import { getFeaturedTracks } from "../services/musicApi";
import GenreSection from "../components/GenreSection";

const YOUTUBE_PICKS = [
  {
    id: "3JZ4pnNtyxQ",
    title: "Ed Sheeran - Shape of You",
    artist: "Ed Sheeran",
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Luis Fonsi - Despacito ft. Daddy Yankee",
    artist: "Luis Fonsi",
  },
  {
    id: "RgKAFK5djSk",
    title: "Wiz Khalifa - See You Again ft. Charlie Puth",
    artist: "Wiz Khalifa",
  },
  {
    id: "fRh_vgS2dFE",
    title: "Justin Bieber - Sorry",
    artist: "Justin Bieber",
  },
];

function Home() {
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setTrack } = usePlayer();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const tracks = await getFeaturedTracks();
        setFeaturedTracks(tracks);
        // Get recently played from localStorage
        const recent = JSON.parse(
          localStorage.getItem("recentlyPlayed") || "[]"
        );
        setRecentlyPlayed(recent);
      } catch (error) {
        console.error("Error loading tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleTrackClick = (track) => {
    setTrack(track);
    // Update recently played
    const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");
    const updatedRecent = [
      track,
      ...recent.filter((t) => t.id !== track.id),
    ].slice(0, 5);
    localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent));
    setRecentlyPlayed(updatedRecent);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Good{" "}
        {new Date().getHours() < 12
          ? "Morning"
          : new Date().getHours() < 18
          ? "Afternoon"
          : "Evening"}
      </Typography>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Featured Tracks
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {featuredTracks.map((track) => (
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
                image={
                  track.cover ||
                  "https://source.unsplash.com/random/300x300?music"
                }
                alt={track.title}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
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

      <Divider sx={{ my: 4 }} />

      <GenreSection />

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Trending on YouTube
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {YOUTUBE_PICKS.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
            <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  borderRadius: 8,
                }}
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mt: 1 }} noWrap>
              {video.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" noWrap>
              {video.artist}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {recentlyPlayed.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Recently Played
          </Typography>
          <Grid container spacing={2}>
            {recentlyPlayed.map((track) => (
              <Grid item xs={12} key={track.id}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  onClick={() => handleTrackClick(track)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 60, height: 60 }}
                    image={
                      track.cover ||
                      "https://source.unsplash.com/random/300x300?music"
                    }
                    alt={track.title}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{track.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {track.artist}
                    </Typography>
                  </CardContent>
                  <IconButton>
                    <PlayArrow />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Home;
