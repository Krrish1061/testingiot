import { useEffect } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Logo from "/logo.png";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useVerifyUpdateEmail from "../hooks/useVerifyUpdateEmaill";

function UpdateEmail() {
  const { mutate, isSuccess, isError, error, isLoading } =
    useVerifyUpdateEmail();

  useEffect(() => {
    // send post request to the backend to verify the email
    mutate();
  }, [mutate]);

  const handleClick = () => {
    mutate();
  };

  return (
    <Stack justifyContent="center" alignItems="center" height={1}>
      <Card raised sx={{ width: "320px" }}>
        <CardMedia
          component="img"
          sx={{
            height: "200px",
            width: "200px",
            mx: "auto",
          }}
          src={Logo}
          title="ThoploMachine Company Pvt. Ltd."
          alt="ThoploMachine Company Logo"
        />
        <CardContent>
          <Typography
            textAlign="center"
            gutterBottom
            variant="h6"
            component="h1"
          >
            Verifying your Email Address
          </Typography>
          {!isSuccess && !isError && (
            <Box>
              <Stack direction="row" justifyContent="center" marginY={2}>
                <CircularProgress color="primary" thickness={5} />
              </Stack>
              <Typography
                textAlign="justify"
                gutterBottom
                variant="body1"
                fontSize={{ xs: "14px", md: "16px" }}
              >
                Please wait we are verifying your email address.
              </Typography>
            </Box>
          )}
          {isError && (
            <Box>
              <Typography
                textAlign="left"
                gutterBottom
                variant="body1"
                fontSize={{ xs: "14px", md: "16px" }}
              >
                Opps! {error.response?.data.error}
              </Typography>
              <Button
                size="large"
                disabled={isLoading}
                variant="contained"
                fullWidth
                onClick={handleClick}
              >
                Retry
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default UpdateEmail;
