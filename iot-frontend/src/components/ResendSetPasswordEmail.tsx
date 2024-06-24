import { zodResolver } from "@hookform/resolvers/zod";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  SyntheticEvent,
  useEffect,
} from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import useReSendSetPasswordEmail from "../hooks/auth/useReSendSetPasswordEmail";
import useGetAllCompany from "../hooks/company/useGetAllCompany";
import useGetAllDealer from "../hooks/dealer/useGetAllDealer";
import useGetAllUser from "../hooks/users/useGetAllUser";

const reSendSetPasswordSchema = z
  .object({
    user: z.string().nullish(),
    company: z.string().nullish(),
    dealer: z.string().nullish(),
  })
  .superRefine((val, ctx) => {
    if (
      (!val.user && !val.company && !val.dealer) ||
      (val.user && (val.company || val.dealer)) ||
      (val.company && (val.user || val.dealer)) ||
      (val.dealer && (val.user || val.company))
    ) {
      const errorMessage =
        "Either user, company or dealer should have a value, but not all";
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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessage,
        path: ["dealer"],
      });
    }
  });

type IReSendSetPasswordEmail = z.infer<typeof reSendSetPasswordSchema>;

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function ResendSetPasswordEmail({ open, setOpen }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: dealerList } = useGetAllDealer();
  const { data: UserList } = useGetAllUser();
  const { mutate, isLoading, isSuccess } = useReSendSetPasswordEmail();
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    clearErrors,
  } = useForm<IReSendSetPasswordEmail>({
    resolver: zodResolver(reSendSetPasswordSchema),
    defaultValues: {
      user: undefined,
      company: undefined,
      dealer: undefined,
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
    }
  }, [isSuccess, setOpen]);

  const handleClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
    if (reason == "backdropClick") {
      return;
    }
    reset();
    setOpen(false);
  };

  const onSubmit: SubmitHandler<IReSendSetPasswordEmail> = (data) => {
    mutate(data);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="body"
      maxWidth="md"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit(onSubmit),
        sx: {
          width: 400,
        },
      }}
    >
      <DialogTitle textAlign="center">Re-Send Confirmation Email</DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

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
                options={UserList ?? []}
                getOptionDisabled={(option) => option?.is_active || false}
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
                onChange={(_, data) => {
                  clearErrors();
                  field.onChange(data?.username);
                }}
              />
            )}
          />
        </Box>

        <Box marginBottom={2}>
          <InputLabel sx={{ color: "inherit" }} htmlFor="company">
            Company's SuperAdmin:
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
                onChange={(_, data) => {
                  clearErrors();
                  field.onChange(data?.slug);
                }}
              />
            )}
          />
        </Box>
        <Box>
          <InputLabel sx={{ color: "inherit" }} htmlFor="company">
            Dealer User:
          </InputLabel>

          <Controller
            name="dealer"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                id="dealer"
                options={dealerList ?? []}
                getOptionLabel={(option) => option.name}
                value={
                  dealerList?.find((item) => field.value === item.slug) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.dealer}
                    helperText={errors.dealer?.message}
                  />
                )}
                onChange={(_, data) => {
                  clearErrors();
                  field.onChange(data?.slug);
                }}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ position: "relative" }}>
        <Button
          disabled={isLoading}
          onClick={(event) => handleClose(event, "cancel")}
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
              marginTop: "-15px",
              marginLeft: "-15px",
            }}
          />
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ResendSetPasswordEmail;
