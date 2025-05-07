import React, { useEffect, useRef, useState } from "react";
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
    handlePlay,
    handlePause,
    handleNext,
    handlePrevious,
    handleSeek,
    handleVolumeChange,
  } = usePlayer();

  const youtubePlayerRef = useRef(null);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setYoutubeReady(true);
      };
    } else {
      setYoutubeReady(true);
    }

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, []);

  // Initialize YouTube player
  useEffect(() => {
    if (
      !youtubeReady ||
      !currentTrack ||
      !currentTrack.id ||
      currentTrack.id.length !== 11
    ) {
      return;
    }

    setIsYouTube(true);

    const initializePlayer = () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }

      youtubePlayerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: currentTrack.id,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(volume * 100);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
          onError: (event) => {
            console.error("YouTube Player Error:", event.data);
            setIsYouTube(false);
          },
        },
      });
    };

    // Small delay to ensure the container is ready
    setTimeout(initializePlayer, 100);
  }, [currentTrack, youtubeReady, isPlaying, volume, handleNext]);

  // Update YouTube player state
  useEffect(() => {
    if (!isYouTube || !youtubePlayerRef.current) return;

    try {
      if (isPlaying) {
        youtubePlayerRef.current.playVideo();
      } else {
        youtubePlayerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error("Error controlling YouTube player:", error);
    }
  }, [isPlaying, isYouTube]);

  // Update YouTube volume
  useEffect(() => {
    if (!isYouTube || !youtubePlayerRef.current) return;

    try {
      youtubePlayerRef.current.setVolume(volume * 100);
    } catch (error) {
      console.error("Error setting YouTube volume:", error);
    }
  }, [volume, isYouTube]);

  // Update YouTube progress
  useEffect(() => {
    let interval;
    if (isYouTube && youtubePlayerRef.current && isPlaying) {
      interval = setInterval(() => {
        try {
          const currentTime = youtubePlayerRef.current.getCurrentTime();
          const duration = youtubePlayerRef.current.getDuration();
          if (currentTime && duration) {
            handleSeek(currentTime / duration);
          }
        } catch (error) {
          console.error("Error updating YouTube progress:", error);
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isYouTube, isPlaying, handleSeek]);

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
      {isYouTube && (
        <div
          id="youtube-player"
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        />
      )}
    </PlayerContainer>
  );
}

export default Player;
