import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingSpinner from "../../LoadingSpinner";
import useGetAllSensors from "../../../hooks/sensor/useGetAllSensors";
import SensorRow from "./SensorRow";
import ErrorReload from "../../ErrorReload";
import CustomNoRowsOverlay from "../../datagrid/CustomNoRowsOverlay";

function MobileManageSensors() {
  const { data: sensors, isError, isLoading, refetch } = useGetAllSensors();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the sensors List!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner />;

  if (sensors.length === 0) return <CustomNoRowsOverlay text="No Sensor" />;
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell size="small" sx={{ paddingX: 0 }}></TableCell>
            <TableCell size="small" sx={{ paddingLeft: 0, paddingRight: 1 }}>
              S.N
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors.map((sensor, index) => (
            <SensorRow key={index} row={sensor} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageSensors;
