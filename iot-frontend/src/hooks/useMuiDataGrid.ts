import { useCallback } from "react";
import useUserDataGridStore from "../store/userDataGridStore";
import {
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { AxiosError } from "axios";
import muiDataGridCommonFunction from "../constants/muiDataGrid/commonFunction";

interface EditFunction<T> {
  (data: T): Promise<T>;
}

function useMuiDataGrid() {
  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);
  const setRowModesModel = useUserDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useUserDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useUserDataGridStore(
    (state) => state.promiseArguments
  );
  const setPromiseArguments = useUserDataGridStore(
    (state) => state.setPromiseArguments
  );

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel) =>
      new Promise<GridRowModel>((resolve, reject) => {
        const mutation = muiDataGridCommonFunction.computeMutation(
          newRow,
          oldRow
        );
        if (mutation) {
          // Save the arguments to resolve or reject the promise later
          setPromiseArguments({ resolve, reject, newRow, oldRow });
        } else {
          resolve(oldRow); // Nothing was changed
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDialogNoButton = () => {
    if (promiseArguments) {
      const { oldRow, resolve } = promiseArguments;
      resolve(oldRow);
    } // Resolve with the old row to not update the internal state
    setPromiseArguments(null);
  };

  const handleDialogYesButton = async <T>(mutate: EditFunction<T>) => {
    if (promiseArguments) {
      const { newRow, reject, resolve } = promiseArguments;
      try {
        // Make the HTTP request to save in the backend
        const response = await mutate(newRow as T);
        resolve(response as Promise<T>);
      } catch (error) {
        reject(error);
      } finally {
        setPromiseArguments(null);
      }
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleProcessRowUpdateError = useCallback((error: AxiosError) => {
    console.log("handleRowModesModelChangeError dsdas ", error);
  }, []);

  return {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
    processRowUpdate,
    handleDialogNoButton,
    handleDialogYesButton,
    handleRowModesModelChange,
    handleProcessRowUpdateError,
  };
}

export default useMuiDataGrid;
