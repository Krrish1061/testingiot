import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import useSendLiveDataDataGrid from "../../../hooks/muiDataGrid/useSendLiveDataDataGrid";
import useSendLiveDataDataGridStore from "../../../store/datagrid/sendLiveDataDataGrid";
import { useMemo } from "react";
import Actions from "../../datagrid/Actions";
import RenderCellExpand from "../../datagrid/RenderCellExpand";
import useGetAllUser from "../../../hooks/users/useGetAllUser";
import SendLiveData from "../../../entities/SendLiveData";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";

function SendLiveDataColumns() {
  const rowModesModel = useSendLiveDataDataGridStore(
    (state) => state.rowModesModel
  );
  const { data: userList } = useGetAllUser();
  const { data: companyList } = useGetAllCompany();
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
        renderCell: (index) => index.api.getAllRowIds().indexOf(index.id) + 1,
      },
      {
        field: "user",
        headerName: "User",
        flex: 0.25,
        editable: false,
        hideable: true,
        valueGetter: (params: GridValueGetterParams<SendLiveData>) => {
          const user = userList?.find(
            (user) => user.username === params.row?.user
          );
          const name = user?.profile?.first_name
            ? `${user?.profile?.first_name} ${user?.profile?.last_name}`
            : user?.username;
          return name;
        },
        renderCell: RenderCellExpand,
      },
      {
        field: "company",
        flex: 0.25,
        headerName: "Company",
        editable: false,
        hideable: true,
        valueGetter: (params: GridValueGetterParams<SendLiveData>) => {
          return companyList?.find(
            (company) => company.slug === params.row?.company
          )?.name;
        },
        renderCell: RenderCellExpand,
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
        field: "send_device_board_id",
        headerName: "Send Board Id",
        minWidth: 105,
        editable: true,
        hideable: true,
        type: "boolean",
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
      userList,
      companyList,
    ]
  );

  return columns;
}

export default SendLiveDataColumns;
