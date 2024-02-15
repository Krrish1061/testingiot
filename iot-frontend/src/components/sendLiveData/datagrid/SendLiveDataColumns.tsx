import { GridColDef } from "@mui/x-data-grid";
import useSendLiveDataDataGrid from "../../../hooks/muiDataGrid/useSendLiveDataDataGrid";
import useSendLiveDataDataGridStore from "../../../store/datagrid/sendLiveDataDataGrid";
import { useMemo } from "react";
import Actions from "../../datagrid/Actions";
import RenderCellExpand from "../../datagrid/RenderCellExpand";

function SendLiveDataColumns() {
  const rowModesModel = useSendLiveDataDataGridStore(
    (state) => state.rowModesModel
  );
  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useSendLiveDataDataGrid();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "serial_number",
        headerName: "S.N.",
        width: 1,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (index) =>
          index.api.getRowIndexRelativeToVisibleRows(index.row.id) + 1,
      },
      {
        field: "user",
        headerName: "User",
        flex: 0.25,
        editable: false,
        hideable: true,
      },
      {
        field: "company",
        flex: 0.25,
        headerName: "Company",
        editable: false,
        hideable: true,
      },

      {
        field: "endpoint",
        headerName: "Endpoint",
        flex: 0.5,
        editable: true,
        hideable: false,
        renderCell: RenderCellExpand,
      },

      {
        field: "actions",
        type: "actions",
        hideable: false,
        minWidth: 2,
        headerName: "Actions",
        cellClassName: "actions",
        getActions: ({ row }) =>
          Actions({
            row: row,
            handleEditClick: handleEditClick,
            handleSaveClick: handleSaveClick,
            handleDeleteClick: handleDeleteClick,
            handleCancelClick: handleCancelClick,
            rowModesModel: rowModesModel,
          }),
      },
    ],
    [
      rowModesModel,
      handleEditClick,
      handleSaveClick,
      handleDeleteClick,
      handleCancelClick,
    ]
  );

  return columns;
}

export default SendLiveDataColumns;
