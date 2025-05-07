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
        progress: action.payload / state.duration,
      };
    case "SET_DURATION":
      return {
        ...state,
        duration: action.payload,
      };
    case "SET_QUEUE":
      return {
        ...state,
        queue: action.payload,
        queueIndex: 0,
      };
    case "NEXT_TRACK":
      return {
        ...state,
        queueIndex: Math.min(state.queueIndex + 1, state.queue.length - 1),
        currentTrack: state.queue[state.queueIndex + 1],
        isPlaying: true,
        currentTime: 0,
        progress: 0,
      };
    case "PREVIOUS_TRACK":
      return {
        ...state,
        queueIndex: Math.max(state.queueIndex - 1, 0),
        currentTrack: state.queue[state.queueIndex - 1],
        isPlaying: true,
        currentTime: 0,
        progress: 0,
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const soundRef = React.useRef(null);

  useEffect(() => {
    if (state.currentTrack) {
      // Clean up previous sound
      if (soundRef.current) {
        soundRef.current.unload();
      }

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
          dispatch({
            type: "SET_DURATION",
            payload: soundRef.current.duration(),
          });
        },
      });

      // Start playing
      if (state.isPlaying) {
        soundRef.current.play();
      }

      // Update duration
      const duration = soundRef.current.duration();
      if (duration) {
        dispatch({ type: "SET_DURATION", payload: duration });
      }
    }
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
        const currentTime = soundRef.current.seek();
        dispatch({ type: "SET_CURRENT_TIME", payload: currentTime });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isPlaying]);

  const handlePlay = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
    dispatch({ type: "PLAY" });
  };

  const handlePause = () => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
    dispatch({ type: "PAUSE" });
  };

  const handleVolumeChange = (newVolume) => {
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    dispatch({ type: "SET_VOLUME", payload: newVolume });
  };

  const handleSeek = (progress) => {
    if (soundRef.current) {
      const time = progress * state.duration;
      soundRef.current.seek(time);
      dispatch({ type: "SET_CURRENT_TIME", payload: time });
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
    dispatch({ type: "SET_TRACK", payload: track });
  };

  const setQueue = (tracks) => {
    dispatch({ type: "SET_QUEUE", payload: tracks });
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
