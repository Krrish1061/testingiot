import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useState } from "react";
import ChangeIotDeviceAssociation from "../ChangeIotDeviceAssociation";
import useAuthStore from "../../../store/authStore";
import ManageUnassociatedDevice from "../ManageUnassociatedDevice";

function IotDeviceToolBar() {
  const [open, setOpen] = useState(false);
  const [openUnassociatedDevice, setOpenUnassociatedDevice] = useState(false);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const handleClick = () => setOpen(true);
  const handleUnassociatedDeviceClick = () => setOpenUnassociatedDevice(true);
  return (
    <>
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button color="primary" startIcon={<EditIcon />} onClick={handleClick}>
          Change Iot Device Association
        </Button>
        {isUserSuperAdmin && (
          <Button
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleUnassociatedDeviceClick}
          >
            Manage Unassociated Iot Device
          </Button>
        )}
      </GridToolbarContainer>
      <ChangeIotDeviceAssociation open={open} setOpen={setOpen} />
      <ManageUnassociatedDevice
        open={openUnassociatedDevice}
        setOpen={setOpenUnassociatedDevice}
      />
    </>
  );
}

export default IotDeviceToolBar;
