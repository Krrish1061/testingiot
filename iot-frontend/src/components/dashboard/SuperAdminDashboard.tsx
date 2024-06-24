import ApartmentIcon from "@mui/icons-material/Apartment";
import DevicesIcon from "@mui/icons-material/Devices";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PeopleIcon from "@mui/icons-material/People";
import SensorsIcon from "@mui/icons-material/Sensors";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import UserGroups from "../../constants/userGroups";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllDealer from "../../hooks/dealer/useGetAllDealer";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetAllSensors from "../../hooks/sensor/useGetAllSensors";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import useDrawerStore from "../../store/drawerStore";
import DashboardCard from "./DashboardCard";

function SuperAdminDashboard() {
  const { data: userList } = useGetAllUser();
  const { data: sensorList } = useGetAllSensors();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: companyList } = useGetAllCompany();
  const { data: dealerList } = useGetAllDealer();
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);

  const sensorCount = useMemo(() => sensorList?.length, [sensorList]);
  const iotDeviceCount = useMemo(() => iotDeviceList?.length, [iotDeviceList]);
  const companyCount = useMemo(() => companyList?.length, [companyList]);
  const dealerCount = useMemo(() => dealerList?.length, [dealerList]);
  const userCount = useMemo(() => userList?.length, [userList]);

  const superAdminUserCount = useMemo(
    () =>
      userList?.filter((user) =>
        user.groups.includes(UserGroups.superAdminGroup)
      ).length,
    [userList]
  );

  const totalAdminUserCount = useMemo(
    () =>
      userList?.filter((user) => user.groups.includes(UserGroups.adminGroup))
        .length,
    [userList]
  );

  const companyAdminUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          user.is_associated_with_company &&
          user.groups.includes(UserGroups.adminGroup)
      ).length,
    [userList]
  );

  const adminUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          !user.is_associated_with_company &&
          user.groups.includes(UserGroups.adminGroup)
      ).length,
    [userList]
  );

  const totalModeratorUserCount = useMemo(
    () =>
      userList?.filter((user) =>
        user.groups.includes(UserGroups.moderatorGroup)
      ).length,
    [userList]
  );

  const companyModeratorUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          user.is_associated_with_company &&
          user.groups.includes(UserGroups.moderatorGroup)
      ).length,
    [userList]
  );

  const moderatorUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          !user.is_associated_with_company &&
          user.groups.includes(UserGroups.moderatorGroup)
      ).length,
    [userList]
  );

  const totalViewerUserCount = useMemo(
    () =>
      userList?.filter((user) => user.groups.includes(UserGroups.viewerGroup))
        .length,
    [userList]
  );

  const companyViewerUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          user.is_associated_with_company &&
          user.groups.includes(UserGroups.viewerGroup)
      ).length,
    [userList]
  );

  const viewerUserCount = useMemo(
    () =>
      userList?.filter(
        (user) =>
          user.is_associated_with_company &&
          user.groups.includes(UserGroups.viewerGroup)
      ).length,
    [userList]
  );

  const cardData = [
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: "Total IotDevice",
      content: iotDeviceCount,
    },
    {
      icon: <SensorsIcon sx={{ fontSize: 40 }} />,
      title: "Total Sensor",
      content: sensorCount,
    },
    {
      icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      title: "Total Company",
      content: companyCount,
    },
    {
      icon: <ManageAccountsIcon sx={{ fontSize: 40 }} />,
      title: "Total Dealer",
      content: dealerCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Total Users",
      content: userCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "SuperAdmin User",
      content: superAdminUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Total Admin User",
      content: totalAdminUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Company Admin User",
      content: companyAdminUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Admin User",
      content: adminUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Total Moderator User",
      content: totalModeratorUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Company Moderator User",
      content: companyModeratorUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Moderator User",
      content: moderatorUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Total Viewer User",
      content: totalViewerUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Company Viewer User",
      content: companyViewerUserCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Viewer User",
      content: viewerUserCount,
    },
  ];

  return (
    <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
      {cardData.map((data, index) => (
        <Grid item key={index} xs={2} sm={isDrawerOpen ? 4 : 2} md={2}>
          <DashboardCard
            headerIcon={data.icon}
            title={data.title}
            content={data.content}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default SuperAdminDashboard;
