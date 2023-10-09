import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../api/axiosInstance";
import Company from "../entities/Company";

function useCompanies() {
  const axiosInstance = useAxios();

  const fetchCompanies = () =>
    axiosInstance.get<Company[]>("/company/all").then((res) => res.data);

  return useQuery<Company[], AxiosError>({
    queryKey: ["companyList"],
    queryFn: fetchCompanies,
  });
}

export default useCompanies;
