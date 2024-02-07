import useIotDeviceDataGrid from "../../../hooks/muiDataGrid/useIotDeviceDataGrid";
import useIotDeviceDataGridStore from "../../../store/datagrid/iotDeviceDataGridStore";
import { useMemo } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Actions from "../../datagrid/Actions";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

function IotDeviceColumns() {
  const rowModesModel = useIotDeviceDataGridStore(
    (state) => state.rowModesModel
  );

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useIotDeviceDataGrid();

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
        field: "id",
        headerName: "Device Id",
        editable: false,
        hideable: false,
      },

      {
        field: "company",
        headerName: "Company",
        minWidth: 110,
        flex: 1,
        editable: true,
        hideable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            disableFocusListener
            placement="top"
            arrow
            title={params.value || ""}
          >
            {params.value || ""}
          </Tooltip>
        ),
      },
      {
        field: "user",
        headerName: "User",
        minWidth: 110,
        flex: 0.5,
        editable: true,
        hideable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            disableFocusListener
            placement="top"
            arrow
            title={params.value || ""}
          >
            {params.value || ""}
          </Tooltip>
        ),
      },

      {
        field: "board_id",
        headerName: "Board Id",
        type: "number",
        editable: true,
        hideable: true,
      },

      {
        field: "is_active",
        headerName: "is Active",
        minWidth: 105,
        editable: true,
        type: "boolean",
      },

      {
        field: "iot_device_location",
        headerName: "Device Location",
        minWidth: 150,
        editable: true,
        hideable: true,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            disableFocusListener
            placement="top"
            arrow
            title={params.value}
          >
            {params.value}
          </Tooltip>
        ),
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

export default IotDeviceColumns;
