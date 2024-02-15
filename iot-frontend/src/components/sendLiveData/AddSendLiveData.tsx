import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import UserGroups from "../../constants/userGroups";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAddSendLiveData from "../../hooks/sendLiveData/useAddSendLiveData";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const sendLiveDataSchema = z
  .object({
    user: z.string().nullish(),
    company: z.string().nullish(),
    endpoint: z.string().min(1, "This field is required").url(),
  })
  .superRefine((val, ctx) => {
    if ((!val.user && !val.company) || (val.user && val.company)) {
      const errorMessage =
        "Either user or company should have a value, but not both";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["user"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["company"],
      });
    }
  });

type ISendLiveDataFormInputs = z.infer<typeof sendLiveDataSchema>;

function AddSendLiveData({ open, setOpen }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: UserList } = useGetAllUser();
  const { mutate, isLoading } = useAddSendLiveData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ISendLiveDataFormInputs>({
    resolver: zodResolver(sendLiveDataSchema),
  });
  const handleDialogClose = (_event: SyntheticEvent, reason: string) => {
    if (reason == "backdropClick") {
      return;
    }
    reset();
    setOpen(false);
  };

  const handleCloseButtonClick = () => {
    reset();
    setOpen(false);
  };

  const onSubmit: SubmitHandler<ISendLiveDataFormInputs> = (data) => {
    mutate(data);
    handleCloseButtonClick();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit(onSubmit),
        sx: {
          width: 350,
        },
      }}
    >
      <DialogTitle mx="auto">ADD Endpoint</DialogTitle>
      <DialogContent>
        <Box marginBottom={2}>
          <InputLabel sx={{ color: "inherit" }} htmlFor="user">
            User
          </InputLabel>

          <Controller
            name="user"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                id="user"
                options={
                  UserList?.filter(
                    (user) =>
                      user.groups.includes(UserGroups.adminGroup) &&
                      !user.is_associated_with_company
                  ) ?? []
                }
                getOptionLabel={(option) =>
                  option.profile?.first_name
                    ? `${option.profile?.first_name} ${option.profile?.last_name}`
                    : option.username
                }
                value={
                  UserList?.find((item) => field.value === item.username) ||
                  null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.user}
                    helperText={errors.user?.message}
                  />
                )}
                onChange={(_, data) => field.onChange(data?.username)}
              />
            )}
          />
        </Box>

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
                options={companyList ?? []}
                getOptionLabel={(option) => option.name}
                value={
                  companyList?.find((item) => field.value === item.slug) || null
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
        <Box marginBottom={2}>
          <Typography
            component={InputLabel}
            htmlFor="endpoint"
            gutterBottom
            color="inherit"
          >
            Endpoint:
          </Typography>
          <TextField
            inputProps={{
              ...register("endpoint"),
            }}
            id="endpoint"
            type="text"
            fullWidth
            error={!!errors.endpoint}
            helperText={errors.endpoint && errors.endpoint.message}
            autoComplete="off"
          />
        </Box>
        <Box
          sx={{
            position: "relative",
            marginTop: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleCloseButtonClick}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
          {isLoading && (
            <CircularProgress
              color="primary"
              size={30}
              thickness={5}
              sx={{
                position: "absolute",
                top: "50%",
                right: "15%",
                marginTop: "-12px",
                marginRight: "-12px",
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default AddSendLiveData;
