import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowModes,
  GridValueGetterParams,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarContainer,
  useGridApiContext,
  gridPageCountSelector,
  useGridSelector,
  GridPagination,
} from "@mui/x-data-grid";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import muiDataGridCommonFunction from "../constants/muiDataGrid/commonFunction";
import User from "../entities/User";
import useEditUser from "../hooks/useEditUser";
import useGetAllUser from "../hooks/useGetAllUser";
import useMuiDataGrid from "../hooks/useMuiDataGrid";
import useUserDataGridStore from "../store/userDataGridStore";
import dayjs from "dayjs";
import UserGroups from "../constants/userGroups";
import UserTypes from "../constants/userTypes";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { TablePaginationProps } from "@mui/material/TablePagination";
import MuiPagination from "@mui/material/Pagination";
import ImageAvatar from "../components/ImageAvatar";

interface GridCellExpandProps {
  value: string;
  width: number;
}

function Pagination({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <MuiPagination
      color="primary"
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event as any, newPage - 1);
      }}
    />
  );
}

function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

function isOverflown(element: Element): boolean {
  return (
    // element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

const GridCellExpand = memo(function GridCellExpand(
  props: GridCellExpandProps
) {
  const { width, value } = props;
  const wrapper = useRef<HTMLDivElement | null>(null);
  const cellDiv = useRef(null);
  const cellValue = useRef(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showFullCell, setShowFullCell] = useState(false);
  const [showPopper, setShowPopper] = useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current!);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === "Escape" || nativeEvent.key === "Esc") {
        setShowFullCell(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: "center",
        lineHeight: "24px",
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
      }}
    >
      <Box
        ref={cellDiv}
        sx={{
          height: "100%",
          width,
          display: "block",
          position: "absolute",
          top: -50,
          left: -5,
        }}
      />
      <Box
        ref={cellValue}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </Box>
      {showPopper && (
        <Popper
          open={showFullCell && anchorEl !== null}
          anchorEl={anchorEl}
          style={{ width, marginLeft: -17 }}
        >
          <Paper
            elevation={1}
            style={{ minHeight: wrapper.current!.offsetHeight - 3 }}
          >
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </Box>
  );
});

function renderCellExpand(params: GridRenderCellParams<any, string>) {
  return (
    <GridCellExpand
      value={params.value || ""}
      width={params.colDef.computedWidth}
    />
  );
}

function ManageUser() {
  const { data, isError, isSuccess, isLoading } = useGetAllUser();
  const { mutateAsync: editUser, isLoading: mutatingUser } = useEditUser();

  const {
    handleEditClick,
    handleSaveClick,
    handleDeleteClick,
    handleCancelClick,
    processRowUpdate,
    handleDialogNoButton,
    handleDialogYesButton,
    handleRowModesModelChange,
    handleProcessRowUpdateError,
  } = useMuiDataGrid();

  const rows = useUserDataGridStore((state) => state.rows);
  const setRows = useUserDataGridStore((state) => state.setRows);
  const setRowModesModel = useUserDataGridStore(
    (state) => state.setRowModesModel
  );
  const rowModesModel = useUserDataGridStore((state) => state.rowModesModel);
  const promiseArguments = useUserDataGridStore(
    (state) => state.promiseArguments
  );
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const handleEntered = () => {
    // The `autoFocus` is not used because, if used, the same Enter that saves
    // the cell triggers "No". Instead, we manually focus the "No" button once
    // the dialog is fully open.
    noButtonRef.current?.focus();
  };

  const renderConfirmDialog = () => {
    if (!promiseArguments) {
      return null;
    }

    return (
      <Dialog
        maxWidth="xs"
        TransitionProps={{ onEntered: handleEntered }}
        open={!!promiseArguments}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent dividers>
          {`Pressing 'Yes' will Confirm the changes made to the User.`}
        </DialogContent>
        <DialogActions>
          <Button ref={noButtonRef} onClick={handleDialogNoButton}>
            No
          </Button>
          <Button onClick={() => handleDialogYesButton<User>(editUser)}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // use memo hook to remeber in each render
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
        field: "avatar",
        headerName: "Avatar",
        width: 70,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<User>) => (
          <ImageAvatar
            imgUrl={params.row.profile.profile_picture}
            altText={`${params.row.profile.first_name} ${params.row.profile.last_name}`}
          />
        ),
      },
      {
        field: "username",
        headerName: "Username",
        minWidth: 120,
        hideable: false,
        editable: false,
      },
      {
        field: "fullName",
        headerName: "Name",
        minWidth: 150,
        flex: 1,
        editable: false,
        valueGetter: (params: GridValueGetterParams<User>) => {
          return `${params.row.profile.first_name || ""} ${
            params.row.profile.last_name || ""
          } `;
        },
      },

      {
        field: "email",
        headerName: "Email",
        hideable: false,
        minWidth: 150,
        flex: 1,
        editable: true,
        renderCell: renderCellExpand,
      },
      {
        field: "type",
        headerName: "UserType",
        hideable: false,
        minWidth: 110,
        type: "singleSelect",
        editable: true,
        valueOptions: ({ row }) => {
          const options = [
            { value: UserTypes.admin, label: UserTypes.admin },
            { value: UserTypes.moderator, label: UserTypes.moderator },
            { value: UserTypes.viewer, label: UserTypes.viewer },
          ];
          if (row && row.type === UserTypes.superAdmin) {
            if (row.groups.includes(UserGroups.superAdminGroup)) {
              return [
                {
                  value: UserTypes.superAdmin,
                  label: UserTypes.superAdmin,
                },
              ];
            }
            options.push({
              value: UserTypes.superAdmin,
              label: UserTypes.superAdmin,
            });
          }
          return options;
        },
      },
      {
        field: "company",
        headerName: "Company",
        hideable: false,
        minWidth: 110,
        flex: 0.75,
        editable: false,
        renderCell: renderCellExpand,
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
          params.row.extra_fields?.created_by,
        renderCell: (params: GridRenderCellParams<User>) => {
          const createdUser = data?.find(
            (user) => user.username === params.value
          );
          if (createdUser) {
            return (
              <ImageAvatar
                imgUrl={createdUser?.profile.profile_picture}
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
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                disabled={mutatingUser}
                sx={{
                  color: "primary.main",
                }}
                onClick={handleSaveClick(id)}
              />,

              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                sx={{
                  color: "error.main",
                }}
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              sx={{
                color: "info.main",
              }}
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              sx={{
                color: "error.main",
              }}
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          ];
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handleSaveClick,
      mutatingUser,
      rowModesModel,
    ]
  );

  useEffect(() => {
    if (isSuccess) {
      console.log(data);
      setRows(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  if (isError) return <Box>Error Ocurred</Box>;
  return (
    <Box
      sx={{
        width: 1,
      }}
    >
      {renderConfirmDialog()}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              // Hide columns status and traderName, the other columns will remain visible
              serial_number: false,
              date_joined: false,
            },
          },
          pagination: { paginationModel: { pageSize: 20 } },
        }}
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
          toolbar: CustomToolbar,
          pagination: CustomPagination,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        sx={{
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
            outline: "none", // Remove cell border
          },
        }}
      />
    </Box>
  );
}

export default ManageUser;
