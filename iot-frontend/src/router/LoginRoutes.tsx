/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import SuspenseFallback from "../components/SuspenseFallback";
import { RouteObject } from "react-router-dom";

const LazyIsUserAuthenticated = lazy(
  () => import("../components/IsUserAuthenticated")
);
const LazyLoginPage = lazy(() => import("../pages/LoginPage"));

const loginRoutes: RouteObject = {
  element: <SuspenseFallback children={<LazyIsUserAuthenticated />} />,
  children: [
    {
      path: "/login",
      element: <SuspenseFallback children={<LazyLoginPage />} />,
    },
  ],
};

export default loginRoutes;
