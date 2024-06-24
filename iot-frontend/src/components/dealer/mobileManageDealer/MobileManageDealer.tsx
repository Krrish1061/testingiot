import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useGetAllDealer from "../../../hooks/dealer/useGetAllDealer";
import ErrorReload from "../../ErrorReload";
import LoadingSpinner from "../../LoadingSpinner";
import DealerRow from "./DealerRow";

function MobileManageDealer() {
  const { data: dealerList, isError, isLoading, refetch } = useGetAllDealer();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Company details!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner />;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell size="small" sx={{ paddingX: 0 }}></TableCell>
            <TableCell size="small" sx={{ paddingLeft: 0, paddingRight: 1 }}>
              S.N
            </TableCell>
            <TableCell>Avatar</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>User/Company Limit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dealerList.map((dealer, index) => (
            <DealerRow key={index} row={dealer} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageDealer;
