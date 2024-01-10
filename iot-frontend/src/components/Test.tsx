import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import useGetAllUser from "../hooks/useGetAllUser";
import User from "../entities/User";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ImageAvatar from "./ImageAvatar";
import LoadingSpinner from "./LoadingSpinner";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
// import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";

interface Props {
  row: User;
}

function Row({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState<string>(row.company || "N/A");
  const [email, setEmail] = useState<string | undefined>(row.email);
  const [isEditMode, setIsEditMode] = useState(false);
  return (
    <>
      <TableRow onClick={() => setOpen(!open)}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <ImageAvatar
            imgUrl={row.profile?.profile_picture}
            altText={`${row.profile?.first_name} ${row?.profile?.last_name}`}
          />
        </TableCell>
        <TableCell align="left">{row.username}</TableCell>
        <TableCell align="left">{row.type}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 0.5, width: 1 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" gutterBottom component="h2">
                  {row.profile?.first_name} {row.profile?.last_name}
                </Typography>
                <Box>
                  {!isEditMode ? (
                    <>
                      <IconButton onClick={() => setIsEditMode(true)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton>
                        <SaveIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => setIsEditMode(false)}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Stack>

              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                paddingLeft={2}
              >
                <Typography
                  component={InputLabel}
                  variant="h6"
                  fontSize={16}
                  color="inherit"
                  // textAlign="start"
                  htmlFor="email"
                  width={80}
                >
                  Email:
                </Typography>
                <TextField
                  id="email"
                  type="text"
                  variant="standard"
                  value={email}
                  InputProps={{
                    disableUnderline: !isEditMode,
                    readOnly: !isEditMode,
                  }}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </Stack>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                paddingLeft={2}
              >
                <Typography
                  component={InputLabel}
                  fontSize={16}
                  variant="h6"
                  color="inherit"
                  htmlFor="company"
                  width={80}
                >
                  Company:
                </Typography>
                <TextField
                  id="company"
                  type="text"
                  variant="standard"
                  value={company}
                  InputProps={{
                    disableUnderline: !isEditMode,
                    readOnly: !isEditMode,
                  }}
                  onChange={(e) => {
                    setCompany(e.target.value);
                  }}
                />
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function Test() {
  const { data, isError, isLoading } = useGetAllUser();

  if (isError) return <Box> Error Occurred</Box>;
  if (isLoading) return <LoadingSpinner />;
  console.log(data);

  return (
    <Box sx={{ backgroundColor: "blue", width: 1 }}>
      <TableContainer
        component={Paper}
        sx={{ overflow: "visible", width: 1, p: 0, m: 0 }}
      >
        <Table sx={{ width: 1, p: 0, m: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Avatar</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>UserType</TableCell>
              {/* <TableCell>Email</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.map((row: User, index) => <Row key={index} row={row} />)}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Test;
