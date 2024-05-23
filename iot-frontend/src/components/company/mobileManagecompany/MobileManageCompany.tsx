import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import LoadingSpinner from "../../LoadingSpinner";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import CompanyRow from "./CompanyRow";
import ErrorReload from "../../ErrorReload";

function MobileManageCompanies() {
  const { data: companies, isError, isLoading, refetch } = useGetAllCompany();

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
            <TableCell>User Limit</TableCell>
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
