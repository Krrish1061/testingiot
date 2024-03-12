import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useState } from "react";
import ChangeSensorName from "../ChangeSensorName";

function SensorToolBar() {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  return (
    <>
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button color="primary" startIcon={<EditIcon />} onClick={handleClick}>
          Change Sensor Name
        </Button>
      </GridToolbarContainer>
      <ChangeSensorName open={open} setOpen={setOpen} />
    </>
  );
}

export default SensorToolBar;
