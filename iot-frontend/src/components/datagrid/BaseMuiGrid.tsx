import {
  DataGrid,
  GridColDef,
  GridRowModesModel,
  GridSlotsComponentsProps,
  GridValidRowModel,
} from "@mui/x-data-grid";
import muiDataGridCommonFunction from "../../constants/muiDataGrid/commonFunction";
import Toolbar from "./Toolbar";
import CustomPagination from "./Pagination";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { AxiosError } from "axios";
import CustomNoRowsOverlay from "./CustomNoRowsOverlay";
import LinearProgress from "@mui/material/LinearProgress";
import { JSXElementConstructor } from "react";

interface Props {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  isLoading: boolean;
  initialState: GridInitialStateCommunity;
  rowModesModel: GridRowModesModel;
  slotProps: GridSlotsComponentsProps;
  customToolbar?: JSXElementConstructor<unknown>;
  processRowUpdate: (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => Promise<GridValidRowModel>;
  handleRowModesModelChange: (newRowModesModel: GridRowModesModel) => void;
  handleProcessRowUpdateError: (error: AxiosError) => void;
}

function BaseMuiGrid({
  rows,
  columns,
  isLoading,
  initialState,
  rowModesModel,
  slotProps,
  customToolbar,
  processRowUpdate,
  handleRowModesModelChange,
  handleProcessRowUpdateError,
}: Props) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={isLoading}
      initialState={initialState}
      pageSizeOptions={[10, 20, 30, 50]}
      disableVirtualization
      autoHeight
      editMode="row"
      getRowId={(row) => row.id}
      disableColumnMenu
      disableRowSelectionOnClick
      disableDensitySelector
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={muiDataGridCommonFunction.handleRowEditStop}
      onRowEditStart={muiDataGridCommonFunction.handleRowEditStart}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      slots={{
        loadingOverlay: LinearProgress,
        toolbar: customToolbar ? customToolbar : Toolbar,
        pagination: CustomPagination,
        noRowsOverlay: CustomNoRowsOverlay,
      }}
      slotProps={slotProps}
      sx={{
        "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
          outline: "none", // Remove cell border
        },
      }}
    />
  );
}

export default BaseMuiGrid;
