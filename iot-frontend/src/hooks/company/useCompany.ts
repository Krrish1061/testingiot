import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import useAuthStore from "../../store/authStore";
import useCompanyStore from "../../store/companyStore";

function useCompany() {
  const axiosInstance = useAxios();
  const user = useAuthStore((state) => state.user);
  const setCompany = useCompanyStore((state) => state.setCompany);

  const fetchCompanies = () =>
    axiosInstance
      .get<Company>(`/company/${user?.company}/`)
      .then((res) => res.data);

  return useQuery<Company, AxiosError, Company>({
    queryKey: [`${user?.company}`],
    queryFn: fetchCompanies,
    onSuccess: (company) => setCompany(company),
  });
}

export default useCompany;
