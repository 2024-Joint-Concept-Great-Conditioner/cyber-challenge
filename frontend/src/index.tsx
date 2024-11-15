import React from "react";
import { createRoot } from "react-dom/client";
import Upload from "./upload";
import Events from "./events";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function Main() {
  return (
    <div>
      <Upload />
      <Events />
    </div>
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
