import React, { useState } from "react";
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
} from "@mui/material";
import { Search as SearchIcon, PlayArrow } from "@mui/icons-material";
import { usePlayer } from "../context/PlayerContext";
import { searchTracks } from "../services/musicApi";
import { debounce } from "lodash";

function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setTrack } = usePlayer();

  const performSearch = debounce(async (query) => {
    if (query.length < 3) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const tracks = await searchTracks(query);
      setSearchResults(tracks);
    } catch (error) {
      console.error("Error searching tracks:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    performSearch(query);
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

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for songs or artists"
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

      {searchResults && searchResults.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Search Results
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((track) => (
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

      {searchResults && searchResults.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No results found for "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Search;
