import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
} from "@mui/material";
import { Home, Search, LibraryMusic, YouTube, Menu } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Player from "./Player";

const drawerWidth = 240;

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: "Home", icon: <Home />, path: "/" },
    { text: "Search", icon: <Search />, path: "/search" },
    { text: "YouTube", icon: <YouTube />, path: "/youtube" },
    { text: "Library", icon: <LibraryMusic />, path: "/library" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ overflow: "auto" }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              "&.Mui-selected": {
                bgcolor: "action.selected",
              },
            }}
          >
            <ListItemIcon sx={{ color: "text.primary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            Modern Music Player
          </Typography>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
            },
          }}
        >
          <Toolbar />
          {drawer}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: "1px solid rgba(255, 255, 255, 0.12)",
            },
          }}
        >
          <Toolbar />
          {drawer}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.default",
          pb: { xs: 8, sm: 3 }, // Add padding bottom for mobile to account for bottom navigation
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {isMobile && (
        <BottomNavigation
          value={location.pathname}
          onChange={(event, newValue) => {
            navigate(newValue);
          }}
          showLabels
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            zIndex: theme.zIndex.appBar,
          }}
        >
          {menuItems.map((item) => (
            <BottomNavigationAction
              key={item.text}
              label={item.text}
              value={item.path}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}

      <Player />
    </Box>
  );
}

export default Layout;
