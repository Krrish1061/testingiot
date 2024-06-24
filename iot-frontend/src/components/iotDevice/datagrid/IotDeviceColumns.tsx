import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useMemo } from "react";
import IotDevice from "../../../entities/IotDevice";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useGetAllDealer from "../../../hooks/dealer/useGetAllDealer";
import useIotDeviceDataGrid from "../../../hooks/muiDataGrid/useIotDeviceDataGrid";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import useAuthStore from "../../../store/authStore";
import useIotDeviceDataGridStore from "../../../store/datagrid/iotDeviceDataGridStore";
import Actions from "../../datagrid/Actions";
import RenderCellExpand from "../../datagrid/RenderCellExpand";

function IotDeviceColumns() {
  const { data: userList } = useGetAllUser();
  const { data: companyList } = useGetAllCompany();
  const { data: dealerList } = useGetAllDealer();
  const rowModesModel = useIotDeviceDataGridStore(
    (state) => state.rowModesModel
  );
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useIotDeviceDataGrid();

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
        field: "iot_device_details",
        headerName: "Device Name",
        minWidth: 150,
        editable: false,
        hideable: false,
        valueGetter: (params) => params.value?.name,
        renderCell: RenderCellExpand,
      },

      {
        field: "company",
        headerName: "Company",
        minWidth: 110,
        flex: 1,
        type: "text",
        editable: false,
        hideable: false,
        valueGetter: (params: GridValueGetterParams<IotDevice>) => {
          return (
            companyList?.find((company) => company.slug === params.row?.company)
              ?.name || "-"
          );
        },
        renderCell: RenderCellExpand,
      },
      {
        field: "user",
        headerName: "User",
        minWidth: 110,
        flex: 0.5,
        editable: false,
        hideable: false,
        valueGetter: (params: GridValueGetterParams<IotDevice>) => {
          const user = userList?.find(
            (user) => user.username === params.row?.user
          );
          const name = user?.profile?.first_name
            ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
            : user?.username;
          return name || "-";
        },
        renderCell: RenderCellExpand,
      },

      {
        field: "location",
        headerName: "Device Location",
        minWidth: 150,
        editable: false,
        hideable: true,
        valueGetter: (params) => params.row.iot_device_details.address,
        renderCell: RenderCellExpand,
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
    ];
    if (isUserSuperAdmin) {
      baseColumns.splice(1, 0, {
        field: "id",
        headerName: "Device Id",
        editable: false,
        hideable: true,
      });

      baseColumns.splice(
        5,
        0,
        {
          field: "dealer",
          headerName: "Dealer",
          type: "text",
          editable: false,
          hideable: true,
          valueGetter: (params: GridValueGetterParams<IotDevice>) => {
            return (
              dealerList?.find((dealer) => dealer.slug === params.row?.dealer)
                ?.name || "-"
            );
          },
          renderCell: RenderCellExpand,
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
        }
      );

      baseColumns.push({
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
      });
    }
    return baseColumns;
  }, [
    rowModesModel,
    isUserSuperAdmin,
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
    userList,
    companyList,
    dealerList,
  ]);

  return columns;
}

export default IotDeviceColumns;
