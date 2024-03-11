import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import Typography from "@mui/material/Typography";
import LiveDataCard from "./LiveDataCard";
import useWebSocketStore, { Data } from "../../store/webSocketStore";
import useDrawerStore from "../../store/drawerStore";
import LiveDataCardButton from "./LiveDataCardButton";
import IotDeviceDetailDialog from "../iotDevice/IotDeviceDetailDialog";
import { useState } from "react";
import IotDevice from "../../entities/IotDevice";

function LiveDataCardContainer() {
  const { data: iotDeviceList } = useGetAllIotDevice();
  const liveData = useWebSocketStore((state) => state.liveData);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const [selectedIotDevice, setSelectedIotDevice] = useState<IotDevice | null>(
    null
  );

  return (
    <>
      {liveData &&
        Object.entries(liveData).map(
          ([deviceID, value]: [string, Data], index) => (
            <Box m={2} p={2} key={index}>
              <LiveDataCardButton
                deviceID={+deviceID}
                index={index}
                iotDeviceList={iotDeviceList}
                setIotDevice={setSelectedIotDevice}
              />
              <Grid
                spacing={{ xs: 2, md: 3 }}
                columns={{ xs: 4, sm: 8, md: 12 }}
                container
                alignItems="center"
              >
                {Object.entries(value).map(([sensorName, data], index) =>
                  sensorName !== "timestamp" ? (
                    <Grid
                      display="flex"
                      justifyContent={{ xs: "center", md: "flex-start" }}
                      alignItems="center"
                      flexGrow={1}
                      xs={4}
                      sm={8}
                      smd={isDrawerOpen ? 8 : 4}
                      md={4}
                      lg={isDrawerOpen ? 4 : 3}
                      xl="auto"
                      key={index}
                    >
                      <LiveDataCard data={data} sensorName={sensorName} />
                    </Grid>
                  ) : null
                )}
              </Grid>
              <Typography textAlign="center" marginTop={1}>
                Last Updated: {value.timestamp}
              </Typography>
            </Box>
          )
        )}
      <IotDeviceDetailDialog
        open={!!selectedIotDevice}
        iotDevice={selectedIotDevice}
        setIotDevice={setSelectedIotDevice}
      />
    </>
  );
}

export default LiveDataCardContainer;
