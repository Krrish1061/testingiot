// import { useParams } from "react-router-dom";
import useGetIotDeviceSensor from "../../hooks/iotDevice/useGetIotDeviceSensor";
import IIotDeviceSensor from "../../entities/IotDeviceSensor";

import Grid from "@mui/material/Grid";
import UpdateIotDeviceSensor from "./UpdateIotDeviceSensor";

interface Props {
  companySlug: string | undefined;
}

function IotDeviceSensor({ companySlug }: Props) {
  // const { companySlug } = useParams();
  const {
    data: iotDeviceSensors,
    // isSuccess,
    isError,
    isLoading,
  } = useGetIotDeviceSensor(companySlug);
  if (isError) return <div>Error occured</div>;
  if (isLoading) return <div>Loading</div>;

  return (
    <>
      <Grid
        container
        spacing={2}
        marginTop={1}
        columns={{ xs: 4, sm: 8, md: 12 }}
        // sx={{ bgcolor: "yellow" }}
      >
        {Object.entries(iotDeviceSensors).map(
          ([key, value]: [string, IIotDeviceSensor[]], index) => (
            <Grid item xs={4} sm={8} md={6} key={index}>
              <UpdateIotDeviceSensor
                iotDeviceId={parseInt(key)}
                iotDeviceSensors={value}
              />
            </Grid>
          )
        )}
      </Grid>
    </>
  );
}

export default IotDeviceSensor;
