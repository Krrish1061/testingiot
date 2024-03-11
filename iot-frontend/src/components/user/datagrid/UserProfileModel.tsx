import { GridRenderCellParams } from "@mui/x-data-grid";
import User from "../../../entities/User";
import Button from "@mui/material/Button";
import { forwardRef, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import ImageAvatar from "../../ImageAvatar";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import dayjs from "dayjs";

interface Props {
  params: GridRenderCellParams<User>;
}

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function UserProfileModel({ params }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const user = params.row;
  const noValue = "N/A";

  return (
    <>
      <Button
        sx={{ width: 1, textTransform: "none", justifyContent: "flex-start" }}
        onClick={handleOpen}
      >
        {params.value}
      </Button>

      <Dialog
        fullScreen={smallScreen}
        open={open}
        fullWidth
        maxWidth="md"
        scroll="body"
        onClose={handleClose}
        TransitionComponent={smallScreen ? SlideTransition : undefined}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          <Typography color="inherit" fontWeight="bold">
            User Profile
          </Typography>
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent
          sx={{
            marginTop: 0,
            paddingTop: 0,
          }}
        >
          <Stack
            direction={smallScreen ? "column" : "row"}
            spacing={4}
            alignItems="center"
          >
            <Stack justifyContent="center" alignItems="center" spacing={3}>
              <ImageAvatar
                imgUrl={user?.profile?.profile_picture}
                altText={
                  user?.profile?.first_name
                    ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
                    : user!.username
                }
                height={200}
                width={200}
              />
              <Box component="div" textAlign="center">
                <Typography variant="body1" component="h1" fontWeight="bold">
                  {user?.type}
                </Typography>
                <Typography>
                  {user?.profile?.first_name
                    ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
                    : user!.username}
                </Typography>
              </Box>
            </Stack>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderRightWidth: 2,
                display: {
                  xs: "none",
                  md: "block",
                },
              }}
            />
            <Grid
              container
              spacing={2}
              columns={{ xs: 4, sm: 8, md: 12 }}
              sx={{ paddingLeft: smallScreen ? 5 : "inherit" }}
            >
              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    First name:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.first_name || noValue}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Last name:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.last_name || noValue}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Username:
                  </Typography>
                  <Typography gutterBottom color="inherit">
                    {user.username || noValue}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.email || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Date of Birth:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.date_of_birth
                      ? dayjs(user.profile.date_of_birth).format("YYYY MMM DD")
                      : noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Contact Number:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.phone_number || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    Affiliated Company:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.company || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    Address:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.address || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={8} md={12}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    Facbook Link:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.facebook_profile || noValue}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={8} md={12}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Linkedin Link:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {user.profile?.linkedin_profile || noValue}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserProfileModel;
