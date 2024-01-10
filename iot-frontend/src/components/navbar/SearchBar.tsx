import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import MobileSearchBar from "./MobileSearchBar";

interface SearchProps {
  mobileDisplay?: boolean;
}

const Search = styled("div")<SearchProps>(
  ({ theme, mobileDisplay = false }) => ({
    position: "relative",
    // borderRadius: theme.shape.borderRadius,
    borderRadius: 50,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    border: `1px solid ${theme.palette.primary.main}`,
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(1),
    width: "auto",

    [theme.breakpoints.down("sm")]: {
      ...(!mobileDisplay && {
        display: "none",
      }),
    },
  })
);

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("smd")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const createSearchBar = (mobileDisplay: boolean = false) => (
  <Search mobileDisplay={mobileDisplay}>
    <SearchIconWrapper>
      <SearchIcon />
    </SearchIconWrapper>
    <StyledInputBase
      id="search"
      placeholder="Search…"
      inputProps={{ "aria-label": "search" }}
    />
  </Search>
);

function SearchBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {createSearchBar()}

      <IconButton
        sx={{ display: { xs: "inherit", sm: "none" } }}
        onClick={() => setOpen(!open)}
      >
        <SearchIcon />
      </IconButton>
      <MobileSearchBar
        open={open}
        setOpen={setOpen}
        children={createSearchBar(true)}
      />
    </>
  );
}

export default SearchBar;
