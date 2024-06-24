import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Logout from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Grow from "@mui/material/Grow";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { useTheme } from "@mui/material/styles";
import {
  KeyboardEvent,
  SyntheticEvent,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "../../hooks/auth/useLogout";
import useAuthStore from "../../store/authStore";
import useCompanyStore from "../../store/companyStore";
import useDealerStore from "../../store/dealerStore";
import { ColorModeContext } from "../../theme";
import { extractFirstWord, truncateName } from "../../utilis/truncateName";
import NavButton from "./NavButton";
import ProfileCard from "./ProfileCard";

function NavUserButton() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const { mutate, isLoading } = useLogout();
  const dealer = useDealerStore((state) => state.dealer);
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const isUserCompanySuperAdmin = useAuthStore(
    (state) => state.isUserCompanySuperAdmin
  );
  const company = useCompanyStore((state) => state.company);

  const { imgUrl, altText, navButtonText } = useMemo(() => {
    let imgUrl: string | null | undefined = undefined;
    let altText: string | null | undefined = "";
    let navButtonText = "";
    if (isUserDealer && dealer) {
      imgUrl = dealer.profile?.logo;
      altText = dealer.name;
      navButtonText = truncateName(extractFirstWord(dealer.name), 20);
    } else if (isUserCompanySuperAdmin && company) {
      imgUrl = company.profile?.logo;
      altText = company.name;
      navButtonText = truncateName(extractFirstWord(company.name), 20);
    } else if (user) {
      imgUrl = user.profile?.profile_picture;
      altText = user.profile?.first_name
        ? `${user.profile?.first_name} ${user.profile?.last_name}`
        : user.username;
      navButtonText = truncateName(
        user.profile?.first_name || user.username,
        20
      );
    }
    return { imgUrl, altText, navButtonText };
  }, [company, dealer, isUserCompanySuperAdmin, isUserDealer, user]);

  function handleListKeyDown(event: KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleViewProfile = (event: Event | SyntheticEvent) => {
    handleClose(event);
    if (isUserDealer) navigate("/dealer-profile");
    else if (isUserCompanySuperAdmin) navigate("/company-profile");
    else navigate("/profile");
  };

  const handleColorModeToggle = (event: Event | SyntheticEvent) => {
    colorMode.toggleColorMode();
    handleClose(event);
  };

  const handleLogout = () => {
    mutate();
  };

  return (
    <>
      <NavButton
        open={open}
        anchorRef={anchorRef}
        imgUrl={imgUrl}
        altText={altText}
        navButtonText={navButtonText}
        handleToggle={handleToggle}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "right top",
            }}
          >
            <Paper elevation={12}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <MenuList
                    id="menu"
                    autoFocus={open}
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                    subheader={
                      <ProfileCard
                        imgUrl={imgUrl}
                        altText={altText}
                        isUserCompanySuperAdmin={isUserCompanySuperAdmin}
                        isUserDealer={isUserDealer}
                        company={company}
                        user={user}
                        dealer={dealer}
                      />
                    }
                    sx={{
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                  >
                    <Divider sx={{ borderBottomWidth: "2px" }} />

                    <MenuItem onClick={handleColorModeToggle}>
                      <ListItemIcon>
                        {theme.palette.mode === "dark" ? (
                          <Brightness7Icon fontSize="small" />
                        ) : (
                          <Brightness4Icon fontSize="small" />
                        )}
                      </ListItemIcon>
                      {theme.palette.mode.charAt(0).toUpperCase() +
                        theme.palette.mode.substring(1)}{" "}
                      Mode
                    </MenuItem>
                    <MenuItem onClick={handleViewProfile}>
                      <ListItemIcon>
                        <PersonOutlineIcon />
                      </ListItemIcon>
                      View Profile
                    </MenuItem>
                    <MenuItem disabled={isLoading} onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout />
                      </ListItemIcon>
                      Logout
                      {isLoading && (
                        <CircularProgress
                          color="primary"
                          size={30}
                          thickness={5}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-12px",
                            marginLeft: "-12px",
                          }}
                        />
                      )}
                    </MenuItem>
                  </MenuList>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default NavUserButton;
