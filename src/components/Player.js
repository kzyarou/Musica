import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  ExpandMore,
  ExpandLess,
  Download,
} from "@mui/icons-material";
import { usePlayer } from "../context/PlayerContext";

function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    progress,
    handlePlay,
    handlePause,
    handleVolumeChange,
    handleSeek,
    handleNext,
    handlePrevious,
  } = usePlayer();

  const [isYouTube, setIsYouTube] = useState(false);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentTrack?.id?.length === 11) {
      setIsYouTube(true);
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          setIsYouTubeReady(true);
        };
      } else {
        setIsYouTubeReady(true);
      }
    } else {
      setIsYouTube(false);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (isYouTube && isYouTubeReady && playerRef.current) {
      try {
        const player = new window.YT.Player(playerRef.current, {
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
            playsinline: 1,
            rel: 0,
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
              console.error("YouTube Player Error:", event);
            },
          },
        });

        return () => {
          if (player && player.destroy) {
            player.destroy();
          }
        };
      } catch (error) {
        console.error("Error initializing YouTube player:", error);
      }
    }
  }, [isYouTube, isYouTubeReady, currentTrack, isPlaying, volume, handleNext]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleDownload = async () => {
    if (!currentTrack) return;

    try {
      if (isYouTube) {
        // For YouTube videos, we'll use a proxy service
        const response = await fetch(
          `/api/download?videoId=${currentTrack.id}`
        );
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentTrack.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For regular audio files
        const response = await fetch(currentTrack.url);
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentTrack.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setDownloadStatus({
        open: true,
        message: "Download started",
        severity: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus({
        open: true,
        message: "Download failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setDownloadStatus({ ...downloadStatus, open: false });
  };

  if (!currentTrack) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: "background.paper",
        borderTop: "1px solid rgba(255, 255, 255, 0.12)",
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Card
          sx={{
            display: "flex",
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            cursor: "pointer",
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardMedia
            component="img"
            image={currentTrack.cover}
            alt={currentTrack.title}
            sx={{ width: "100%", height: "100%" }}
          />
        </Card>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {currentTrack.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap>
            {currentTrack.artist}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <IconButton
            onClick={handlePrevious}
            size={isMobile ? "small" : "medium"}
          >
            <SkipPrevious />
          </IconButton>
          <IconButton
            onClick={isPlaying ? handlePause : handlePlay}
            size={isMobile ? "small" : "medium"}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton onClick={handleNext} size={isMobile ? "small" : "medium"}>
            <SkipNext />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            width: 200,
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)}
            size="small"
          >
            {volume === 0 ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={volume}
            onChange={(_, value) => handleVolumeChange(value)}
            min={0}
            max={1}
            step={0.01}
            size="small"
          />
        </Box>

        <Tooltip title="Download">
          <IconButton
            onClick={handleDownload}
            size={isMobile ? "small" : "medium"}
          >
            <Download />
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          size={isMobile ? "small" : "medium"}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {formatTime(currentTime)}
            </Typography>
            <Slider
              value={progress}
              onChange={(_, value) => handleSeek(value)}
              min={0}
              max={1}
              step={0.01}
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              {formatTime(duration)}
            </Typography>
          </Box>

          {isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <IconButton
                onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)}
                size="small"
              >
                {volume === 0 ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={volume}
                onChange={(_, value) => handleVolumeChange(value)}
                min={0}
                max={1}
                step={0.01}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          )}
        </Box>
      </Collapse>

      {isYouTube && (
        <div
          ref={playerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      )}

      <Snackbar
        open={downloadStatus.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={downloadStatus.severity}
          sx={{ width: "100%" }}
        >
          {downloadStatus.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Player;
