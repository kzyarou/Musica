import React, { useState } from "react";
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
} from "@mui/material";
import { PlayArrow, Add } from "@mui/icons-material";
import { usePlayer } from "../context/PlayerContext";

// Mock data - In a real app, this would come from an API or local storage
const mockLibrary = {
  playlists: [
    {
      id: 1,
      title: "My Playlist 1",
      cover: "https://source.unsplash.com/random/300x300?music=9",
      tracks: [
        {
          id: 1,
          title: "Song 1",
          artist: "Artist 1",
          url: "https://example.com/song1.mp3",
        },
        {
          id: 2,
          title: "Song 2",
          artist: "Artist 2",
          url: "https://example.com/song2.mp3",
        },
      ],
    },
    {
      id: 2,
      title: "My Playlist 2",
      cover: "https://source.unsplash.com/random/300x300?music=10",
      tracks: [
        {
          id: 3,
          title: "Song 3",
          artist: "Artist 3",
          url: "https://example.com/song3.mp3",
        },
        {
          id: 4,
          title: "Song 4",
          artist: "Artist 4",
          url: "https://example.com/song4.mp3",
        },
      ],
    },
  ],
  savedTracks: [
    {
      id: 1,
      title: "Saved Song 1",
      artist: "Artist 1",
      cover: "https://source.unsplash.com/random/300x300?music=11",
      url: "https://example.com/song1.mp3",
    },
    {
      id: 2,
      title: "Saved Song 2",
      artist: "Artist 2",
      cover: "https://source.unsplash.com/random/300x300?music=12",
      url: "https://example.com/song2.mp3",
    },
  ],
};

function Library() {
  const [activeTab, setActiveTab] = useState(0);
  const { setTrack, setQueue } = usePlayer();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePlaylistClick = (playlist) => {
    setQueue(playlist.tracks);
    setTrack(playlist.tracks[0]);
  };

  const handleTrackClick = (track) => {
    setTrack(track);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Your Library
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab label="Playlists" />
        <Tab label="Saved Tracks" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">Playlists</Typography>
            <IconButton color="primary">
              <Add />
            </IconButton>
          </Box>
          <Grid container spacing={3}>
            {mockLibrary.playlists.map((playlist) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
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
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={playlist.cover}
                    alt={playlist.title}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {playlist.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Saved Tracks
          </Typography>
          <Grid container spacing={2}>
            {mockLibrary.savedTracks.map((track) => (
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
                    image={track.cover}
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

export default Library;
