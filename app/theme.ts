import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#faf0e6",
    },
    secondary: {
      main: "#b0e0e6",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
};

const theme = createTheme(themeOptions);

export default theme;
