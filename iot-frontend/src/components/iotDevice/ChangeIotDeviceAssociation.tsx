import { zodResolver } from "@hookform/resolvers/zod";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
import UserGroups from "../../constants/userGroups";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllDealer from "../../hooks/dealer/useGetAllDealer";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useUpdateIotDevice from "../../hooks/iotDevice/useUpdateIotDevice";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import useAuthStore from "../../store/authStore";
import CloseIconButton from "../CloseButton";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ChangeIotDeviceAssociationSchema = z
  .object({
    iot_device: z.number({ required_error: "This field is Required" }),
    user: z.string().nullish(),
    company: z.string().nullish(),
    dealer: z.string().nullish(),
  })
  .superRefine((val, ctx) => {
    const errorMessage =
      "Either user or company should have a value, but not both";
    if (val.user && val.company) {
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
    if (!val.user && !val.company && !val.dealer) {
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
        message:
          "This field is required if both user and company is not selected",
        path: ["dealer"],
      });
    }
  });

type IChangeIotDeviceAssociationSchema = z.infer<
  typeof ChangeIotDeviceAssociationSchema
>;

function ChangeIotDeviceAssociation({ open, setOpen }: Props) {
  const { data: companyList } = useGetAllCompany();
  const { data: userList } = useGetAllUser();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: dealerList } = useGetAllDealer();
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const { mutate, isLoading } = useUpdateIotDevice();

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
    clearErrors,
  } = useForm<IChangeIotDeviceAssociationSchema>({
    resolver: zodResolver(ChangeIotDeviceAssociationSchema),
    defaultValues: {
      user: null,
      company: null,
      dealer: null,
    },
  });

  const iotDeviceValue = watch("iot_device");

  useEffect(() => {
    const iot_device = iotDeviceList?.find(
      (iot_device) => iot_device.id === iotDeviceValue
    );
    if (iot_device) {
      setValue("user", iot_device?.user);

      setValue("company", iot_device?.company);
      if (isUserSuperAdmin) setValue("dealer", iot_device?.dealer);
    }
  }, [iotDeviceList, iotDeviceValue, isUserSuperAdmin, setValue]);

  const handleDialogClose = (
    _event: SyntheticEvent | MouseEventHandler,
    reason?: string
  ) => {
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

  const onSubmit: SubmitHandler<IChangeIotDeviceAssociationSchema> = (data) => {
    const iot_device = iotDeviceList?.find(
      (iot_device) => iot_device.id === data.iot_device
    );
    if (
      iot_device &&
      (iot_device.user !== data.user ||
        iot_device.company !== data.company ||
        iot_device.dealer !== data.dealer)
    ) {
      let newIotDevice = {
        ...iot_device,
        user: data.user,
        company: data.company,
      };
      if (isUserSuperAdmin)
        newIotDevice = { ...newIotDevice, dealer: data.dealer };

      mutate(newIotDevice);
    }
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
          width: 400,
        },
      }}
    >
      <DialogTitle mx="auto">Change Iot Device Association</DialogTitle>
      <CloseIconButton handleClose={handleDialogClose} right={8} top={8} />
      <DialogContent>
        <Box marginBottom={2}>
          <InputLabel sx={{ color: "inherit" }} htmlFor="iot_device" required>
            Iot Device:
          </InputLabel>

          <Controller
            name="iot_device"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                id="iot_device"
                options={iotDeviceList ?? []}
                getOptionLabel={(option) =>
                  option.iot_device_details.name || option.id.toString()
                }
                value={
                  iotDeviceList?.find((item) => field.value === item.id) || null
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    type="text"
                    error={!!errors.iot_device}
                    helperText={errors.iot_device?.message}
                  />
                )}
                onChange={(_, data) => {
                  clearErrors();
                  field.onChange(data?.id);
                }}
              />
            )}
          />
        </Box>

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
                  userList?.filter(
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
                  userList?.find((item) => field.value === item.username) ||
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
                onChange={(_, data) => {
                  clearErrors();
                  field.onChange(data?.slug);
                }}
              />
            )}
          />
        </Box>

        {isUserSuperAdmin && (
          <Box marginBottom={2}>
            <InputLabel sx={{ color: "inherit" }} htmlFor="company">
              Dealer:
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
                    dealerList?.find((item) => field.value === item.slug) ||
                    null
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
        )}
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

export default ChangeIotDeviceAssociation;
