/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import UserGroups from "../constants/userGroups";
import PrivateRoute from "../layout/PrivateRoute";
import SuspenseFallback from "../components/SuspenseFallback";

const LazySendLiveData = lazy(() => import("../pages/SendLiveData"));
const LazyManageSensors = lazy(() => import("../pages/ManageSensors"));
const LazyManageDealers = lazy(() => import("../pages/ManageDealers"));
const LazyMiscellaneousSettings = lazy(
  () => import("../pages/MiscellaneousSettings")
);

const superAdminRoutes: RouteObject[] = [
  {
    element: <PrivateRoute hasPermission={[UserGroups.superAdminGroup]} />,
    children: [
      {
        path: "/sensors",
        element: <SuspenseFallback children={<LazyManageSensors />} />,
      },
      {
        path: "/manage-dealers",
        element: <SuspenseFallback children={<LazyManageDealers />} />,
      },
      {
        path: "/send-liveData",
        element: <SuspenseFallback children={<LazySendLiveData />} />,
      },
      {
        path: "/miscellaneous-settings",
        element: <SuspenseFallback children={<LazyMiscellaneousSettings />} />,
      },
    ],
  },
];

export default superAdminRoutes;
