/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyViewProfile = lazy(() => import("../pages/ViewProfile"));
const LazyIndex = lazy(() => import("../pages/Index"));

const allUserRoutes: RouteObject[] = [
  { index: true, element: <SuspenseFallback children={<LazyIndex />} /> },
  {
    path: "/profile",
    element: <SuspenseFallback children={<LazyViewProfile />} />,
  },
];

export default allUserRoutes;
