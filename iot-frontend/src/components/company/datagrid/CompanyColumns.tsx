import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo } from "react";
import Company from "../../../entities/Company";
import useGetAllDealer from "../../../hooks/dealer/useGetAllDealer";
import useCompanyDataGrid from "../../../hooks/muiDataGrid/useCompanyDataGrid";
import useAuthStore from "../../../store/authStore";
import useCompanyDataGridStore from "../../../store/datagrid/companyDataGridStore";
import Actions from "../../datagrid/Actions";
import RenderCellExpand from "../../datagrid/RenderCellExpand";
import CompanyProfileModel from "./CompanyProfileModel";

function CompanyColumns() {
  const rowModesModel = useCompanyDataGridStore((state) => state.rowModesModel);
  const isUserDealer = useAuthStore((state) => state.isUserDealer);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useCompanyDataGrid();

  const { data: dealerList } = useGetAllDealer();

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
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
        renderCell: (params: GridRenderCellParams<Company>) => (
          <CompanyProfileModel params={params} />
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
            isUserDealer: isUserDealer,
            handleEditClick: handleEditClick,
            handleSaveClick: handleSaveClick,
            handleDeleteClick: handleDeleteClick,
            handleCancelClick: handleCancelClick,
            rowModesModel: rowModesModel,
          }),
      },
    ];
    // Add the user_limit and dealer column only for superAdmin users
    if (isUserSuperAdmin) {
      baseColumns.splice(
        4,
        0,
        {
          field: "dealer",
          headerName: "Dealer",
          editable: false,
          hideable: true,
          valueGetter: (params: GridValueGetterParams<Company>) => {
            if (params.row.dealer)
              return (
                dealerList?.find((dealer) => dealer.slug === params.row.dealer)
                  ?.name || "-"
              );
            else return "-";
          },
          renderCell: RenderCellExpand,
        },
        {
          field: "user_limit",
          headerName: "User Limit",
          type: "number",
          align: "center",
          width: 90,
          editable: true,
          hideable: false,
        }
      );
    }

    return baseColumns;
  }, [
    isUserSuperAdmin,
    isUserDealer,
    rowModesModel,
    dealerList,
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  ]);

  return columns;
}

export default CompanyColumns;
