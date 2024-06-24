import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useState } from "react";
import ChangeIotDeviceAssociation from "../ChangeIotDeviceAssociation";

function IotDeviceToolBar() {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  return (
    <>
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button color="primary" startIcon={<EditIcon />} onClick={handleClick}>
          Change Iot Device Association
        </Button>
      </GridToolbarContainer>
      <ChangeIotDeviceAssociation open={open} setOpen={setOpen} />
    </>
  );
}

export default IotDeviceToolBar;
