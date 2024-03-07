import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";

interface Props {
  sensorName: string;
  data: string | number;
}

function LiveDataCard({ sensorName, data }: Props) {
  // only get sensor associated with the user
  const { data: sensors } = useGetAllSensors();

  return (
    <Card
      elevation={1}
      sx={{
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "primary.main",
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
        <Typography variant="h3" fontSize={24} component="h2">
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
