import {
  GridActionsCellItem,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface Props {
  row: GridRowModel;
  isDisabled?: boolean;
  handleEditClick: (id: GridRowId) => () => void;
  handleSaveClick: (id: GridRowId) => () => void;
  handleDeleteClick: (row: GridRowModel) => () => void;
  handleCancelClick: (id: GridRowId) => () => void;
  rowModesModel: GridRowModesModel;
}

function Actions({
  row,
  isDisabled,
  handleEditClick,
  handleSaveClick,
  handleDeleteClick,
  handleCancelClick,
  rowModesModel,
}: Props) {
  const isInEditMode = rowModesModel[row.id]?.mode === GridRowModes.Edit;
  if (isInEditMode) {
    return [
      <GridActionsCellItem
        icon={
          // <Tooltip
          //   title="Save"
          //   placement="top"
          //   arrow
          //   enterDelay={500}
          //   leaveDelay={0}
          // >
          //   <SaveIcon />
          // </Tooltip>
          <SaveIcon />
        }
        label="Save"
        sx={{
          color: "primary.main",
        }}
        onClick={handleSaveClick(row.id)}
      />,

      <GridActionsCellItem
        icon={<CancelIcon />}
        label="Cancel"
        sx={{
          color: "error.main",
        }}
        className="textPrimary"
        onClick={handleCancelClick(row.id)}
        color="inherit"
      />,
    ];
  }
  return [
    <GridActionsCellItem
      icon={<EditIcon />}
      label="Edit"
      disabled={isDisabled}
      sx={{
        color: "info.main",
      }}
      className="textPrimary"
      onClick={handleEditClick(row.id)}
      color="inherit"
    />,
    <GridActionsCellItem
      icon={<DeleteIcon />}
      label="Delete"
      disabled={isDisabled}
      sx={{
        color: "error.main",
      }}
      onClick={handleDeleteClick(row)}
      color="inherit"
    />,
  ];
}

export default Actions;
