import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useAddUser from "../../hooks/useAddUser";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import UserTypes from "../../constants/userTypes";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isUserSuperAdmin: boolean;

  isUserCompanySuperAdmin: boolean;
}

// export interface AddUserFormData {
//   email: string;
//   company?: string | null;
//   type: "ADMIN" | "MODERATOR" | "VIEWER";
// }

const schema = z.object({
  email: z
    .string()
    .min(1, "Email field is required")
    .email("Invalid email address"),
  company: z.string().nullish(),
  type: z.enum(["ADMIN", "MODERATOR", "VIEWER"]),
});

type IFormInputs = z.infer<typeof schema>;

const AddUserForm = ({
  open,
  setOpen,
  isUserSuperAdmin,
  isUserCompanySuperAdmin,
}: Props) => {
  const { data } = useGetAllCompany(isUserSuperAdmin);
  const addUser = useAddUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    addUser.mutate(data);
    console.log("onSubmit", data);
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
      <DialogTitle mx="auto">ADD USER</DialogTitle>
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box marginBottom={2}>
            <Typography
              component={InputLabel}
              htmlFor="email"
              required
              gutterBottom
              color="inherit"
            >
              Email:
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
          {isUserSuperAdmin && (
            <Box marginBottom={2}>
              <InputLabel sx={{ color: "inherit" }} htmlFor="company">
                Company:
              </InputLabel>

              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    disablePortal
                    id="company"
                    options={data ?? []}
                    getOptionLabel={(option) => option.name}
                    value={
                      data?.find((item) => field.value === item.slug) || null
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        type="text"
                        error={!!errors.company}
                        helperText={errors.company?.message}
                      />
                    )}
                    onChange={(_, data) => field.onChange(data?.slug)}
                  />
                )}
              />
            </Box>
          )}
          <Box marginBottom={2}>
            <InputLabel htmlFor="user-type" required sx={{ color: "inherit" }}>
              User Type:
            </InputLabel>
            <FormControl
              variant="outlined"
              sx={{ marginTop: 1, minWidth: 120 }}
            >
              <Select
                defaultValue={UserTypes.viewer}
                inputProps={{
                  ...register("type"),
                  id: "user-type",
                }}
              >
                <MenuItem value={UserTypes.viewer}>VIEWER</MenuItem>
                <MenuItem value={UserTypes.moderator}>MODERATOR</MenuItem>
                {(isUserCompanySuperAdmin || isUserSuperAdmin) && (
                  <MenuItem value={UserTypes.admin}>ADMIN</MenuItem>
                )}
              </Select>
            </FormControl>
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
};

export default AddUserForm;
