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
  GridRowModesModel,
  GridRowId,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import User from "../entities/User";
import { AxiosError } from "axios";
import useEditUser from "../hooks/useEditUser";
// import useDeleteUser from "../hooks/useDeleteUser";

interface rows extends User {
  isNew?: boolean;
}

function ManageUser() {
  const { data, isLoading, isError, isSuccess } = useGetAllUser();
  const { mutate: editUser } = useEditUser();
  // const { mutate: deleteUser } = useDeleteUser();
  const [rows, setRows] = useState<rows[]>([] as rows[]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleEditClick = (id: GridRowId) => () => {
    // called when edit button is clicked
    console.log("handleEditClick", id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    // called when save button is clicked
    console.log("handleSaveClick", id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // called when delete button is clicked
    // deleteIotDevice.mutate(id as number);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    // called when cancel button is clicked
    console.log("handleCancelClick", id);
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    // called when editing is stop
    //  prevent exiting editing when row is out of focus
    console.log("handleRowEditStop");
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleRowEditStart: GridEventListener<"rowEditStart"> = (
    _params,
    event
  ) => {
    // called when editing is start
    // stop entering mode through double click pressing enter
    event.defaultMuiPrevented = true;
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    // called to handle the row update send data to the server
    console.log("processRowUpdate id ", newRow);
    editUser(newRow as User);
    const updatedRow = { ...newRow, isNew: false };
    // setSnackbar({ children: "User successfully saved", severity: "success" });
    // setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    // called every time when the row changes except when the row is deleted
    console.log("handleRowModesModelChange ", newRowModesModel);
    setRowModesModel(newRowModesModel);
  };

  const handleProcessRowUpdateError = useCallback((error: AxiosError) => {
    console.log("handleRowModesModelChangeError ", error);
    // setSnackbar({ children: error.message, severity: "error" });
  }, []);

  const columns: GridColDef[] = [
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
      // width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
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
  ];

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
      {isLoading ? (
        <Box>ManageUser</Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          editMode="row"
          disableColumnSelector
          disableRowSelectionOnClick
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          onRowEditStart={handleRowEditStart}
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
      )}
    </Box>
  );
}

export default ManageUser;
