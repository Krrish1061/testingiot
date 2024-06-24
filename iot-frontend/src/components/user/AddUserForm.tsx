import { zodResolver } from "@hookform/resolvers/zod";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import UserTypes from "../../constants/userTypes";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useAddUser from "../../hooks/users/useAddUser";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isUserSuperAdmin: boolean;
  isUserDealer: boolean;
  isUserCompanySuperAdmin: boolean;
}

const schema = z.object({
  email: z
    .string()
    .min(1, "Email field is required")
    .email("Invalid email address"),
  company: z.string().nullish(),
  type: z.enum(["ADMIN", "MODERATOR", "VIEWER"]),
  user_limit: z.coerce
    .string()
    .transform((value) =>
      value === "" || value === "null" ? null : Number(value)
    )
    .nullish()
    .refine((val) => val === null || (typeof val === "number" && val >= 0), {
      message: "Enter Positive Number",
    }),
});

type IFormInputs = z.infer<typeof schema>;

const AddUserForm = ({
  open,
  setOpen,
  isUserSuperAdmin,
  isUserDealer,
  isUserCompanySuperAdmin,
}: Props) => {
  const { data } = useGetAllCompany(isUserSuperAdmin);
  const addUser = useAddUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
  } = useForm<IFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: isUserDealer ? "ADMIN" : "VIEWER",
      user_limit: null,
    },
  });

  const typeValue = watch("type");
  const companyValue = watch("company");

  const [showUserLimit, setShowUserLimit] = useState(false);

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    if (data.user_limit === null) delete data.user_limit;
    addUser.mutate(data);
    reset();
    setOpen(false);
  };

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    reset();
    setOpen(false);
    setShowUserLimit(false);
  };

  const userTypeOptions = useMemo(() => {
    if (isUserDealer) {
      return [
        <MenuItem key="admin" value={UserTypes.admin}>
          ADMIN
        </MenuItem>,
      ];
    }
    const options = [
      <MenuItem key="viewer" value={UserTypes.viewer}>
        VIEWER
      </MenuItem>,
      <MenuItem key="moderator" value={UserTypes.moderator}>
        MODERATOR
      </MenuItem>,
    ];

    if (isUserCompanySuperAdmin || isUserSuperAdmin) {
      options.push(
        <MenuItem key="admin" value={UserTypes.admin}>
          ADMIN
        </MenuItem>
      );
    }
    return options;
  }, [isUserDealer, isUserCompanySuperAdmin, isUserSuperAdmin]);

  useEffect(() => {
    if (showUserLimit && (!!companyValue || typeValue !== UserTypes.admin)) {
      setShowUserLimit(false);
      setValue("user_limit", null);
    } else if (
      !showUserLimit &&
      !companyValue &&
      typeValue === UserTypes.admin
    ) {
      setShowUserLimit(true);
    }
  }, [typeValue, companyValue, showUserLimit, setValue]);

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            marginBottom={2}
            spacing={2}
          >
            <Box>
              <InputLabel
                htmlFor="user-type"
                required
                sx={{ color: "inherit" }}
              >
                User Type:
              </InputLabel>
              <FormControl
                variant="outlined"
                sx={{
                  marginTop: 1,
                  minWidth: 120,
                  width: { xs: 1, sm: "inherit" },
                }}
              >
                <Select
                  defaultValue={
                    isUserDealer ? UserTypes.admin : UserTypes.viewer
                  }
                  inputProps={{
                    ...register("type"),
                    id: "user-type",
                  }}
                >
                  {userTypeOptions}
                </Select>
              </FormControl>
            </Box>
            {isUserSuperAdmin && showUserLimit && (
              <Box>
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
                  }}
                  id="user_limit"
                  type="number"
                  fullWidth
                  error={!!errors.user_limit}
                  helperText={errors.user_limit && errors.user_limit.message}
                  autoComplete="off"
                />
              </Box>
            )}
          </Stack>
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
