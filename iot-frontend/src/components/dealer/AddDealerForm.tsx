import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import useAddDealer from "../../hooks/dealer/useAddDealer";

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
  user_company_limit: z.coerce.number().nonnegative(),
});

type IFormInputs = z.infer<typeof schema>;

function AddDealerForm({ open, setOpen }: Props) {
  const { mutate } = useAddDealer();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_company_limit: 5,
    },
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
          width: 350,
        },
      }}
    >
      <DialogTitle mx="auto">ADD DEALER</DialogTitle>
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
              Dealer Name:
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
              Dealer Email:
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
              htmlFor="user_company_limit"
              gutterBottom
              color="inherit"
            >
              User/Company Limit:
            </Typography>
            <TextField
              inputProps={{
                ...register("user_company_limit"),
                min: 0,
              }}
              id="user_company_limit"
              type="number"
              fullWidth
              error={!!errors.user_company_limit}
              helperText={
                errors.user_company_limit && errors.user_company_limit.message
              }
              autoComplete="off"
            />
            {!errors.user_company_limit && (
              <Typography
                paddingLeft={1}
                fontSize={12}
                gutterBottom
                color="primary"
              >
                The maximum number of users/company alltogether a dealer can
                create
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

export default AddDealerForm;
