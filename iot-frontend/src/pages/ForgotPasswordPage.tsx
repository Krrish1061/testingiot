import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Logo from "/logo.png";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSendPasswordResetEmail from "../hooks/auth/useSendPasswordResetEmail";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import TextField from "@mui/material/TextField";

const schema = z.object({
  email: z
    .string()
    .min(1, "This field is required")
    .email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const { mutate, isLoading, isSuccess } = useSendPasswordResetEmail();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [email, setEmail] = useState<string | null>(null);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutate(data);
    setEmail(data.email);
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
          {!isSuccess && (
            <Box>
              <Typography
                textAlign="center"
                gutterBottom
                variant="h6"
                component="h1"
              >
                Forgot Password!
              </Typography>
              <Typography
                textAlign="justify"
                gutterBottom
                variant="body1"
                fontSize={{ xs: "14px", md: "16px" }}
              >
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </Typography>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Box marginBottom={2}>
                  <Typography
                    component={InputLabel}
                    required
                    color="inherit"
                    htmlFor="email"
                  >
                    Email:
                  </Typography>
                  <TextField
                    inputProps={{ ...register("email") }}
                    id="email"
                    type="text"
                    required
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    autoComplete="email"
                  />
                </Box>

                <Box sx={{ position: "relative" }}>
                  <Button
                    type="submit"
                    size="large"
                    disabled={isLoading}
                    variant="contained"
                    fullWidth
                  >
                    Send password reset email
                  </Button>
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
                </Box>
              </form>
              <Stack direction="row" justifyContent="center" mt={1}>
                <Link to="/login" component={RouterLink} underline="hover">
                  Return to sign in
                </Link>
              </Stack>
            </Box>
          )}
          {isSuccess && (
            <Typography
              textAlign="justify"
              gutterBottom
              variant="body1"
              fontSize={{ xs: "14px", md: "16px" }}
            >
              If{" "}
              <Box component="span" fontWeight="bold">
                {email}
              </Box>{" "}
              matches an email we have on file, then we've sent you an email
              containing further instructions for resetting your password.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ForgotPasswordPage;

// Thanks! If admin@domain.com matches an email we have on file, then we've sent you an email containing further instructions for resetting your password.
// If you haven't received an email in 5 minutes, check your spam, resend, or try a different email.
