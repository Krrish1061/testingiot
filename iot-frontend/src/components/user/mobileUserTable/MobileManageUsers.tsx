import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import LoadingSpinner from "../../LoadingSpinner";
import UserRow from "./UserRow";
import ErrorReload from "../../ErrorReload";

function MobileManageUsers() {
  const { data: users, isError, isLoading, refetch } = useGetAllUser();

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the users List!!!"
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
            <TableCell size="small" sx={{ paddingX: 0 }}>
              S.N
            </TableCell>
            <TableCell>Avatar</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>UserType</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <UserRow key={index} row={user} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageUsers;
