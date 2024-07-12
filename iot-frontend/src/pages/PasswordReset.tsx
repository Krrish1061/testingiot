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
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import usePasswordReset from "../hooks/auth/usePasswordReset";
import Logo from "/logo.png";

const schema = z
  .object({
    password: z
      .string()
      .min(1, "This field is required")
      .min(8, "The password must be at least 8 characters long")
      .max(32, "The password must be a maximun 32 characters")
      .refine(
        (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,32}$/.test(
            value
          ),
        {
          message:
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character and no whitespaces",
        }
      ),
    confirmPassword: z.string().min(1, "This field is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface FormData {
  password: string;
  confirmPassword: string;
}

function PasswordReset() {
  const { mutate, isLoading } = usePasswordReset();
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
            Reset your Account Password
          </Typography>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Box marginBottom={3}>
              <Typography
                component={InputLabel}
                required
                color="inherit"
                htmlFor="password"
              >
                Password:
              </Typography>

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
                autoComplete="password"
              />
            </Box>
            <Box marginBottom={2}>
              <Typography
                component={InputLabel}
                required
                color="inherit"
                htmlFor="confirmPassword"
              >
                Confirm Password:
              </Typography>
              <TextField
                inputProps={{ ...register("confirmPassword") }}
                id="confirmPassword"
                type="password"
                required
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                autoComplete="off"
              />
            </Box>
            <Box sx={{ position: "relative" }}>
              <Button
                type="submit"
                disabled={isLoading}
                size="large"
                variant="contained"
                fullWidth
              >
                Continue
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
  );
}

export default PasswordReset;
