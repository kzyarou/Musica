import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Howl } from "howler";

const PlayerContext = createContext();

const initialState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  currentTime: 0,
  duration: 0,
  progress: 0,
  queue: [],
  queueIndex: -1,
};

function playerReducer(state, action) {
  switch (action.type) {
    case "SET_TRACK":
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true,
        currentTime: 0,
        progress: 0,
        duration: 0,
      };
    case "PLAY":
      return {
        ...state,
        isPlaying: true,
      };
    case "PAUSE":
      return {
        ...state,
        isPlaying: false,
      };
    case "SET_VOLUME":
      return {
        ...state,
        volume: action.payload,
      };
    case "SET_CURRENT_TIME":
      return {
        ...state,
        currentTime: action.payload,
        progress: state.duration > 0 ? action.payload / state.duration : 0,
      };
    case "SET_DURATION":
      return {
        ...state,
        duration: action.payload,
        progress:
          state.currentTime > 0 ? state.currentTime / action.payload : 0,
      };
    case "SET_QUEUE":
      return {
        ...state,
        queue: action.payload,
        queueIndex: action.payload.length > 0 ? 0 : -1,
        currentTrack: action.payload.length > 0 ? action.payload[0] : null,
      };
    case "NEXT_TRACK":
      const nextIndex = Math.min(state.queueIndex + 1, state.queue.length - 1);
      return {
        ...state,
        queueIndex: nextIndex,
        currentTrack: state.queue[nextIndex],
        isPlaying: true,
        currentTime: 0,
        progress: 0,
        duration: 0,
      };
    case "PREVIOUS_TRACK":
      const prevIndex = Math.max(state.queueIndex - 1, 0);
      return {
        ...state,
        queueIndex: prevIndex,
        currentTrack: state.queue[prevIndex],
        isPlaying: true,
        currentTime: 0,
        progress: 0,
        duration: 0,
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const soundRef = React.useRef(null);

  // Cleanup function
  const cleanupSound = () => {
    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }
  };

  useEffect(() => {
    if (state.currentTrack) {
      // Clean up previous sound
      cleanupSound();

      // Check if it's a YouTube video
      if (state.currentTrack.id && state.currentTrack.id.length === 11) {
        // YouTube video handling is done in the Player component
        return;
      }

      // Create new sound
      soundRef.current = new Howl({
        src: [state.currentTrack.url],
        html5: true,
        volume: state.volume,
        onplay: () => {
          dispatch({ type: "PLAY" });
        },
        onpause: () => {
          dispatch({ type: "PAUSE" });
        },
        onstop: () => {
          dispatch({ type: "PAUSE" });
        },
        onend: () => {
          handleNext();
        },
        onload: () => {
          const duration = soundRef.current.duration();
          if (duration) {
            dispatch({ type: "SET_DURATION", payload: duration });
          }
        },
        onloaderror: (id, error) => {
          console.error("Error loading audio:", error);
          cleanupSound();
        },
        onplayerror: (id, error) => {
          console.error("Error playing audio:", error);
          cleanupSound();
        },
      });

      // Start playing
      if (state.isPlaying) {
        soundRef.current.play();
      }
    }

    return cleanupSound;
  }, [state.currentTrack]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(state.volume);
    }
  }, [state.volume]);

  useEffect(() => {
    let interval;
    if (state.isPlaying && soundRef.current) {
      interval = setInterval(() => {
        try {
          const currentTime = soundRef.current.seek();
          if (currentTime !== undefined) {
            dispatch({ type: "SET_CURRENT_TIME", payload: currentTime });
          }
        } catch (error) {
          console.error("Error updating current time:", error);
        }
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isPlaying]);

  const handlePlay = () => {
    if (soundRef.current) {
      try {
        soundRef.current.play();
        dispatch({ type: "PLAY" });
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  const handlePause = () => {
    if (soundRef.current) {
      try {
        soundRef.current.pause();
        dispatch({ type: "PAUSE" });
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (soundRef.current) {
      try {
        soundRef.current.volume(newVolume);
        dispatch({ type: "SET_VOLUME", payload: newVolume });
      } catch (error) {
        console.error("Error changing volume:", error);
      }
    }
  };

  const handleSeek = (progress) => {
    if (soundRef.current) {
      try {
        const time = progress * state.duration;
        soundRef.current.seek(time);
        dispatch({ type: "SET_CURRENT_TIME", payload: time });
      } catch (error) {
        console.error("Error seeking audio:", error);
      }
    }
  };

  const handleNext = () => {
    if (state.queueIndex < state.queue.length - 1) {
      dispatch({ type: "NEXT_TRACK" });
    }
  };

  const handlePrevious = () => {
    if (state.queueIndex > 0) {
      dispatch({ type: "PREVIOUS_TRACK" });
    }
  };

  const setTrack = (track) => {
    if (track) {
      dispatch({ type: "SET_TRACK", payload: track });
    }
  };

  const setQueue = (tracks) => {
    if (Array.isArray(tracks)) {
      dispatch({ type: "SET_QUEUE", payload: tracks });
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        handlePlay,
        handlePause,
        handleVolumeChange,
        handleSeek,
        handleNext,
        handlePrevious,
        setTrack,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
