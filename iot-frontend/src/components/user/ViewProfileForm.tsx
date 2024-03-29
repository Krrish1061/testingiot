import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import useAuthStore from "../../store/authStore";
import useDrawerStore from "../../store/drawerStore";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { z } from "zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useUpdateProfile from "../../hooks/users/useUpdateProfile";
import dayjs from "dayjs";

const schema = z.object({
  first_name: z.string().min(1, "This field is required").nullable(),
  last_name: z.string().min(1, "This field is required").nullable(),
  date_of_birth: z.coerce.date().nullable(),
  address: z.string().nullable(),
  facebook_profile: z.string().url().nullish().or(z.literal("")),
  linkedin_profile: z.string().url().nullish().or(z.literal("")),
  phone_number: z
    .string()
    .max(10, "maximum of 10 digit")
    .nullish()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: "Invalid phone number",
    }),
});

type IFormInputs = z.infer<typeof schema>;

function ViewProfileForm() {
  const user = useAuthStore((state) => state.user);
  const [isEditMode, setIsEditMode] = useState(false);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const { mutate, isError } = useUpdateProfile();
  const noValue = "N/A";

  const defaultValues = {
    first_name: user?.profile?.first_name || "",
    last_name: user?.profile?.last_name || "",
    address: user?.profile?.address || "",
    facebook_profile: user?.profile?.facebook_profile || "",
    linkedin_profile: user?.profile?.linkedin_profile || "",
    phone_number: user?.profile?.phone_number?.toString() || null,
    date_of_birth: user?.profile?.date_of_birth
      ? user.profile.date_of_birth
      : null,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

  const username = user?.username || noValue;
  const email = user?.email || noValue;

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutate(data);
    setIsEditMode(false);
  };

  useEffect(() => {
    if (isError) reset();
  }, [isError, reset]);

  return (
    <Paper
      elevation={isEditMode ? 12 : 0}
      square={false}
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        margin: 1,
        padding: 2,

        // "& .MuiTextField-root": {
        //   minWidth: "20ch",
        // },
      }}
    >
      <Grid
        container
        spacing={2}
        columns={{ xs: 4, sm: 8, md: 12 }}
        alignItems={{
          xs: "center",
          sm: isDrawerOpen ? "center" : "flex-start",
          md: "flex-start",
        }}
      >
        <Grid
          item
          xs={4}
          sm={8}
          md={12}
          alignSelf="flex-end"
          display="flex"
          justifyContent="flex-end"
        >
          {!isEditMode ? (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setIsEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button size="small" type="submit" startIcon={<SaveIcon />}>
                Save Profile
              </Button>
              <Button
                type="reset"
                size="small"
                onClick={() => {
                  reset(defaultValues);
                  setIsEditMode(false);
                }}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Grid>
        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="firstName"
              color="inherit"
              fontWeight="bold"
              gutterBottom
              required={isEditMode}
            >
              First name:
            </Typography>
            <TextField
              inputProps={{ ...register("first_name") }}
              id="firstName"
              size="small"
              type="text"
              autoComplete="given-name"
              placeholder={isEditMode ? "" : noValue}
              variant={isEditMode ? "outlined" : "standard"}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="lastName"
              gutterBottom
              color="inherit"
              fontWeight="bold"
              required={isEditMode}
            >
              Last name:
            </Typography>
            <TextField
              inputProps={{ ...register("last_name") }}
              id="lastName"
              type="text"
              size="small"
              autoComplete="family-name"
              placeholder={isEditMode ? "" : noValue}
              variant={isEditMode ? "outlined" : "standard"}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="username"
              gutterBottom
              color="inherit"
              fontWeight="bold"
            >
              Username:
            </Typography>
            <TextField
              id="username"
              type="text"
              size="small"
              value={username}
              autoComplete="off"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                readOnly: true,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="email"
              gutterBottom
              color="inherit"
              fontWeight="bold"
            >
              Email:
            </Typography>
            <TextField
              id="email"
              type="text"
              size="small"
              autoComplete="off"
              value={email}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                readOnly: true,
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="date_of_birth"
              gutterBottom
              color="inherit"
              fontWeight="bold"
            >
              Date of Birth:
            </Typography>

            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    value={dayjs(field.value) || null}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    readOnly={!isEditMode ? true : false}
                    disableFuture
                    slotProps={{
                      field: { clearable: true },
                      textField: {
                        id: "date_of_birth",
                        size: "small",
                        variant: isEditMode ? "outlined" : "standard",
                        InputProps: {
                          ...(!isEditMode && { disableUnderline: true }),
                        },
                        error: !!errors.date_of_birth,
                        helperText: errors.date_of_birth?.message,
                      },
                    }}
                    sx={{
                      maxWidth: "24ch",
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={6}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="contactNumber"
              gutterBottom
              color="inherit"
              fontWeight="bold"
            >
              Contact Number:
            </Typography>
            <TextField
              inputProps={{ ...register("phone_number") }}
              id="contactNumber"
              type="text"
              size="small"
              autoComplete="tel-national"
              placeholder={isEditMode ? "" : noValue}
              variant={isEditMode ? "outlined" : "standard"}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.phone_number}
              helperText={errors.phone_number?.message}
            />
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="address"
              color="inherit"
              fontWeight="bold"
              gutterBottom
            >
              Address:
            </Typography>
            <TextField
              inputProps={{ ...register("address") }}
              id="address"
              size="small"
              type="text"
              multiline
              maxRows={4}
              fullWidth
              autoComplete="address"
              variant={isEditMode ? "outlined" : "standard"}
              placeholder={isEditMode ? "" : noValue}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography
              component={InputLabel}
              htmlFor="facbookLink"
              color="inherit"
              fontWeight="bold"
              gutterBottom
            >
              Facbook Link:
            </Typography>
            <TextField
              inputProps={{ ...register("facebook_profile") }}
              id="facbookLink"
              type="text"
              size="small"
              multiline
              maxRows={4}
              fullWidth
              autoComplete="off"
              placeholder={isEditMode ? "" : noValue}
              variant={isEditMode ? "outlined" : "standard"}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.facebook_profile}
              helperText={errors.facebook_profile?.message}
            />
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography
              component={isEditMode ? InputLabel : "div"}
              htmlFor="linkedinLink"
              gutterBottom
              color="inherit"
              fontWeight="bold"
            >
              Linkedin Link:
            </Typography>

            <TextField
              inputProps={{ ...register("linkedin_profile") }}
              id="linkedinLink"
              type="text"
              size="small"
              fullWidth
              multiline
              maxRows={4}
              autoComplete="off"
              placeholder={isEditMode ? "" : noValue}
              variant={isEditMode ? "outlined" : "standard"}
              InputProps={{
                ...(!isEditMode && { disableUnderline: true }),
                readOnly: !isEditMode,
              }}
              error={!!errors.linkedin_profile}
              helperText={errors.linkedin_profile?.message}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ViewProfileForm;
