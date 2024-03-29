import { styled } from "@mui/material/styles";
import CircleIcon from "@mui/icons-material/Circle";

const BlinkingDot = styled(CircleIcon)({
  fontSize: 10,
  marginRight: "2px",
  animation: "blinker 1.5s ease-in-out infinite", // Applying the animation with easing
  "@keyframes blinker": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.5 }, // Adding intermediate step for smoother transition
    "100%": { opacity: 1 },
  },
});

export default BlinkingDot;
