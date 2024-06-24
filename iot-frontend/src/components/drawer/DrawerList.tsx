import ApartmentIcon from "@mui/icons-material/Apartment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DevicesIcon from "@mui/icons-material/Devices";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import PeopleIcon from "@mui/icons-material/People";
import SensorsIcon from "@mui/icons-material/Sensors";
import ShareIcon from "@mui/icons-material/Share";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import useAuthStore from "../../store/authStore";
import CompanyList from "../company/CompanyList";
import AdminUsersList from "../user/AdminUsersList";
import DrawerListItem from "./DrawerListItem";

const DrawerList = () => {
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  return (
    <List>
      <DrawerListItem icon={<DashboardIcon />} linkto="/" text="Dashboard" />
      <Divider component="li" />
      {(isUserSuperAdmin || isUserDealer) && (
        <>
          <DrawerListItem
            icon={<PeopleIcon />}
            text="Admin Users"
            isDropdown={true}
            dropDownNode={<AdminUsersList />}
          />

          <Divider component="li" />
        </>
      )}

      {(isUserSuperAdmin || isUserDealer) && (
        <>
          <DrawerListItem
            icon={<ApartmentIcon />}
            text="Company"
            isDropdown={true}
            dropDownNode={<CompanyList />}
          />

          <Divider component="li" />
        </>
      )}

      <DrawerListItem
        icon={<PeopleIcon />}
        linkto="/manage-users"
        text="Manage Users"
      />
      <Divider component="li" />

      {(isUserSuperAdmin || isUserDealer) && (
        <>
          <DrawerListItem
            icon={<ApartmentIcon />}
            text="Manage Companies"
            linkto="/manage-companies"
          />
          <Divider component="li" />

          <DrawerListItem
            icon={<DevicesIcon />}
            linkto="/iot-devices"
            text="Manage Iot Device"
          />
          <Divider component="li" />
        </>
      )}
      {isUserSuperAdmin && (
        <>
          <DrawerListItem
            icon={<SensorsIcon />}
            linkto="/sensors"
            text="Manage Sensor"
          />
          <Divider component="li" />
          <DrawerListItem
            icon={<ManageAccountsIcon />}
            linkto="/manage-dealers"
            text="Manage Dealers"
          />
          <Divider component="li" />
          <DrawerListItem
            icon={<ShareIcon />}
            linkto="/send-liveData"
            text="Send LiveData"
          />
          <DrawerListItem
            icon={<MiscellaneousServicesIcon />}
            linkto="/miscellaneous-settings"
            text="Miscellaneous Setting"
          />
        </>
      )}
    </List>
  );
};

export default DrawerList;
