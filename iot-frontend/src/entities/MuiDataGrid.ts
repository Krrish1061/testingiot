import {
  // GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridValidRowModel,
} from "@mui/x-data-grid";

export interface PromiseArguments {
  newRow: GridRowModel;
  oldRow: GridRowModel;
  resolve: (value: GridValidRowModel | PromiseLike<GridValidRowModel>) => void;
  reject: (error: unknown) => void;
}

interface MuiDataGrid<T> {
  rows: (T & { isNew?: boolean })[];
  setRows: (rows: (T & { isNew?: boolean })[]) => void;
  deleteRow: GridRowModel | null;
  setDeleteRow: (row: GridRowModel | null) => void;
  rowModesModel: GridRowModesModel;
  setRowModesModel: (rowModesModel: GridRowModesModel) => void;
  promiseArguments: PromiseArguments | null;
  setPromiseArguments: (promiseArguments: PromiseArguments | null) => void;
}

export default MuiDataGrid;
