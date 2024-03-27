import useGetIotDeviceSensor from "../../hooks/iotDevice/useGetIotDeviceSensor";
import IIotDeviceSensor from "../../entities/IotDeviceSensor";
import UpdateIotDeviceSensor from "./UpdateIotDeviceSensor";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";

interface IProps {
  companySlug?: string;
  username?: string;
}

function IotDeviceSensor(Props: IProps) {
  const { data: iotDeviceList } = useGetAllIotDevice();
  const {
    data: iotDeviceSensors,
    isError,
    isLoading,
  } = useGetIotDeviceSensor(Props);
  if (isError) return <div>Error occured</div>;
  if (isLoading) return <div>Loading</div>;

  const deviceName = (key: number) => {
    return iotDeviceList?.find((iotDevice) => iotDevice.id === +key)
      ?.iot_device_details?.name;
  };

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
              <Typography component="h1" variant="h6">
                Sensor's associated with Iot-Device {deviceName(+key) || key}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, marginTop: 0 }}>
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
