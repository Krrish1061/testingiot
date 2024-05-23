import { useMemo } from "react";
import {
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
  GridValueOptionsParams,
} from "@mui/x-data-grid";
import ImageAvatar from "../../ImageAvatar";
import User from "../../../entities/User";
import RenderCellExpand from "../../datagrid/RenderCellExpand";
import UserTypes from "../../../constants/userTypes";
import UserGroups from "../../../constants/userGroups";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import useAuthStore from "../../../store/authStore";
import Actions from "../../datagrid/Actions";
import useUserDataGridStore from "../../../store/datagrid/userDataGridStore";
import useUserDataGrid from "../../../hooks/muiDataGrid/useUserDataGrid";
import UserProfileModel from "./UserProfileModel";
import useGetAllCompany from "../../../hooks/company/useGetAllCompany";
import useCompanyStore from "../../../store/companyStore";
import useCompany from "../../../hooks/company/useCompany";

interface Props {
  users?: User[];
}

const getUserTypeOptions = (user: User | null, row: User | undefined) => {
  // If the user matches the row, show only the current type
  if (user?.username === row?.username) {
    return [{ value: row?.type, label: row?.type }];
  }

  const options = [
    { value: UserTypes.moderator, label: UserTypes.moderator },
    { value: UserTypes.viewer, label: UserTypes.viewer },
  ];

  // if user are in company super admin or SuperAdmin add admin options
  if (
    user &&
    user.groups.some((group) =>
      [UserGroups.companySuperAdminGroup, UserGroups.superAdminGroup].includes(
        group
      )
    )
  ) {
    options.push({
      value: UserTypes.admin,
      label: UserTypes.admin,
    });
  }
  // else if (row && row.groups.includes(UserGroups.adminGroup)) {
  //   return [
  //     {
  //       value: UserTypes.admin,
  //       label: UserTypes.admin,
  //     },
  //   ];
  // }

  return options;
};

function UserColumns({ users }: Props) {
  const user = useAuthStore((state) => state.user);
  const userCompany = useCompanyStore((state) => state.company);
  const isUserSuperAdmin = useAuthStore((state) => state.isUserSuperAdmin);
  const { data: companyList } = useGetAllCompany(isUserSuperAdmin);
  // fetching the user company detail
  useCompany(!isUserSuperAdmin && user?.is_associated_with_company);

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
  } = useUserDataGrid();

  const rowModesModel = useUserDataGridStore((state) => state.rowModesModel);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "serial_number",
        headerName: "S.N.",
        width: 1,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (index: GridRenderCellParams<User>) =>
          index.api.getAllRowIds().indexOf(index.id) + 1,
      },
      {
        field: "avatar",
        headerName: "Avatar",
        width: 70,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<User>) => (
          <ImageAvatar
            imgUrl={params.row.profile?.profile_picture}
            altText={
              params.row.profile?.first_name
                ? `${params.row.profile?.first_name} ${params.row.profile?.last_name}`
                : params.row.username
            }
          />
        ),
      },
      {
        field: "username",
        headerName: "Username",
        // minWidth: 120,
        hideable: false,
        editable: false,
        renderCell: (params: GridRenderCellParams<User>) => (
          <UserProfileModel
            params={params}
            isUserSuperAdmin={isUserSuperAdmin}
          />
        ),
      },
      {
        field: "fullName",
        headerName: "Name",
        minWidth: 150,
        flex: 1,
        editable: false,
        valueGetter: (params: GridValueGetterParams<User>) => {
          return `${params.row.profile?.first_name} ${params.row.profile?.last_name}`;
        },
      },

      {
        field: "email",
        headerName: "Email",
        editable: false,
        hideable: false,
        minWidth: 150,
        flex: 1,
        renderCell: RenderCellExpand,
      },
      {
        field: "type",
        headerName: "UserType",
        hideable: false,
        minWidth: 110,
        type: "singleSelect",
        editable: true,
        valueOptions: ({ row }: GridValueOptionsParams<User>) =>
          getUserTypeOptions(user, row),
      },
      {
        field: "company",
        headerName: "Company",
        minWidth: 110,
        flex: 0.75,
        editable: false,
        valueGetter: (params: GridValueGetterParams<User>) => {
          if (isUserSuperAdmin)
            return (
              companyList?.find(
                (company) => company.slug === params.row?.company
              )?.name || "-"
            );
          else if (user?.is_associated_with_company) return userCompany.name;
          else return "-";
        },
        renderCell: RenderCellExpand,
      },
      {
        field: "is_active",
        headerName: "is Active",
        minWidth: 105,
        editable: true,
        type: "boolean",
      },
      {
        field: "created_by",
        headerName: "Created by",
        editable: false,
        sortable: false,
        filterable: false,
        valueGetter: (params: GridValueGetterParams<User>) =>
          params.row.created_by,
        renderCell: (params: GridRenderCellParams<User>) => {
          const createdUser = users?.find(
            (user) => user.username === params.value
          );

          if (createdUser) {
            return (
              <ImageAvatar
                imgUrl={createdUser?.profile?.profile_picture}
                altText={`${createdUser.profile?.first_name} ${createdUser?.profile?.last_name}`}
              />
            );
          }
        },
      },
      {
        field: "date_joined",
        headerName: "Date joined",
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
            isDisabled: user?.id === row.id ? true : false,
            handleEditClick: handleEditClick,
            handleSaveClick: handleSaveClick,
            handleDeleteClick: handleDeleteClick,
            handleCancelClick: handleCancelClick,
            rowModesModel: rowModesModel,
          }),
      },
    ],

    [
      user,
      users,
      handleEditClick,
      handleSaveClick,
      handleDeleteClick,
      handleCancelClick,
      rowModesModel,
      isUserSuperAdmin,
      companyList,
      userCompany,
    ]
  );

  return columns;
}

export default UserColumns;
