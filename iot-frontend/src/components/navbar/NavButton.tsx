import Button, { ButtonProps } from "@mui/material/Button";
import styled from "@mui/material/styles/styled";

interface NavButtonProps extends ButtonProps {
  isAvatar?: boolean;
}

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isAvatar",
})<NavButtonProps>(({ theme, isAvatar = false }) => ({
  ...(isAvatar && {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    [theme.breakpoints.down("md")]: {
      justifyContent: "center",
    },
  }),

  // For smaller screens (smaller than 900px width)
  [theme.breakpoints.down("md")]: {
    border: "none",
    margin: 0,
    padding: 0,
    "&:hover ": {
      border: "none",
    },
  },
}));

export default NavButton;
