import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import IIotDeviceSensor from "../../entities/IotDeviceSensor";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetAllIotDeviceSensor from "../../hooks/iotDevice/useGetAllIotDeviceSensor";
import ErrorReload from "../ErrorReload";
import LoadingSpinner from "../LoadingSpinner";
import UpdateIotDeviceSensor from "./UpdateIotDeviceSensor";

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
    refetch,
  } = useGetAllIotDeviceSensor(Props);

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Iot Device associated Sensor details!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner />;

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
