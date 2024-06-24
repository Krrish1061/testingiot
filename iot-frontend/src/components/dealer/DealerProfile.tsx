import { zodResolver } from "@hookform/resolvers/zod";
import CancelIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import useUpdateDealerProfile from "../../hooks/dealer/useUploadDealerProfile";
import useDealerStore from "../../store/dealerStore";

const schema = z.object({
  phone_number: z
    .string()
    .max(10, "maximum of 10 digit")
    .nullish()
    .refine((value) => !value || /^\d{10}$/.test(value), {
      message: "Invalid phone number",
    }),
  address: z.string().max(255, "Character limit exceeded").nullish(),
  description: z.string().nullish(),
});

type IFormInputs = z.infer<typeof schema>;

function DealerProfile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const dealer = useDealerStore((state) => state.dealer);
  const { mutate, isError } = useUpdateDealerProfile();
  const noValue = "N/A";

  const defaultValues = {
    phone_number: (dealer?.profile?.phone_number || "") as string,
    description: dealer?.profile?.description || "",
    address: dealer?.profile?.address || "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: defaultValues,
    resolver: zodResolver(schema),
  });

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
      component={isEditMode ? "form" : "div"}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        margin: 1,
        padding: 2,
      }}
    >
      <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
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
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography color="inherit" fontWeight="bold" gutterBottom>
              Dealer Name:
            </Typography>
            <Typography color="inherit" gutterBottom>
              {dealer?.name}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography gutterBottom color="inherit" fontWeight="bold">
              Dealer Email:
            </Typography>
            <Typography gutterBottom color="inherit">
              {dealer?.email}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography gutterBottom color="inherit" fontWeight="bold">
              Contact Number:
            </Typography>
            {!isEditMode ? (
              <Typography gutterBottom color="inherit">
                {dealer?.profile?.phone_number || noValue}
              </Typography>
            ) : (
              <TextField
                inputProps={{ ...register("phone_number") }}
                id="contact_number"
                size="small"
                type="text"
                autoComplete="off"
                variant="outlined"
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                sx={{
                  width: { xs: 1, sm: "inherit" },
                }}
              />
            )}
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography color="inherit" fontWeight="bold" gutterBottom>
              Address:
            </Typography>
            {!isEditMode ? (
              <Typography color="inherit" gutterBottom>
                {dealer?.profile?.address || noValue}
              </Typography>
            ) : (
              <TextField
                inputProps={{ ...register("address") }}
                id="address"
                size="small"
                type="text"
                fullWidth
                autoComplete="address"
                variant="outlined"
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={{
                  width: { md: "40ch" },
                }}
              />
            )}
          </Box>
        </Grid>

        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography color="inherit" fontWeight="bold" gutterBottom>
              User/Company Creation Limit:
            </Typography>
            <Typography color="inherit" gutterBottom>
              {dealer?.user_company_limit || noValue}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography gutterBottom color="inherit" fontWeight="bold">
              Short Description:
            </Typography>
            {!isEditMode ? (
              <Typography gutterBottom color="inherit">
                {dealer?.profile?.description || noValue}
              </Typography>
            ) : (
              <TextField
                inputProps={{ ...register("description") }}
                id="description"
                size="small"
                type="text"
                multiline
                fullWidth
                minRows={3}
                autoComplete="off"
                variant="outlined"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default DealerProfile;
