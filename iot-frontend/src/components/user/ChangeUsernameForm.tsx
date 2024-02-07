import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import useAuthStore from "../../store/authStore";
import { useEffect, useState } from "react";
import useChangeUsername from "../../hooks/users/useChangeUsername";
import CircularProgress from "@mui/material/CircularProgress";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z
    .string()
    .min(1, "This field is required")
    .max(20, "Username should be atmost 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are accepted."),
});

type IFormInputs = z.infer<typeof schema>;

function ChangeUsernameForm() {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync, isSuccess, isLoading } = useChangeUsername();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { username: user?.username },
  });

  useEffect(() => {
    if (isSuccess) {
      setIsEditMode(false);
      reset();
    }
  }, [isSuccess, reset]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (data.username !== user?.username) {
      // mutating the data
      await mutateAsync(data);
    } else {
      setError("username", {
        type: "custom",
        message: "Username is already assigned to your account.",
      });
    }
  };

  return (
    <Paper
      elevation={isEditMode ? 12 : 0}
      sx={{
        margin: 1,
        padding: 2,
        "& .MuiTextField-root": {
          width: "25ch",
        },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isEditMode ? (
        <Button
          size="small"
          startIcon={<EditIcon />}
          disabled={user?.profile?.is_username_modified}
          onClick={() => setIsEditMode(!isEditMode)}
          sx={{ alignSelf: "flex-end", position: "relative" }}
        >
          Change Username
        </Button>
      ) : (
        <Box sx={{ alignSelf: "flex-end" }}>
          <Button
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSubmit(onSubmit)}
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
            startIcon={<CancelIcon />}
            onClick={() => {
              reset({ username: user?.username });
              setIsEditMode(!isEditMode);
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      <Box>
        <Typography
          component={InputLabel}
          htmlFor="editUsername"
          color="inherit"
          fontWeight="bold"
          gutterBottom
          sx={{ alignSelf: "flex-start" }}
        >
          {isEditMode && "Enter New "}Username:
        </Typography>
        <TextField
          id="editUsername"
          inputProps={{ ...register("username") }}
          size="small"
          type="text"
          autoComplete="off"
          variant={isEditMode ? "outlined" : "standard"}
          InputProps={{
            ...(!isEditMode && { disableUnderline: true }),
            readOnly: !isEditMode,
          }}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
      </Box>

      {!isEditMode && (
        <Typography fontSize={12} marginLeft={1} color="info.main">
          {user?.profile?.is_username_modified
            ? "You have already changed your Username."
            : "You can only change your Username once"}
        </Typography>
      )}
    </Paper>
  );
}

export default ChangeUsernameForm;
