import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useAddCompany from "../../hooks/company/useAddCompany";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  email: z
    .string()
    .min(1, "This field is required")
    .email("Invalid email address"),
  name: z.string().min(1, "This field is required"),
  user_limit: z.coerce.number().nonnegative(),
});

type IFormInputs = z.infer<typeof schema>;

function AddCompanyForm({ open, setOpen }: Props) {
  const { mutate } = useAddCompany();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutate(data);
    reset();
    setOpen(false);
  };

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: 350, // Adjust the width as needed
        },
      }}
    >
      <DialogTitle mx="auto">ADD COMPANY</DialogTitle>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="name"
              required
              gutterBottom
              color="inherit"
            >
              Company Name:
            </Typography>
            <TextField
              inputProps={{ ...register("name") }}
              id="name"
              type="text"
              required
              fullWidth
              error={!!errors.name}
              helperText={errors.name && errors.name.message}
              autoComplete="off"
            />
          </Box>

          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="email"
              required
              gutterBottom
              color="inherit"
            >
              Company Email:
            </Typography>
            <TextField
              inputProps={{ ...register("email") }}
              id="email"
              type="email"
              required
              fullWidth
              error={!!errors.email}
              helperText={errors.email && errors.email.message}
              autoComplete="email"
            />
          </Box>

          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="user_limit"
              gutterBottom
              color="inherit"
            >
              User Limit:
            </Typography>
            <TextField
              inputProps={{
                ...register("user_limit"),
                min: 0,
                defaultValue: 5,
              }}
              id="user_limit"
              type="number"
              fullWidth
              error={!!errors.user_limit}
              helperText={errors.user_limit && errors.user_limit.message}
              autoComplete="off"
            />
            {!errors.user_limit && (
              <Typography
                paddingLeft={1}
                fontSize={12}
                gutterBottom
                color="primary"
              >
                The maximum number of users a company can create
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={(event) => handleClose(event, "cancel")}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default AddCompanyForm;
