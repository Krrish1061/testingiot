import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ReactNode, useState } from "react";
import AddIotDeviceForm from "./AddIotDeviceForm";
import AddIotDeviceSensorForm from "./AddIotDeviceSensorForm";
import IotDevice from "../../entities/IotDevice";

function IotDeviceStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const [iotDevice, setIotDevice] = useState<IotDevice>({} as IotDevice);

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
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Add another Iot Device</Button>
          </Box>
        </>
      ) : (
        <Box marginTop={2}>{steps[activeStep].component}</Box>
      )}
    </>
  );
}

export default IotDeviceStepper;
