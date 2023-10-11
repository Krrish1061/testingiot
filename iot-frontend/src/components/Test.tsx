import useGetAllUser from "../hooks/useGetAllUser";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridColDef,
  GridRowModes,
  GridActionsCellItem,
  DataGrid,
} from "@mui/x-data-grid";
import { useEffect, useMemo, useRef } from "react";
import User from "../entities/User";
import useEditUser from "../hooks/useEditUser";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import useMuiDataGrid from "../hooks/useMuiDataGrid";
import useUserDataGridStore from "../store/userDataGridStore";
import muiDataGridCommonFunction from "../constants/muiDataGrid/commonFunction";

function ManageUser() {
  console.log("count me");
  const { data, isError, isSuccess } = useGetAllUser();
  const { mutateAsync: editUser, isLoading: mutatingUser } = useEditUser();

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
    processRowUpdate,
    handleDialogNoButton,
    handleDialogYesButton,
    handleRowModesModelChange,
    handleProcessRowUpdateError,
  } = useMuiDataGrid();

  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);
  const setRowModesModel = useUserDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useUserDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useUserDataGridStore(
    (state) => state.promiseArguments
  );
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    noButtonRef.current?.focus();
  };

  const renderConfirmDialog = () => {
    if (!promiseArguments) {
      return null;
    }

    // const { newRow, oldRow } = promiseArguments;
    // const mutation = muiDataGridCommonFunction.computeMutation(newRow, oldRow);

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEntered }}
        open={!!promiseArguments}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent dividers>
          {`Pressing 'Yes' will Confirm the changes made to the User.`}
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleDialogNoButton}>
            No
          </Button>
          <Button onClick={() => handleDialogYesButton<User>(editUser)}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // use memo hook to remeber in each render
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "id", headerName: "ID", align: "center", headerAlign: "center" },
      {
        field: "username",
        headerName: "Username",
        minWidth: 100,
        flex: 1,
        editable: false,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "email",
        headerName: "Email",
        minWidth: 100,
        flex: 1,
        editable: true,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "type",
        headerName: "UserType",
        minWidth: 110,
        flex: 1,
        editable: true,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "company",
        headerName: "Company",
        minWidth: 100,
        flex: 1,
        editable: true,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "is_active",
        headerName: "is Active",
        editable: true,
        type: "boolean",
      },
      {
        field: "date_joined",
        headerName: "Created at",
        editable: false,
        flex: 1,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        align: "center",
        headerAlign: "center",
        cellClassName: "actions",
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                disabled={mutatingUser}
                sx={{
                  color: "primary.main",
                }}
                onClick={handleSaveClick(id)}
              />,

              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                sx={{
                  color: "error.main",
                }}
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              sx={{
                color: "info.main",
              }}
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              sx={{
                color: "error.main",
              }}
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          ];
        },
      },
    ],

    [
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handleSaveClick,
      mutatingUser,
      rowModesModel,
    ]
  );

  useEffect(() => {
    if (isSuccess) {
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (isError) return <Box>Error Ocurred</Box>;
  return (
    <Box
      sx={{
        width: 1,
      }}
    >
      {!isSuccess ? (
        <Box>ManageUser</Box>
      ) : (
        <Box>
          {renderConfirmDialog()}
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            editMode="row"
            disableColumnSelector
            disableRowSelectionOnClick
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={muiDataGridCommonFunction.handleRowEditStop}
            onRowEditStart={muiDataGridCommonFunction.handleRowEditStart}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            slotProps={{
              toolbar: { setRows, setRowModesModel },
            }}
            sx={{
              "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
                outline: "none", // Remove cell border
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ManageUser;
