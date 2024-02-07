import Cookies from "js-cookie";
import { axiosPrivate } from "../api/axios";

interface csrf {
  csrfToken: string;
}

async function getCsrf() {
  const csrfToken = Cookies.get("csrftoken");

  if (csrfToken) return csrfToken;

  const response = await axiosPrivate
    .get<csrf>("account/csrf/")
    .then((res) => res.data.csrfToken)
    .catch(() => {
      // catch network error
      return null;
    });

  return response;
}

export default getCsrf;
