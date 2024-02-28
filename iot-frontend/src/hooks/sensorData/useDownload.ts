import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import { IDownloadFormInputs } from "../../components/index/ZodSchema/DownloadFormSchema";
import dayjs from "dayjs";
import { useState } from "react";

function useDownload() {
  const axiosInstance = useAxios();
  const [isLoading, setIsLoading] = useState(false);

  const downloadSensorData = async (formData: IDownloadFormInputs) => {
    const params = new URLSearchParams();
    Object.entries(formData).map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length !== 0) params.append(key, value.join());
      } else if (value instanceof Date) {
        params.append(key, dayjs(value).format("YYYY-MM-DD"));
      } else if (value) params.append(key, value);
    });

    return axiosInstance
      .get<Blob>("sensor-data/download/", {
        params: params,
        responseType: "blob",
      })
      .then((response) => {
        if (response.status === 204) {
          enqueueSnackbar("No data is available to download", {
            variant: "info",
          });
          return;
        }
        // the response is a Blob type (binary data)
        const blobType =
          formData.file_type === "excel" ? "application/ms-excel" : "text/csv";
        const blob = new Blob([response.data], {
          type: blobType,
        });

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers["content-disposition"];
        const match =
          contentDisposition && contentDisposition.match(/filename=(.*)/);
        const filename = match
          ? match[1]
          : formData.file_type === "excel"
          ? "sensor_data.xlsx"
          : "sensor_data.csv";

        // Create a link element, set the href to the Blob, trigger a click, and remove the link
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(async (error) => {
        const statusCode = error.response.status;
        if (statusCode === 401) {
          enqueueSnackbar("Authentication credentials were not provided.", {
            variant: "error",
          });
        } else if (statusCode === 400) {
          const responseText = await error.response.data.text();
          const responseObj = JSON.parse(responseText);
          enqueueSnackbar(responseObj.error, {
            variant: "error",
          });
        }
      })
      .finally(() => setIsLoading(false));
  };

  return { downloadSensorData, isLoading, setIsLoading };
}

export default useDownload;
