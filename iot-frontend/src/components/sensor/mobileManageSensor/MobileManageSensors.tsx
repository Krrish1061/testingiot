import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LoadingSpinner from "../../LoadingSpinner";
import useGetAllSensors from "../../../hooks/sensor/useGetAllSensors";
import SensorRow from "./SensorRow";

function MobileManageSensors() {
  const { data: sensors, isError, isLoading } = useGetAllSensors();

  if (isError) return <Box> Error Occurred</Box>;
  if (isLoading) return <LoadingSpinner />;
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((sensor, index) => (
            <SensorRow key={index} row={sensor} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageSensors;
