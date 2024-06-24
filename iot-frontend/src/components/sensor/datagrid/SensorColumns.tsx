import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo } from "react";
import useSensorDataGrid from "../../../hooks/muiDataGrid/useSensorDataGrid";
import useSensorDataGridStore from "../../../store/datagrid/sensorDataGridStore";
import Actions from "../../datagrid/Actions";
import RenderCellExpand from "../../datagrid/RenderCellExpand";

function SensorColumns() {
  const rowModesModel = useSensorDataGridStore((state) => state.rowModesModel);

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useSensorDataGrid();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "serial_number",
        headerName: "S.N.",
        width: 1,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (index) => index.api.getAllRowIds().indexOf(index.id) + 1,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 150,
        editable: false,
        hideable: false,
      },
      {
        field: "symbol",
        headerName: "Symbol",
        editable: true,
        hideable: false,
      },
      {
        field: "unit",
        headerName: "Unit",
        editable: true,
        hideable: false,
        renderCell: RenderCellExpand,
      },
      {
        field: "is_value_boolean",
        headerName: "Is Value Boolean",
        minWidth: 115,
        editable: true,
        hideable: true,
        type: "boolean",
      },
      {
        field: "min_limit",
        headerName: "Min Limit",
        type: "number",
        align: "center",
        editable: true,
        hideable: true,
      },
      {
        field: "max_limit",
        headerName: "Max Limit",
        type: "number",
        align: "center",
        editable: true,
        hideable: true,
      },
      {
        field: "created_at",
        headerName: "Created Date",
        type: "dateTime",
        editable: false,
        minWidth: 110,
        valueGetter: (params) => dayjs(params.value).toDate(),
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            disableFocusListener
            placement="top"
            arrow
            title={dayjs(params.value).format("MMM D, YYYY h:mm A")}
          >
            <Box>{dayjs(params.value).format("MMM D, YYYY")}</Box>
          </Tooltip>
        ),
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

export default SensorColumns;
