import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useAuthStore from "../../../store/authStore";
import ErrorReload from "../../ErrorReload";
import LoadingSpinner from "../../LoadingSpinner";
import CompanyRow from "./CompanyRow";
import CustomNoRowsOverlay from "../../datagrid/CustomNoRowsOverlay";

function MobileManageCompanies() {
  const { data: companies, isError, isLoading, refetch } = useGetAllCompany();
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Company details!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner />;

  if (companies.length === 0) return <CustomNoRowsOverlay text="No Company" />;

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
            {isUserSuperAdmin && <TableCell>User Limit</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <CompanyRow key={index} row={company} index={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageCompanies;
