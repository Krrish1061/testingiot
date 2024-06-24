import Popper from "@mui/material/Popper";
import { styled } from "@mui/material/styles";

const PopperWithArrow = styled(Popper)(({ theme }) => ({
  // You can replace with `PopperUnstyled` for lower bundle size.
  zIndex: 1,
  maxWidth: "375px",
  width: "100%",
  '&[data-popper-placement*="bottom"] .arrow': {
    top: 0,
    left: 0,
    marginTop: "-0.9em",
    width: "3em",
    height: "1em",
    "&::before": {
      borderWidth: "0 1em 1em 1em",
      borderColor: `transparent transparent ${theme.palette.common.white} transparent`,
    },
  },
  '&[data-popper-placement*="top"] .arrow': {
    bottom: 0,
    left: 0,
    marginBottom: "-0.9em",
    width: "3em",
    height: "1em",
    "&::before": {
      borderWidth: "1em 1em 0 1em",
      borderColor: `${theme.palette.common.white} transparent transparent transparent`,
    },
  },
  '&[data-popper-placement*="right"] .arrow': {
    left: 0,
    marginLeft: "-0.9em",
    height: "3em",
    width: "1em",
    "&::before": {
      borderWidth: "1em 1em 1em 0",
      borderColor: `transparent ${theme.palette.common.white} transparent transparent`,
    },
  },
  '&[data-popper-placement*="left"] .arrow': {
    right: 0,
    marginRight: "-0.9em",
    height: "3em",
    width: "1em",
    "&::before": {
      borderWidth: "1em 0 1em 1em",
      borderColor: `transparent transparent transparent ${theme.palette.common.white}`,
    },
  },
}));

export default PopperWithArrow;
