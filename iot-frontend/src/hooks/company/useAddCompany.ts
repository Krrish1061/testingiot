import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import useAxios from "../../api/axiosInstance";
import Company from "../../entities/Company";
import useCompanyDataGridStore from "../../store/datagrid/companyDataGridStore";
import slugify from "../../utilis/slugifyName";

interface IFormInputs {
  email: string;
  name: string;
  user_limit: number;
}

interface IError {
  errors?: string[];
  error?: string;
  name?: string[];
  email?: string[];
}

interface AddCompanyContext {
  previousCompanyList: Company[];
  newCompanyId: number;
}

function useAddCompany() {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const rows = useCompanyDataGridStore((state) => state.rows);
  const setRows = useCompanyDataGridStore((state) => state.setRows);

  const addCompany = async (data: IFormInputs) =>
    axiosInstance.post<Company>("company/", data).then((res) => res.data);

  return useMutation<
    Company,
    AxiosError<IError>,
    IFormInputs,
    AddCompanyContext
  >({
    mutationFn: addCompany,
    onMutate: (formInputs: IFormInputs) => {
      const previousCompanyList =
        queryClient.getQueryData<Company[]>(["companyList"]) || [];

      const newCompanyId = Math.floor(Math.random() * 9000) + 1000;

      const newCompany: Company = {
        ...formInputs,
        id: newCompanyId,
        dealer: null,
        slug: slugify(formInputs.name),
        created_at: Date.now().toLocaleString(),
      };

      queryClient.setQueryData<Company[]>(["companyList"], (company = []) => [
        ...company,
        newCompany,
      ]);

      return { previousCompanyList, newCompanyId };
    },
    onSuccess: (newCompany, _formsInputs, context) => {
      enqueueSnackbar("Company sucessfully Created", { variant: "success" });
      if (!context) return;
      queryClient.setQueryData<Company[]>(["companyList"], (companies) =>
        companies?.map((company) =>
          company.id === context.newCompanyId ? newCompany : company
        )
      );

      if (rows.length !== 0) setRows([...rows, newCompany]);
    },
    onError: (error, _formsInputs, context) => {
      let errorMessage = "";
      if (error.code === "ERR_NETWORK") {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data.error ||
          (error.response?.data.errors && error.response?.data.errors[0]) ||
          (error.response?.data.email && error.response.data.email[0]) ||
          (error.response?.data.name && error.response.data.name[0]) ||
          "Failed to Create Company";
      }
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });

      if (!context) return;
      queryClient.setQueryData<Company[]>(
        ["companyList"],
        context.previousCompanyList
      );
      if (rows.length !== 0) {
        setRows(rows.filter((row) => row.id !== context.newCompanyId));
      }
    },
  });
}

export default useAddCompany;
