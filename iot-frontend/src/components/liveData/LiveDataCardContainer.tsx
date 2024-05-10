import ReplayIcon from "@mui/icons-material/Replay";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useState } from "react";
import IotDevice from "../../entities/IotDevice";
import { IData } from "../../entities/webSocket/LiveData";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";
import useGetWebSocketToken from "../../hooks/webSocket/useGetWebSocketToken";
import useDrawerStore from "../../store/drawerStore";
import useWebSocketStore from "../../store/webSocket/webSocketStore";
import IotDeviceDetailDialog from "../iotDevice/IotDeviceDetailDialog";
import BlinkingDot from "../styledComponents/BlinkingDot";
import LiveDataCard from "./LiveDataCard";
import LiveDataCardButton from "./LiveDataCardButton";

function LiveDataCardContainer() {
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: sensorList } = useGetAllSensors();
  const { mutateAsync: getWebSocketToken } = useGetWebSocketToken();
  const liveData = useWebSocketStore((state) => state.liveData);
  const connectionState = useWebSocketStore((state) => state.connectionState);
  const connectToWebsocket = useWebSocketStore(
    (state) => state.connectToWebsocket
  );
  const setConnectionState = useWebSocketStore(
    (state) => state.setConnectionState
  );
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const [selectedIotDevice, setSelectedIotDevice] = useState<IotDevice | null>(
    null
  );

  const reConnectWebsocket = async () => {
    setConnectionState("connecting");
    const websocketEndpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT;

    const webSocketToken = await getWebSocketToken();
    if (webSocketToken.token) {
      connectToWebsocket(websocketEndpoint + "?token=" + webSocketToken.token);
    }
  };

  if (connectionState === "disconnected" && liveData === null) {
    return (
      <Box
        sx={{
          margin: 2,
          padding: 2,
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: "primary.main",
          height: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error.main">
          Could not establish Live Connection to the Server!!
        </Typography>
        <Button onClick={reConnectWebsocket}>Re-established Connection</Button>
      </Box>
    );
  }

  if (liveData === null) {
    return (
      <Box
        margin={2}
        padding={2}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <CircularProgress variant="indeterminate" size={40} />
      </Box>
    );
  }

  return (
    <>
      {liveData &&
        Object.entries(liveData).map(
          ([deviceID, value]: [string, IData], index) => (
            <Box m={2} p={2} key={index}>
              <Stack direction="row" justifyContent="space-between">
                <LiveDataCardButton
                  deviceID={+deviceID}
                  index={index}
                  iotDeviceList={iotDeviceList}
                  setIotDevice={setSelectedIotDevice}
                />
                {connectionState === "connected" ? (
                  <Typography
                    color="success.main"
                    noWrap
                    sx={{
                      overflow: "visible",
                    }}
                  >
                    <BlinkingDot />
                    Live
                  </Typography>
                ) : (
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ color: "error.main" }}
                  >
                    {connectionState === "connecting" ? (
                      <CircularProgress
                        variant="indeterminate"
                        size={15}
                        sx={{
                          marginRight: "2px",
                        }}
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={reConnectWebsocket}
                        color="inherit"
                      >
                        <ReplayIcon fontSize="inherit" />
                      </IconButton>
                    )}
                    <Typography
                    // sx={{ display: { xs: "none", sm: "inherit" } }}
                    >
                      {connectionState}
                    </Typography>
                  </Stack>
                )}
              </Stack>
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
                      <LiveDataCard
                        data={data}
                        sensorName={sensorName}
                        sensors={sensorList}
                      />
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
