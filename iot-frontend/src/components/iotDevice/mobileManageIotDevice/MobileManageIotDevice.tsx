import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useGetAllIotDevice from "../../../hooks/iotDevice/useGetAllIotDevice";
import ErrorReload from "../../ErrorReload";
import LoadingSpinner from "../../LoadingSpinner";
import IotDeviceRow from "./IotDeviceRow";
import CustomNoRowsOverlay from "../../datagrid/CustomNoRowsOverlay";

function MobileManageIotDevice() {
  const {
    data: iotDevices,
    isError,
    isLoading,
    refetch,
  } = useGetAllIotDevice();
  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Iot Device List!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner />;

  if (iotDevices.length === 0)
    return <CustomNoRowsOverlay text="No Iot Device" />;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell size="small" sx={{ paddingX: 0 }}></TableCell>
            <TableCell size="small" sx={{ paddingLeft: 0, paddingRight: 1 }}>
              S.N
            </TableCell>
            <TableCell>Device Name</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {iotDevices.map((iotDevice, index) => (
            <IotDeviceRow key={index} row={iotDevice} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageIotDevice;
