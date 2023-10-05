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
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import useLoginUser from "../hooks/useLoginUser";
import Logo from "/logo.png";

const schema = z.object({
  username: z.string().refine(
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
  password: z.string().nonempty("Password field is required"),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const { mutate, isLoading } = useLoginUser();
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
                <Typography component={InputLabel} htmlFor="username">
                  Username or Email:
                </Typography>
                <TextField
                  inputProps={{ ...register("username") }}
                  id="username"
                  type="text"
                  required
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username && errors.username.message}
                />
              </Box>
              <Box marginBottom={3}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography component={InputLabel} htmlFor="password">
                    Password:
                  </Typography>
                  <Link href="#" variant="body1" underline="hover">
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
                  helperText={errors.password && errors.password.message}
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
