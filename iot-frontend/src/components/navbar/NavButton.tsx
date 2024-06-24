import Typography from "@mui/material/Typography";
import { RefObject } from "react";
import ImageAvatar from "../ImageAvatar";
import StyledNavButton from "./StyledNavButton";

interface Props {
  open: boolean;
  imgUrl: string | null | undefined;
  altText: string;
  navButtonText: string;
  anchorRef: RefObject<HTMLButtonElement>;
  handleToggle: () => void;
}

function NavButton({
  open,
  imgUrl,
  altText,
  navButtonText,
  anchorRef,
  handleToggle,
}: Props) {
  return (
    <StyledNavButton
      variant="outlined"
      disableElevation
      isAvatar={true}
      ref={anchorRef}
      onClick={handleToggle}
      aria-controls={open ? "menu" : undefined}
      aria-expanded={open ? "true" : undefined}
      aria-haspopup="true"
    >
      <ImageAvatar
        imgUrl={imgUrl}
        altText={altText}
        height={{
          xs: 50,
          md: 30,
        }}
        width={{
          xs: 50,
          md: 30,
        }}
      />
      <Typography
        display={{
          xs: "none",
          md: "inherit",
        }}
      >
        {navButtonText}
      </Typography>
    </StyledNavButton>
  );
}

export default NavButton;
