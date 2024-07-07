/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import SuspenseFallback from "../components/SuspenseFallback";

const LazyForgotPasswordPage = lazy(
  () => import("../pages/ForgotPasswordPage")
);
const LazyPasswordReset = lazy(() => import("../pages/PasswordReset"));
const LazyVerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const LazyUpdateEmail = lazy(() => import("../pages/UpdateEmail"));
const LazySetUserPassword = lazy(() => import("../pages/SetUserPassword"));

const accountRoutes: RouteObject[] = [
  {
    path: "/forget-password",
    element: <SuspenseFallback children={<LazyForgotPasswordPage />} />,
  },
  {
    path: "/password-reset/:username/:token",
    element: <SuspenseFallback children={<LazyPasswordReset />} />,
  },
  {
    path: "/verify-email/:username/:token",
    element: <SuspenseFallback children={<LazyVerifyEmail />} />,
  },
  {
    path: "/change-email/:username/:token",
    element: <SuspenseFallback children={<LazyUpdateEmail />} />,
  },
  {
    path: "/set-user-password/:username/:token",
    element: <LazySetUserPassword />,
  },
];

export default accountRoutes;
