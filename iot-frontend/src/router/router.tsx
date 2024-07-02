/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject, createBrowserRouter } from "react-router-dom";
import App from "../App";
import SuspenseFallback from "../components/SuspenseFallback";
import ProtectedAppLayout from "../layout/ProtectedAppLayout";
import allUserRoutes from "./AllUserRoutes";
import companySuperAdminRoutes from "./CompanySuperAdminRoutes";
import dealerRoutes from "./DealerRoutes";
import loginRoutes from "./LoginRoutes";
import superAdminAndAdminRoutes from "./SuperAdminAndAdminRoutes";
import superAdminAndDealerRoutes from "./SuperAdminAndDealerRoutes";
import superAdminRoutes from "./SuperAdminRoutes";
import accountRoutes from "./accountRoutes";

const LazyDashboard = lazy(() => import("../components/dashboard/Dashboard"));
const LazyError404Page = lazy(() => import("../components/Error404Page"));

const indexRouter: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    errorElement: <SuspenseFallback children={<LazyError404Page />} />,
    children: [
      {
        element: <ProtectedAppLayout />,
        children: [
          {
            element: <SuspenseFallback children={<LazyDashboard />} />,
            children: [
              ...allUserRoutes,
              ...superAdminRoutes,
              ...superAdminAndDealerRoutes,
              ...superAdminAndAdminRoutes,
              ...dealerRoutes,
              ...companySuperAdminRoutes,
            ],
          },
          {
            ...loginRoutes,
          },
        ],
      },

      ...accountRoutes,
    ],
  },
];

const router = createBrowserRouter(indexRouter);

export default router;
