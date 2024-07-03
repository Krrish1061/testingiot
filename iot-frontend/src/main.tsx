import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import disableReactDevTools from "./DisableReactDevTools";
import "./index.css";
import router from "./router/router";

if (process.env.NODE_ENV === "production") disableReactDevTools();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      cacheTime: 30 * 60 * 1000, // 30 min
      staleTime: 30 * 60 * 1000, // 30 min
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>
);
