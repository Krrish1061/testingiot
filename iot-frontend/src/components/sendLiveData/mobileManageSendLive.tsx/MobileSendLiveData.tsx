import useGetAllSendLiveData from "../../../hooks/sendLiveData/useGetAllSendLiveData";
import LoadingSpinner from "../../LoadingSpinner";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SendLiveDataRow from "./SendLiveDataRow";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import AddSendLiveData from "../AddSendLiveData";

function MobileSendLiveData() {
  const {
    data: sendLiveDataList,
    isError,
    isLoading,
  } = useGetAllSendLiveData();

  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);

  if (isError) return <Box> Error Occurred</Box>;
  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Stack direction="row" justifyContent="flex-end">
        <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
          Add Endpoint
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell size="small" sx={{ paddingX: 0 }}></TableCell>
              <TableCell size="small" sx={{ paddingLeft: 0, paddingRight: 1 }}>
                S.N
              </TableCell>
              <TableCell>Company</TableCell>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sendLiveDataList.map((sendLiveData, index) => (
              <SendLiveDataRow key={index} row={sendLiveData} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddSendLiveData open={open} setOpen={setOpen} />
    </>
  );
}

export default MobileSendLiveData;
