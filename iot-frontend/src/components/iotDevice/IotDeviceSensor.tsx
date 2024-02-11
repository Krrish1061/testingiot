import useGetIotDeviceSensor from "../../hooks/iotDevice/useGetIotDeviceSensor";
import IIotDeviceSensor from "../../entities/IotDeviceSensor";
import UpdateIotDeviceSensor from "./UpdateIotDeviceSensor";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";

interface IProps {
  companySlug?: string;
  username?: string;
}

function IotDeviceSensor(Props: IProps) {
  const {
    data: iotDeviceSensors,
    isError,
    isLoading,
  } = useGetIotDeviceSensor(Props);
  if (isError) return <div>Error occured</div>;
  if (isLoading) return <div>Loading</div>;

  return (
    <>
      {Object.entries(iotDeviceSensors).map(
        ([key, value]: [string, IIotDeviceSensor[]], index) => (
          <Accordion key={index} defaultExpanded={index === 0 ? true : false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`iot-device-sensor${index}`}
              id={`iot-device-sensor${index}`}
              sx={{ paddingBottom: 0, marginBottom: 0 }}
            >
              <Typography component="h1" variant="h6" textAlign="center">
                Sensor's associated with Iot-Device {key}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ paddingTop: 0, marginTop: 0 }}>
              <UpdateIotDeviceSensor
                iotDeviceId={parseInt(key)}
                iotDeviceSensors={value}
              />
            </AccordionDetails>
          </Accordion>
        )
      )}
    </>
  );
}

export default IotDeviceSensor;
