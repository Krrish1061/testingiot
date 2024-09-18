import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import ResendEmailConfirmation from "../components/ResendEmailConfirmation";
import ResendSetPasswordEmail from "../components/ResendSetPasswordEmail";
import useClearCacheData from "../hooks/useClearCacheData";

function MiscellaneousSettings() {
  const [openEmailConfirmationForm, setOpenEmailConfirmationForm] =
    useState(false);
  const [openResendSetPaswordEmailForm, setOpenResendSetPaswordEmailForm] =
    useState(false);

  const { mutate, isLoading } = useClearCacheData();

  const miscellaneousSettings = [
    {
      name: "Re-Send Email-Verification Email",
      handleButtonClick: () =>
        setOpenEmailConfirmationForm(!openEmailConfirmationForm),
    },
    {
      name: "Re-Send Set-Password Email",
      handleButtonClick: () =>
        setOpenResendSetPaswordEmailForm(!openResendSetPaswordEmailForm),
    },
  ];

  return (
    <>
      <Grid
        container
        spacing={2}
        columns={{ xs: 4, sm: 8, md: 12 }}
        padding={2}
      >
        {miscellaneousSettings.map(({ name, handleButtonClick }, index) => (
          <Grid item xs={4} sm={8} md={7} key={index}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <span>{name}</span>
              <Button onClick={handleButtonClick}>Open Form</Button>
            </Stack>
          </Grid>
        ))}
        <Grid item xs={4} sm={8} md={7}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Clear Cache Data</span>
            <Button disabled={isLoading} onClick={() => mutate()}>
              Clear
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <ResendEmailConfirmation
        open={openEmailConfirmationForm}
        setOpen={setOpenEmailConfirmationForm}
      />
      <ResendSetPasswordEmail
        open={openResendSetPaswordEmailForm}
        setOpen={setOpenResendSetPaswordEmailForm}
      />
    </>
  );
}

export default MiscellaneousSettings;
