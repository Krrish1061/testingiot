import ApartmentIcon from "@mui/icons-material/Apartment";
import DevicesIcon from "@mui/icons-material/Devices";
import PeopleIcon from "@mui/icons-material/People";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import useGetAllIotDevice from "../../hooks/iotDevice/useGetAllIotDevice";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import useDrawerStore from "../../store/drawerStore";
import DashboardCard from "./DashboardCard";

function DealerUserDashboard() {
  const { data: userList } = useGetAllUser();
  const { data: iotDeviceList } = useGetAllIotDevice();
  const { data: companyList } = useGetAllCompany();
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);

  const iotDeviceCount = useMemo(() => iotDeviceList?.length, [iotDeviceList]);
  const companyCount = useMemo(() => companyList?.length, [companyList]);
  const userCount = useMemo(() => userList?.length, [userList]);

  const totalUnAssociatedIotDevice = useMemo(
    () =>
      iotDeviceList?.filter(
        (iotDevice) => !iotDevice.user && !iotDevice.company
      ).length,
    [iotDeviceList]
  );

  const cardData = [
    {
      icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      title: "Total Company",
      content: companyCount,
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Total Users",
      content: userCount,
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: "Total IotDevice",
      content: iotDeviceCount,
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: "UnAssociated IotDevice",
      content: totalUnAssociatedIotDevice,
    },
  ];

  return (
    <Grid container spacing={4} columns={{ xs: 4, sm: 8, md: 12 }}>
      {cardData.map((data, index) => (
        <Grid item key={index} xs={2} sm={isDrawerOpen ? 4 : 2} md={3}>
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

export default DealerUserDashboard;
