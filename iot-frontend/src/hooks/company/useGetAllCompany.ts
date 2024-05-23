import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";

function useGetAllCompany(isEnabled: boolean = true) {
  const axiosInstance = useAxios();

  const fetchCompanies = () =>
    axiosInstance.get<Company[]>("/company/all").then((res) => res.data);

  return useQuery<Company[], AxiosError>({
    queryKey: ["companyList"],
    queryFn: fetchCompanies,
    enabled: isEnabled,
  });
}

export default useGetAllCompany;
