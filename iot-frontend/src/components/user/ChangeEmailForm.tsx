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
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useChangeEmail from "../../hooks/useChangeEmail";
import CircularProgress from "@mui/material/CircularProgress";

const schema = z.object({
  new_email: z.string().min(1, "This field is required").email(),
});

type IFormInputs = z.infer<typeof schema>;

function ChangeEmailForm() {
  const user = useAuthStore((state) => state.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const { mutateAsync, isSuccess, isLoading, data } = useChangeEmail();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { new_email: user?.email },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (data.new_email === user?.email) {
      setError("new_email", {
        type: "custom",
        message: "Email address is already associated with your account",
      });
    } else {
      await mutateAsync(data);
    }
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
      sx={{
        margin: 1,
        padding: 1,
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
          onClick={() => setIsEditMode(!isEditMode)}
          sx={{ alignSelf: "flex-end" }}
        >
          Change Email
        </Button>
      ) : (
        <Box sx={{ alignSelf: "flex-end", position: "relative" }}>
          <Button
            size="small"
            disabled={isLoading}
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
            disabled={isLoading}
            startIcon={<CancelIcon />}
            onClick={() => {
              reset({ new_email: user?.email });
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
          htmlFor="editEmail"
          color="inherit"
          fontWeight="bold"
          gutterBottom
        >
          Email:
        </Typography>
        <TextField
          id="editEmail"
          inputProps={{ ...register("new_email") }}
          size="small"
          type="text"
          autoComplete="email"
          variant={isEditMode ? "outlined" : "standard"}
          InputProps={{
            ...(!isEditMode && { disableUnderline: true }),
            readOnly: !isEditMode,
          }}
          error={!!errors.new_email}
          helperText={errors.new_email?.message}
        />
      </Box>
      {isSuccess && !isEditMode && (
        <Typography fontSize={12} marginX={1} color="info.main">
          {data.message}
        </Typography>
      )}
    </Paper>
  );
}

export default ChangeEmailForm;
