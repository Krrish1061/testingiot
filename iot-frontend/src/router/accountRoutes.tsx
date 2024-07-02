/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const LazyForgotPasswordPage = lazy(
  () => import("../pages/ForgotPasswordPage")
);
const LazyPasswordReset = lazy(() => import("../pages/PasswordReset"));
const LazyVerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const LazyUpdateEmail = lazy(() => import("../pages/UpdateEmail"));
const LazySetUserPassword = lazy(() => import("../pages/SetUserPassword"));

const accountRoutes: RouteObject[] = [
  { path: "/forget-password", element: <LazyForgotPasswordPage /> },
  { path: "/password-reset/:username/:token", element: <LazyPasswordReset /> },
  { path: "/verify-email/:username/:token", element: <LazyVerifyEmail /> },
  { path: "/change-email/:username/:token", element: <LazyUpdateEmail /> },
  {
    path: "/set-user-password/:username/:token",
    element: <LazySetUserPassword />,
  },
];

export default accountRoutes;
