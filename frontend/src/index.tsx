import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Upload from "./upload";
import Events from "./events";
import Charts from "./charts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

function Main() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs value={tab} onChange={(event, value) => setTab(value)}>
        <Tab label="Dashboard" id="dashboard" />
        <Tab label="Events" id="events" />
      </Tabs>
      <div role="tabpanel" hidden={tab !== 0} id="dashboard">
        <Charts />
      </div>
      <div role="events" hidden={tab !== 1} id="events">
        <Upload />
        <Events />
      </div>
    </Box>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      light: "#c8e0cc",
      main: "#4b9054",
      dark: "#417e49",
      contrastText: "#FFF",
    },
    secondary: {
      light: "#c2e0e4",
      main: "#6d9ea7",
      dark: "#1c3e44",
      contrastText: "#000",
    },
  },
});

const root = createRoot(document.getElementById("app")!);
root.render(
  <ThemeProvider theme={theme}>
    <Main></Main>
  </ThemeProvider>,
);
