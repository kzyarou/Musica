import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Search from "./pages/Search";
import Player from "./components/Player";
import YouTubeSearch from "./components/YouTubeSearch";
import { PlayerProvider } from "./context/PlayerContext";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1DB954", // Spotify green
    },
    secondary: {
      main: "#FF0000", // YouTube red
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
  },
  typography: {
    fontFamily: '"Circular", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PlayerProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/youtube" element={<YouTubeSearch />} />
              <Route path="/library" element={<Library />} />
            </Routes>
            <Player />
          </Layout>
        </Router>
      </PlayerProvider>
    </ThemeProvider>
  );
}

export default App;
