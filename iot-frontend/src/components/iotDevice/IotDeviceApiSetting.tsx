import Box from "@mui/material/Box";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import IotDevice from "../../entities/IotDevice";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import useGetIotDeviceApiKey from "../../hooks/iotDevice/useGetIotDeviceApiKey";
import CircularProgress from "@mui/material/CircularProgress";
import ApiKeyDialog from "./ApiKeyDialog";
import LoadingSpinner from "../LoadingSpinner";
import ErrorReload from "../ErrorReload";

interface Props {
  companySlug?: string;
  username?: string;
}

function OwnedIotDevices(
  iotDevices: IotDevice[] = [],
  companySlug?: string,
  username?: string
): IotDevice[] | null {
  let ownedIotDevices: IotDevice[] | null = null;
  if (companySlug) {
    ownedIotDevices = iotDevices.filter(
      (iot_device) => iot_device.company === companySlug
    );
  } else if (username) {
    ownedIotDevices = iotDevices.filter(
      (iot_device) => iot_device.user === username
    );
  }

  return ownedIotDevices;
}

function IotDeviceApiSetting({ companySlug, username }: Props) {
  const [open, setOpen] = useState(false);
  const {
    data: iotDevices,
    isLoading,
    isError,
    refetch,
  } = useGetAllIotDevice();
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const {
    data: apiKey,
    isSuccess: apiKeySuccess,
    isFetching: apiKeyIsFetching,
  } = useGetIotDeviceApiKey(deviceId);

  const ownedIotDevices = useMemo(
    () => OwnedIotDevices(iotDevices, companySlug, username),
    [companySlug, username, iotDevices]
  );

  useEffect(() => {
    if (apiKeySuccess) {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeySuccess]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the IotDeviceList !!!"
        handleRefetch={() => refetch()}
      />
    );

  const handleApiKeyButton = (id: number) => {
    setDeviceId(id);
  };

  const handleClose = () => {
    setOpen(false);
    setDeviceId(null);
  };

  return (
    <>
      <Typography component="h2" variant="h6" gutterBottom>
        IOT DEVICE API-KEY
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 320 }} aria-label="Iot Device table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                S.N
              </TableCell>
              <TableCell>Device Id</TableCell>
              <TableCell>Device Name</TableCell>
              <TableCell>Board Id</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ownedIotDevices?.map((iotDevice, index) => (
              <TableRow key={index}>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                  {index + 1}
                </TableCell>
                <TableCell>{iotDevice.id}</TableCell>
                <TableCell>
                  {iotDevice.iot_device_details?.name || "-"}
                </TableCell>
                <TableCell>{iotDevice.board_id || "-"}</TableCell>
                <TableCell>
                  <Box sx={{ position: "relative" }}>
                    <Button
                      sx={{ padding: 0 }}
                      disabled={apiKeyIsFetching}
                      onClick={() => handleApiKeyButton(iotDevice.id)}
                    >
                      Request Api-key
                    </Button>
                    {apiKeyIsFetching && iotDevice.id === deviceId && (
                      <CircularProgress
                        color="primary"
                        size={30}
                        thickness={5}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ApiKeyDialog
        open={open}
        onClose={handleClose}
        apiKey={apiKey?.api_key}
        deviceId={deviceId}
      />
    </>
  );
}

export default IotDeviceApiSetting;
