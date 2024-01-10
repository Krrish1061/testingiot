import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useCompanyStore from "../../store/companyStore";
import useUpdateCompanyProfile from "../../hooks/company/useUpdateCompanyProfile";

const schema = z.object({
  phone_number: z
    .string()
    .max(10, "maximum of 10 digit")
    .regex(/^\d{10}$/, "Invalid phone number")
    .or(z.string().nullish()),
  address: z.string().max(255, "Character limit exceeded").nullish(),
  description: z.string().nullish(),
});

type IFormInputs = z.infer<typeof schema>;

function CompanyProfile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const company = useCompanyStore((state) => state.company);
  const { mutate } = useUpdateCompanyProfile();
  const noValue = "N/A";

  const defaultValues = {
    phone_number: (company.profile?.phone_number || "") as string,
    description: company.profile?.description || "",
    address: company.profile?.address || "",
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
    console.log(data);
    setIsEditMode(false);
  };

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
              Company Name:
            </Typography>
            <Typography color="inherit" gutterBottom>
              {company.name}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={8} md={12}>
          <Box>
            <Typography gutterBottom color="inherit" fontWeight="bold">
              Company Email:
            </Typography>
            <Typography gutterBottom color="inherit">
              {company.email}
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
                {company.profile?.phone_number || noValue}
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
                {company.profile?.address || noValue}
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
              User Creation Limit:
            </Typography>
            <Typography color="inherit" gutterBottom>
              {company.user_limit || noValue}
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
                {company.profile?.description || noValue}
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

export default CompanyProfile;
