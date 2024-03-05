import { useCallback } from "react";
import {
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { AxiosError, AxiosResponse } from "axios";
import muiDataGridCommonFunction from "../../constants/muiDataGrid/commonFunction";
import MuiDataGrid from "../../entities/MuiDataGrid";
import { StoreApi, UseBoundStore } from "zustand";
import {
  UseMutateAsyncFunction,
  UseMutateFunction,
} from "@tanstack/react-query";

interface UseDataGridOptions<T> {
  useDataGridStore: UseBoundStore<StoreApi<MuiDataGrid<T>>>;
  editRow: UseMutateAsyncFunction<T, AxiosError, T>;
  deleteRow: UseMutateFunction<AxiosResponse, AxiosError, T>;
}

function useDataGrid<T>({
  editRow,
  deleteRow: deletingRow,
  useDataGridStore,
}: UseDataGridOptions<T>) {
  const setRowModesModel = useDataGridStore((state) => state.setRowModesModel);
  const rowModesModel = useDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useDataGridStore((state) => state.promiseArguments);
  const setPromiseArguments = useDataGridStore(
    (state) => state.setPromiseArguments
  );

  const setDeleteRow = useDataGridStore((state) => state.setDeleteRow);
  const deleteRow = useDataGridStore((state) => state.deleteRow);
  const rows = useDataGridStore((state) => state.rows);
  const setRows = useDataGridStore((state) => state.setRows);

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (row: GridRowModel) => () => {
    setDeleteRow(row);
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
          setPromiseArguments({ resolve, reject, newRow, oldRow });
        } else {
          resolve(oldRow);
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDialogNoButton = () => {
    if (promiseArguments) {
      const { oldRow, resolve } = promiseArguments;
      resolve(oldRow);
    }
    setPromiseArguments(null);
  };

  const handleDialogYesButton = async () => {
    if (promiseArguments) {
      const { newRow, reject, resolve } = promiseArguments;
      try {
        // Make the HTTP request to save in the backend
        const response = await editRow(newRow as T);
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

  const handleProcessRowUpdateError = useCallback(() => {
    console.log("error occured in datagrid");
  }, []);

  const handleDialogDeleteNoButton = () => {
    setDeleteRow(null);
  };

  const handleDialogDeleteYesButton = () => {
    deletingRow(deleteRow as T);
    setDeleteRow(null);
    setRows(rows.filter((row) => row !== deleteRow));
  };

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
    handleDialogDeleteNoButton,
    handleDialogDeleteYesButton,
  };
}

export default useDataGrid;
