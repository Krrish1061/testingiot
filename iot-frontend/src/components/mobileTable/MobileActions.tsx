import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

interface Props {
  isUserDealer?: boolean;
  isDisabled?: boolean;
  isEditMode: boolean;
  enableOnlyEditForDealerUser?: boolean;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCancelClick: () => void;
}

function MobileActions({
  isDisabled,
  isEditMode,
  isUserDealer,
  handleEditClick,
  handleDeleteClick,
  handleCancelClick,
  enableOnlyEditForDealerUser = false,
}: Props) {
  if (isUserDealer && !enableOnlyEditForDealerUser)
    return (
      <Box>
        <IconButton
          color="error"
          disabled={isDisabled}
          size="small"
          onClick={handleDeleteClick}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    );

  if (isEditMode)
    return (
      <Box>
        <IconButton
          color="primary"
          disabled={isDisabled}
          type="submit"
          size="small"
        >
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={isDisabled}
          color="secondary"
          onClick={handleCancelClick}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  else
    return (
      <Box>
        <IconButton
          size="small"
          disabled={isDisabled}
          onClick={handleEditClick}
          color="primary"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        {!isUserDealer && !enableOnlyEditForDealerUser && (
          <IconButton
            color="error"
            disabled={isDisabled}
            size="small"
            onClick={handleDeleteClick}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
}

export default MobileActions;
