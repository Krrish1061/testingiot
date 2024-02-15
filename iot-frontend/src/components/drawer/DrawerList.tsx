import List from "@mui/material/List";
import DevicesIcon from "@mui/icons-material/Devices";
import PeopleIcon from "@mui/icons-material/People";
import SensorsIcon from "@mui/icons-material/Sensors";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DrawerListItem from "./DrawerListItem";
import Divider from "@mui/material/Divider";
import useAuthStore from "../../store/authStore";
import UserGroups from "../../constants/userGroups";
import CompanyList from "../company/CompanyList";
import AdminUsersList from "../user/AdminUsersList";
import ShareIcon from "@mui/icons-material/Share";

const DrawerList = () => {
  const user = useAuthStore((state) => state.user);
  const isUserSuperAdmin = user?.groups.includes(UserGroups.superAdminGroup);
  const isUserCompanySuperAdmin = user?.groups.includes(
    UserGroups.companySuperAdminGroup
  );
  return (
    <List>
      <DrawerListItem icon={<DashboardIcon />} linkto="/" text="Dashboard" />
      <Divider component="li" />
      {isUserSuperAdmin && (
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

      {(isUserCompanySuperAdmin || isUserSuperAdmin) && (
        <>
          <DrawerListItem
            icon={<ApartmentIcon />}
            text="Company"
            isDropdown={isUserSuperAdmin ? true : false}
            linkto={isUserCompanySuperAdmin ? "/company-profile" : undefined}
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

      {isUserSuperAdmin && (
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

          <DrawerListItem
            icon={<SensorsIcon />}
            linkto="/sensors"
            text="Manage Sensor"
          />
          <Divider component="li" />
          <DrawerListItem
            icon={<ShareIcon />}
            linkto="/send-liveData"
            text="Send LiveData"
          />
        </>
      )}
    </List>
  );
};

export default DrawerList;
