import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useState } from "react";
import AddSendLiveData from "../AddSendLiveData";

function SendLiveDataToolBar() {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  return (
    <>
      <GridToolbarContainer>
        <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
          Add Endpoint
        </Button>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
      <AddSendLiveData open={open} setOpen={setOpen} />
    </>
  );
}

export default SendLiveDataToolBar;
