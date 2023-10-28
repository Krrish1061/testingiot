import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import useWebSocketStore, { Data } from "../store/webSocketStore";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LiveDataCard from "./LiveDataCard";

function LiveDataCardContainer() {
  const liveData = useWebSocketStore((state) => state.liveData);
  return (
    <Box>
      {liveData &&
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(liveData).map(([_key, value]: [string, Data], index) => (
          <Paper key={index} sx={{ marginBottom: 2, padding: 1 }}>
            <Typography variant="h5" component="h1">
              Room {index + 1}
            </Typography>
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
                    sm="auto"
                    md="auto"
                    key={index}
                  >
                    <LiveDataCard data={data} sensorName={sensorName} />
                  </Grid>
                ) : null
              )}
            </Grid>
            <Typography noWrap textAlign="center">
              Last Updated: {value.timestamp}
            </Typography>
          </Paper>
        ))}
    </Box>
  );
}

export default LiveDataCardContainer;
