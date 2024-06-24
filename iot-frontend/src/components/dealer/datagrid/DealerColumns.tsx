import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo } from "react";
import IDealer from "../../../entities/Dealer";
import useDealerDataGrid from "../../../hooks/muiDataGrid/useDealerDataGrid";
import useDealerDataGridStore from "../../../store/datagrid/dealerDataGridStore";
import Actions from "../../datagrid/Actions";
import DealerProfileModel from "./DealerProfileModel";

function DealerColumns() {
  const rowModesModel = useDealerDataGridStore((state) => state.rowModesModel);
  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useDealerDataGrid();

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
        field: "logo",
        headerName: "Logo",
        width: 70,
        editable: false,
        sortable: false,
        filterable: false,
        hideable: false,
        renderCell: (params: GridRenderCellParams<IDealer>) => (
          <DealerProfileModel params={params} />
        ),
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
        field: "user_company_limit",
        headerName: "User/Company Limit",
        type: "number",
        align: "center",
        width: 140,
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
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handleSaveClick,
      rowModesModel,
    ]
  );

  return columns;
}

export default DealerColumns;
