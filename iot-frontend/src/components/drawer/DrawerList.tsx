import List from "@mui/material/List";
import DevicesIcon from "@mui/icons-material/Devices";
import PeopleIcon from "@mui/icons-material/People";
import SensorsIcon from "@mui/icons-material/Sensors";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DrawerListItem from "./DrawerListItem";
import Divider from "@mui/material/Divider";

const DrawerList = () => {
  return (
    <List>
      <DrawerListItem
        icon={<DashboardIcon />}
        linkto="/"
        text="Dashboard"
        autoFocus
      />
      <Divider component="li" />

      <DrawerListItem
        icon={<ApartmentIcon />}
        text="Company"
        isDropdown={true}
      />

      <Divider component="li" />

      <DrawerListItem
        icon={<PeopleIcon />}
        linkto="/manage-users"
        text="Manage Users"
      />
      <Divider component="li" />

      <DrawerListItem
        icon={<ApartmentIcon />}
        text="Manage Company"
        isDropdown={true}
      />
      <Divider component="li" />

      <DrawerListItem
        icon={<DevicesIcon />}
        linkto="/iot-devices"
        text="Manage Iot Device"
      />
      <Divider component="li" />

      <DrawerListItem
        icon={<SensorsIcon />}
        linkto="/sensors"
        text="Manage Sensor"
      />
    </List>
  );
};

export default DrawerList;
