import User from "../../entities/User";
import useUserDataGridStore from "../../store/datagrid/userDataGridStore";
import useDeleteUser from "../users/useDeleteUser";
import useEditUser from "../users/useEditUser";
import useDataGrid from "./useDataGrid";

function useUserDataGrid() {
  const { mutateAsync: editUser } = useEditUser();
  const { mutate: deleteUser } = useDeleteUser();
  return useDataGrid<User>({
    useDataGridStore: useUserDataGridStore,
    editRow: editUser,
    deleteRow: deleteUser,
  });
}

export default useUserDataGrid;
