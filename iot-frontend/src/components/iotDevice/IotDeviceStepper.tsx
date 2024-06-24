import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { ReactNode, useEffect, useState } from "react";
import IotDevice from "../../entities/IotDevice";
import useGetIotDeviceApiKey from "../../hooks/iotDevice/useGetIotDeviceApiKey";
import AddIotDeviceForm from "./AddIotDeviceForm";
import AddIotDeviceSensorForm from "./AddIotDeviceSensorForm";
import ApiKeyDialog from "./ApiKeyDialog";
import IotDeviceDetailDialog from "./IotDeviceDetailDialog";

function IotDeviceStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [iotDevice, setIotDevice] = useState<IotDevice>({} as IotDevice);
  const [fetchDeviceKey, setFetchDeviceKey] = useState<number | null>(null);
  const [updateDeviceDetail, setUpdateDeviceDetail] =
    useState<IotDevice | null>(null);
  const {
    data: apiKey,
    isSuccess: apiKeySuccess,
    isFetching: apiKeyIsFetching,
  } = useGetIotDeviceApiKey(fetchDeviceKey);

  useEffect(() => {
    if (apiKeySuccess) {
      setOpen(true);
    }
  }, [apiKeySuccess]);

  const handleClose = () => {
    setOpen(false);
    setFetchDeviceKey(null);
  };

  const handleApiKeyButton = (id: number) => {
    setFetchDeviceKey(id);
  };

  const handleEditIotdeviceDetailButton = (editIotDevice: IotDevice) => {
    if (Object.keys(editIotDevice).length > 0)
      setUpdateDeviceDetail(editIotDevice);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const steps = [
    {
      label: "Add an Iot Device",
      component: (
        <AddIotDeviceForm handleNext={handleNext} setIotDevice={setIotDevice} />
      ),
    },
    {
      label: "Add Sensor to the Iot Device",
      component: (
        <AddIotDeviceSensorForm handleNext={handleNext} iotDevice={iotDevice} />
      ),
    },
  ];

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((step) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: ReactNode;
          } = {};

          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-evenly"
            spacing={2}
            paddingTop={1}
          >
            <Button
              sx={{ padding: 0 }}
              disabled={apiKeyIsFetching}
              onClick={() => handleApiKeyButton(iotDevice.id)}
            >
              Get Api-key
            </Button>
            <Button
              sx={{ padding: 0 }}
              disabled={apiKeyIsFetching}
              onClick={() => handleEditIotdeviceDetailButton(iotDevice)}
            >
              Edit Iot Device Detail
            </Button>
            <Button disabled={apiKeyIsFetching} onClick={handleReset}>
              Add another Iot Device
            </Button>
          </Stack>
        </>
      ) : (
        <Box marginTop={2}>{steps[activeStep].component}</Box>
      )}
      <ApiKeyDialog
        open={open}
        onClose={handleClose}
        apiKey={apiKey?.api_key}
        deviceId={fetchDeviceKey}
      />
      <IotDeviceDetailDialog
        open={!!updateDeviceDetail}
        iotDevice={updateDeviceDetail}
        setIotDevice={setUpdateDeviceDetail}
      />
    </>
  );
}

export default IotDeviceStepper;
