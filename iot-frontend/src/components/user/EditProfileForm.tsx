import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import InputTextField from "../styledComponents/InputTextField ";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  facebookLink: z.string(),
});

type FormData = z.infer<typeof schema>;

function EditProfileForm({ open, setOpen }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
  };

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    setOpen(false);
  };

  // add phone number as it is missing
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: 500, // Adjust the width as needed
        },
      }}
      maxWidth="md"
    >
      <DialogTitle mx="auto">Edit Profile</DialogTitle>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="firstName"
              gutterBottom
              color="inherit"
            >
              First name:
            </Typography>
            <InputTextField
              inputProps={{ ...register("firstName") }}
              id="firstName"
              type="text"
              required
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName && errors.firstName.message}
            />
          </Box>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="firstName"
              gutterBottom
              color="inherit"
            >
              Last name:
            </Typography>
            <InputTextField
              inputProps={{ ...register("lastName") }}
              id="lastName"
              type="text"
              required
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName && errors.lastName.message}
            />
          </Box>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="firstName"
              gutterBottom
              color="inherit"
            >
              Facebook Link:
            </Typography>
            <InputTextField
              inputProps={{ ...register("facebookLink") }}
              id="facebookLink"
              type="text"
              required
              fullWidth
              error={!!errors.facebookLink}
              helperText={errors.facebookLink && errors.facebookLink.message}
            />
          </Box>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="firstName"
              gutterBottom
              color="inherit"
            >
              Linkiden Link:
            </Typography>
            <InputTextField
              inputProps={{ ...register("facebookLink") }}
              id="facebookLink"
              type="text"
              required
              fullWidth
              error={!!errors.facebookLink}
              helperText={errors.facebookLink && errors.facebookLink.message}
            />
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

export default EditProfileForm;
