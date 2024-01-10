// import Box from "@mui/material/Box";

import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import useGetAllSensors from "../hooks/sensor/useGetAllSensors";

interface Props {
  sensorName: string;
  data: string | number;
}

function LiveDataCard({ sensorName, data }: Props) {
  const { data: sensors } = useGetAllSensors();

  return (
    <Card elevation={0}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h3" fontSize={24} component="h2">
          {sensorName.charAt(0).toUpperCase() + sensorName.substring(1)}
        </Typography>
        <Stack
          justifyContent="flex-start"
          alignItems="flex-end"
          direction="row"
        >
          <Typography variant="h3" component="h2">
            {data}
          </Typography>
          {sensors
            ? sensors?.map(
                (sensor, index) =>
                  sensor.name === sensorName && (
                    <Typography variant="h4" component="h2" key={index}>
                      {sensor.symbol}
                    </Typography>
                  )
              )
            : "O"}
          {/* add loading indicator later */}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LiveDataCard;
