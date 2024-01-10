import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LoadingSpinner from "../../LoadingSpinner";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import CompanyRow from "./CompanyRow";

function MobileManageCompanies() {
  const { data: companies, isError, isLoading } = useGetAllCompany();

  if (isError) return <Box> Error Occurred</Box>;
  if (isLoading) return <LoadingSpinner />;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>User Limit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company, index) => (
            <CompanyRow key={index} row={company} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default MobileManageCompanies;
