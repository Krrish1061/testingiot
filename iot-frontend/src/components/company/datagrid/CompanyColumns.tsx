import { useMemo } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import useCompanyDataGrid from "../../../hooks/muiDataGrid/useCompanyDataGrid";
import Actions from "../../datagrid/Actions";
import useCompanyDataGridStore from "../../../store/datagrid/companyDataGridStore";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

function CompanyColumns() {
  const rowModesModel = useCompanyDataGridStore((state) => state.rowModesModel);

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useCompanyDataGrid();

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
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 150,
        editable: true,
        hideable: false,
      },
      {
        field: "email",
        headerName: "Email",
        editable: false,
        hideable: false,
        minWidth: 150,
        flex: 1,
        renderCell: (params: GridRenderCellParams) => (
          <Tooltip
            disableFocusListener
            placement="top"
            arrow
            title={params.value}
          >
            <Box>{params.value}</Box>
          </Tooltip>
        ),
      },
      {
        field: "user_limit",
        headerName: "User Limit",
        type: "number",
        align: "center",
        width: 90,
        editable: true,
        hideable: false,
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

export default CompanyColumns;
