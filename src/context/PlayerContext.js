import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Howl } from "howler";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState([]);
  const [isYouTube, setIsYouTube] = useState(false);
  const soundRef = useRef(null);
  const progressInterval = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Update progress for regular audio
  useEffect(() => {
    if (soundRef.current && !isYouTube) {
      const updateProgress = () => {
        const currentTime = soundRef.current.seek();
        const duration = soundRef.current.duration();
        setCurrentTime(currentTime);
        setDuration(duration);
        setProgress(currentTime / duration);
      };

      if (isPlaying) {
        progressInterval.current = setInterval(updateProgress, 1000);
      } else {
        clearInterval(progressInterval.current);
      }

      return () => clearInterval(progressInterval.current);
    }
  }, [isPlaying, isYouTube]);

  // Update progress for YouTube videos
  useEffect(() => {
    if (youtubePlayerRef.current && isYouTube) {
      const updateProgress = () => {
        const currentTime = youtubePlayerRef.current.getCurrentTime();
        const duration = youtubePlayerRef.current.getDuration();
        setCurrentTime(currentTime);
        setDuration(duration);
        setProgress(currentTime / duration);
      };

      if (isPlaying) {
        progressInterval.current = setInterval(updateProgress, 1000);
      } else {
        clearInterval(progressInterval.current);
      }

      return () => clearInterval(progressInterval.current);
    }
  }, [isPlaying, isYouTube]);

  // Handle track changes
  useEffect(() => {
    if (currentTrack) {
      if (currentTrack.url?.includes("youtube.com")) {
        setIsYouTube(true);
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.unload();
        }
      } else {
        setIsYouTube(false);
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.unload();
        }
        soundRef.current = new Howl({
          src: [currentTrack.url],
          html5: true,
          volume: volume,
          onplay: () => {
            setIsPlaying(true);
            console.log("Audio started playing");
          },
          onpause: () => {
            setIsPlaying(false);
            console.log("Audio paused");
          },
          onstop: () => {
            setIsPlaying(false);
            console.log("Audio stopped");
          },
          onend: () => {
            console.log("Audio ended");
            handleNext();
          },
          onload: () => {
            console.log("Audio loaded");
            setDuration(soundRef.current.duration());
          },
          onloaderror: (id, error) => {
            console.error("Error loading audio:", error);
          },
          onplayerror: (id, error) => {
            console.error("Error playing audio:", error);
          },
        });
      }
    }
  }, [currentTrack]);

  // Handle volume changes
  useEffect(() => {
    if (soundRef.current && !isYouTube) {
      soundRef.current.volume(volume);
    } else if (youtubePlayerRef.current && isYouTube) {
      youtubePlayerRef.current.setVolume(volume * 100);
    }
  }, [volume, isYouTube]);

  const handlePlay = () => {
    if (isYouTube) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else if (soundRef.current) {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isYouTube) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    } else if (soundRef.current) {
      soundRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      setCurrentTrack(nextTrack);
    } else {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    // Implement previous track logic if needed
  };

  const handleSeek = (value) => {
    if (isYouTube) {
      if (youtubePlayerRef.current) {
        const duration = youtubePlayerRef.current.getDuration();
        const seekTime = duration * value;
        youtubePlayerRef.current.seekTo(seekTime);
        setCurrentTime(seekTime);
      }
    } else if (soundRef.current) {
      const duration = soundRef.current.duration();
      const seekTime = duration * value;
      soundRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
    setProgress(value);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
  };

  const setTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const setYoutubePlayer = (player) => {
    youtubePlayerRef.current = player;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        queue,
        isYouTube,
        setTrack,
        setQueue,
        handlePlay,
        handlePause,
        handleNext,
        handlePrevious,
        handleSeek,
        handleVolumeChange,
        setYoutubePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
