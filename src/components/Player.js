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
    handleVolumeChange: setVolume,
  } = usePlayer();

  const youtubePlayerRef = useRef(null);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [youtubeCurrentTime, setYoutubeCurrentTime] = useState(0);
  const [youtubeDuration, setYoutubeDuration] = useState(0);

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
      setIsYouTube(false);
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
            const youtubeVolume = Math.round(volume * 100);
            event.target.setVolume(youtubeVolume);
            if (youtubeVolume === 0) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            setYoutubeDuration(event.target.getDuration());
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

  // Handle play/pause for YouTube videos
  const handlePlayPause = () => {
    if (isYouTube && youtubePlayerRef.current) {
      try {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
          handlePause();
        } else {
          youtubePlayerRef.current.playVideo();
          handlePlay();
        }
      } catch (error) {
        console.error("Error controlling YouTube player:", error);
      }
    } else {
      if (isPlaying) {
        handlePause();
      } else {
        handlePlay();
      }
    }
  };

  // Handle next track for YouTube videos
  const handleNextTrack = () => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }
    handleNext();
  };

  // Handle previous track for YouTube videos
  const handlePreviousTrack = () => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }
    handlePrevious();
  };

  // Update YouTube volume
  useEffect(() => {
    if (!isYouTube || !youtubePlayerRef.current) return;

    try {
      const youtubeVolume = Math.round(volume * 100);
      youtubePlayerRef.current.setVolume(youtubeVolume);
      if (youtubeVolume === 0) {
        youtubePlayerRef.current.mute();
      } else {
        youtubePlayerRef.current.unMute();
      }
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
            setYoutubeCurrentTime(currentTime);
            setYoutubeDuration(duration);
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

  // Handle seek for YouTube videos
  const handleYouTubeSeek = (value) => {
    if (isYouTube && youtubePlayerRef.current) {
      try {
        const seekTime = value * youtubeDuration;
        youtubePlayerRef.current.seekTo(seekTime, true);
        setYoutubeCurrentTime(seekTime);
        handleSeek(value);
      } catch (error) {
        console.error("Error seeking YouTube video:", error);
      }
    } else {
      handleSeek(value);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    if (isYouTube && youtubePlayerRef.current) {
      try {
        const youtubeVolume = Math.round(newVolume * 100);
        youtubePlayerRef.current.setVolume(youtubeVolume);
        if (youtubeVolume === 0) {
          youtubePlayerRef.current.mute();
        } else {
          youtubePlayerRef.current.unMute();
        }
      } catch (error) {
        console.error("Error setting YouTube volume:", error);
      }
    }
    setVolume(newVolume);
  };

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
              <IconButton onClick={handlePreviousTrack}>
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={handlePlayPause} size="large">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={handleNextTrack}>
                <SkipNext />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center" width="100%">
              <Typography variant="caption" sx={{ mr: 1 }}>
                {formatTime(isYouTube ? youtubeCurrentTime : currentTime)}
              </Typography>
              <Slider
                value={progress}
                onChange={(_, value) => handleYouTubeSeek(value)}
                min={0}
                max={1}
                step={0.01}
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {formatTime(isYouTube ? youtubeDuration : duration)}
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
