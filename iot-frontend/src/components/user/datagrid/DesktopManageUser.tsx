import { useEffect } from "react";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import useAuthStore from "../../../store/authStore";
import useUserDataGrid from "../../../hooks/muiDataGrid/useUserDataGrid";
import useUserDataGridStore from "../../../store/datagrid/userDataGridStore";
import UserColumns from "./UserColumns";
import ConfirmDialog from "../../datagrid/ConfirmDialog";
import DeleteDialog from "../../datagrid/DeleteDialog";
import BaseMuiGrid from "../../datagrid/BaseMuiGrid";
import ErrorReload from "../../ErrorReload";

function DesktopManageUser() {
  // to handle user do work in backend
  const { data, isError, isSuccess, isLoading, refetch } = useGetAllUser();
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);

  const {
    processRowUpdate,
    handleRowModesModelChange,
    handleDialogYesButton,
    handleDialogNoButton,
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
    handleProcessRowUpdateError,
  } = useUserDataGrid();

  const rows = useUserDataGridStore((state) => state.rows);
  const deleteRow = useUserDataGridStore((state) => state.deleteRow);
  const setRows = useUserDataGridStore((state) => state.setRows);
  const setRowModesModel = useUserDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useUserDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useUserDataGridStore(
    (state) => state.promiseArguments
  );

  useEffect(() => {
    if (isSuccess && rows.length === 0) {
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  // columns for the data grid for the Users
  const columns = UserColumns({ users: data });

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the users List!!!"
        handleRefetch={() => refetch()}
      />
    );
  return (
    <>
      <BaseMuiGrid
        rows={rows}
        columns={columns}
        isLoading={isLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns status and traderName, the other columns will remain visible
              serial_number: false,
              date_joined: false,
              company: isUserSuperAdmin || false,
            },
          },
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rowModesModel={rowModesModel}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        processRowUpdate={processRowUpdate}
        handleRowModesModelChange={handleRowModesModelChange}
        handleProcessRowUpdateError={handleProcessRowUpdateError}
      />
      <ConfirmDialog
        type="User"
        promiseArguments={promiseArguments}
        handleYesButton={handleDialogYesButton}
        handleNoButton={handleDialogNoButton}
      />
      <DeleteDialog
        handleYesButton={handleDialogDeleteYesButton}
        handleNoButton={handleDialogDeleteNoButton}
        type="User"
        open={!!deleteRow}
        name={deleteRow?.username}
      />
    </>
  );
}

export default DesktopManageUser;
