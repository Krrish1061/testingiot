import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useChangePassword from "../../hooks/users/useChangePassword";
import CircularProgress from "@mui/material/CircularProgress";

const schema = z
  .object({
    old_password: z.string().min(1, "This field is required"),
    new_password: z
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
    confirmNewPassword: z.string().min(1, "This field is required"),
  })
  .refine((data) => data.new_password === data.confirmNewPassword, {
    message: "Passwords didn't match",
    path: ["confirmNewPassword"],
  });

type IFormInputs = z.infer<typeof schema>;

function ChangePasswordForm() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutate, isSuccess, isLoading } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutate(data);
  };

  useEffect(() => {
    if (isSuccess) {
      setIsEditMode(false);
      reset();
    }
  }, [isSuccess, reset]);

  return (
    <Paper
      elevation={isEditMode ? 12 : 0}
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        margin: 1,
        padding: 2,
        "& .MuiTextField-root": {
          width: "25ch",
        },
      }}
    >
      <Stack direction="column" spacing={2}>
        {!isEditMode ? (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(!isEditMode)}
            sx={{ alignSelf: "flex-end" }}
          >
            Change password
          </Button>
        ) : (
          <Box
            sx={{
              alignSelf: "flex-end",
              position: "relative",
            }}
          >
            <Button
              startIcon={<SaveIcon />}
              type="submit"
              disabled={isLoading}
              size="small"
            >
              Save
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

            <Button
              size="small"
              disabled={isLoading}
              startIcon={<CancelIcon />}
              onClick={() => {
                reset();
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        )}

        <Box>
          <Typography
            component={InputLabel}
            htmlFor="currentPassword"
            color="inherit"
            fontWeight="bold"
            gutterBottom
          >
            {isEditMode && "Enter "}Current Password:
          </Typography>
          <TextField
            inputProps={{ ...register("old_password") }}
            id="currentPassword"
            size="small"
            type="password"
            autoComplete="off"
            placeholder={isEditMode ? "" : "****************"}
            variant={isEditMode ? "outlined" : "standard"}
            InputProps={{
              ...(!isEditMode && { disableUnderline: true }),
              readOnly: !isEditMode,
            }}
            error={!!errors.old_password}
            helperText={errors.old_password?.message}
          />
        </Box>

        {isEditMode && (
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="newPassword"
              color="inherit"
              fontWeight="bold"
              gutterBottom
            >
              Enter New Password:
            </Typography>
            <TextField
              inputProps={{ ...register("new_password") }}
              id="newPassword"
              size="small"
              type="password"
              autoComplete="new-password"
              variant="outlined"
            />
            {!!errors.new_password && (
              <Typography
                marginTop="4px"
                marginLeft={1.5}
                color="error"
                fontSize={12}
              >
                {errors.new_password?.message}
              </Typography>
            )}
          </Box>
        )}
        {isEditMode && (
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="confirmNewPassword"
              color="inherit"
              fontWeight="bold"
              gutterBottom
            >
              Confirm New Password:
            </Typography>
            <TextField
              inputProps={{ ...register("confirmNewPassword") }}
              id="confirmNewPassword"
              size="small"
              type="password"
              autoComplete="off"
              variant="outlined"
              error={!!errors.confirmNewPassword}
              helperText={errors.confirmNewPassword?.message}
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default ChangePasswordForm;
