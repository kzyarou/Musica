import React, { useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { usePlayer } from "../context/PlayerContext";

const PlayerContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  zIndex: theme.zIndex.appBar,
}));

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

function Player() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isYouTube,
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    handleSeek,
    handleVolumeChange,
    setYoutubePlayer,
  } = usePlayer();

  const youtubePlayerRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Initialize YouTube player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      if (isYouTube && currentTrack && !youtubePlayerRef.current) {
        youtubePlayerRef.current = new window.YT.Player("youtube-player", {
          height: "0",
          width: "0",
          videoId: currentTrack.id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              setYoutubePlayer(event.target);
              event.target.setVolume(volume * 100);
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                handleNext();
              }
            },
            onError: (event) => {
              console.error("YouTube Player Error:", event);
            },
          },
        });
      }
    };

    // Cleanup function
    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [isYouTube, currentTrack]);

  // Update YouTube player when track changes
  useEffect(() => {
    if (isYouTube && youtubePlayerRef.current && currentTrack) {
      youtubePlayerRef.current.loadVideoById(currentTrack.id);
    }
  }, [currentTrack, isYouTube]);

  if (!currentTrack) return null;

  return (
    <PlayerContainer elevation={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              style={{
                width: 56,
                height: 56,
                marginRight: 16,
                borderRadius: 4,
              }}
            />
            <Box>
              <Typography variant="subtitle1">{currentTrack.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {currentTrack.artist}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" alignItems="center" mb={1}>
              <IconButton onClick={handlePrevious}>
                <SkipPrevious />
              </IconButton>
              <IconButton
                onClick={isPlaying ? handlePause : handlePlay}
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleNext}>
                <SkipNext />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" width="100%">
              <Typography variant="caption" sx={{ mr: 1 }}>
                {formatTime(currentTime)}
              </Typography>
              <Slider
                value={progress}
                onChange={(_, value) => handleSeek(value)}
                min={0}
                max={1}
                step={0.01}
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <IconButton
              onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
            >
              {volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={volume}
              onChange={(_, value) => handleVolumeChange(value)}
              min={0}
              max={1}
              step={0.01}
              sx={{ width: 100 }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Hidden YouTube player */}
      {isYouTube && <div id="youtube-player" style={{ display: "none" }} />}
    </PlayerContainer>
  );
}

export default Player;
