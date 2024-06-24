import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { TransitionProps } from "@mui/material/transitions";
import useMediaQuery from "@mui/material/useMediaQuery";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { ReactElement, Ref, forwardRef, useState } from "react";
import IDealer from "../../../entities/Dealer";
import ImageAvatar from "../../ImageAvatar";

interface Props {
  params: GridRenderCellParams<IDealer>;
}

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DealerProfileModel({ params }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const dealer = params.row;
  const noValue = "N/A";
  return (
    <>
      <IconButton onClick={handleOpen}>
        <ImageAvatar
          imgUrl={params.row.profile?.logo}
          altText={params.row.name}
        />
      </IconButton>

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
            Dealer Profile
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
                imgUrl={dealer.profile?.logo}
                altText={dealer.name}
                height={200}
                width={200}
              />
              <Box component="div" textAlign="center">
                <Typography variant="body1" component="h1" fontWeight="bold">
                  {dealer.name}
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
                    Dealer name:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.name}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography gutterBottom color="inherit" fontWeight="bold">
                    Contact Number:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.profile?.phone_number || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={4} md={6}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    User/Company Limit:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.user_company_limit}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={8} md={12}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    Address:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.profile?.address || noValue}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={4} sm={8} md={12}>
                <Box>
                  <Typography color="inherit" fontWeight="bold" gutterBottom>
                    Description:
                  </Typography>
                  <Typography color="inherit" gutterBottom>
                    {dealer.profile?.description || noValue}
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

export default DealerProfileModel;
