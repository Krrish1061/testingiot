import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Sensor from "../../entities/Sensor";

interface Props {
  sensorName: string;
  data: string | number;
  sensors: Sensor[] | undefined;
}

function LiveDataCard({ sensorName, data, sensors }: Props) {
  const isMainsOff = sensorName === "mains" && !data;
  return (
    <Card
      elevation={1}
      sx={{
        borderStyle: "solid",
        borderWidth: !isMainsOff ? "1px" : "2px",
        borderColor: !isMainsOff ? "primary.main" : "error.main",
        width: { xs: 320, smd: 1 },
        paddingBottom: 0,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          paddingBottom: 0,
        }}
      >
        <Typography variant="liveCardText">
          {sensorName.charAt(0).toUpperCase() + sensorName.substring(1)}
        </Typography>
        {sensors &&
          sensors.map(
            (sensor, index) =>
              sensor.name === sensorName && (
                <Stack
                  justifyContent="flex-start"
                  alignItems="flex-end"
                  direction="row"
                  key={index}
                  sx={{ color: "inherit" }}
                >
                  <Typography variant="h3" component="h2">
                    {sensor.is_value_boolean ? (data ? "ON" : "OFF") : data}
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {sensor.symbol}
                  </Typography>
                </Stack>
              )
          )}
      </CardContent>
    </Card>
  );
}

export default LiveDataCard;
