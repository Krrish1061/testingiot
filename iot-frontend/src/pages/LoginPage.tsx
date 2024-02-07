import { zodResolver } from "@hookform/resolvers/zod";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import useLogin from "../hooks/auth/useLogin";
import Logo from "/logo.png";
import TextField from "@mui/material/TextField";

const schema = z.object({
  username: z
    .string()
    .min(1, "This field is required")
    .refine(
      (username) => {
        if (username.includes("@")) {
          // If '@' is present, validate it as an email
          return z.string().email().safeParse(username).success;
        } else {
          // If '@' is absent, validate it as an alphanumeric username
          return /^[a-z0-9]+$/i.test(username);
        }
      },
      {
        message: "Invalid username or email address",
      }
    ),
  password: z.string().min(1, "This field is required"),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const { mutate, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutate(data);
  };

  return (
    <>
      <Stack justifyContent="center" alignItems="center" height={1}>
        <Card raised sx={{ width: "320px", paddingTop: "2px" }}>
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
              Sign In
            </Typography>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Box marginBottom={2}>
                <Typography
                  component={InputLabel}
                  required
                  color="inherit"
                  htmlFor="username"
                >
                  Username or Email:
                </Typography>
                <TextField
                  inputProps={{ ...register("username") }}
                  id="username"
                  type="text"
                  required
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  autoComplete="username email"
                />
              </Box>
              <Box marginBottom={3}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    component={InputLabel}
                    required
                    color="inherit"
                    htmlFor="password"
                  >
                    Password:
                  </Typography>
                  <Link
                    to="/forget-password"
                    component={RouterLink}
                    underline="hover"
                  >
                    Forget password?
                  </Link>
                </Stack>
                <TextField
                  inputProps={{
                    ...register("password"),
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
                />
              </Box>

              <Box sx={{ m: 1, position: "relative" }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="large"
                  variant="contained"
                  fullWidth
                >
                  Login
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
          </CardContent>
        </Card>
      </Stack>
    </>
  );
};

export default LoginPage;
