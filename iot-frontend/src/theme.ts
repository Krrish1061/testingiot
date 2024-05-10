import { PaletteMode } from "@mui/material";
import { Theme, createTheme, responsiveFontSizes } from "@mui/material/styles";
import { CSSProperties, createContext, useMemo, useState } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    liveCardText: CSSProperties;
  }

  interface TypographyVariantsOptions {
    liveCardText?: CSSProperties;
  }

  interface BreakpointOverrides {
    xs: true;
    sm: true;
    smd: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    liveCardText: true;
  }
}

interface ColorContextSchema {
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorContextSchema>(
  {} as ColorContextSchema
);

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: "#38c5f4",
    },
  },
  typography: {
    liveCardText: {
      fontSize: 24,
      fontWeight: 400,
      whiteSpace: "nowrap",
    },
  },
  components: {
    // Name of the component
    MuiTextField: {
      styleOverrides: {
        // Name of the slot
        root: ({ theme }: { theme: Theme }) => ({
          // Some CSS
          // width: "25ch",
          "& input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
          },
        }),
      },
    },
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },

    MuiTypography: {
      defaultProps: {
        variantMapping: {
          liveCardText: "h2",
        },
      },
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      smd: 700,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export const useMode = () => {
  const [mode, setMode] = useState<PaletteMode>("light");

  const colorMode = useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      },
    }),
    []
  );

  const theme = useMemo(
    () => responsiveFontSizes(createTheme(getDesignTokens(mode))),
    [mode]
  );

  return { theme, colorMode };
};
