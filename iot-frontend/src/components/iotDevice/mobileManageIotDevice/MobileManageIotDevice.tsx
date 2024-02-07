import Box from "@mui/material/Box";
import useGetAllIotDevice from "../../../hooks/iotDevice/useGetAllIotDevice";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingSpinner from "../../LoadingSpinner";
import IotDeviceRow from "./IotDeviceRow";

function MobileManageIotDevice() {
  const { data: iotDevices, isError, isLoading } = useGetAllIotDevice();
  if (isError) return <Box> Error Occurred</Box>;
  if (isLoading) return <LoadingSpinner />;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Device Id</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {iotDevices.map((iotDevice, index) => (
            <IotDeviceRow key={index} row={iotDevice} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageIotDevice;
