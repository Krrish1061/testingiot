import {
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
} from "@mui/x-data-grid";

class MuiDataGridCommonFunction {
  computeMutation(newRow: GridRowModel, oldRow: GridRowModel) {
    if (JSON.stringify(newRow) !== JSON.stringify(oldRow)) {
      return true;
      // return `User Object from '${oldRow}' to '${newRow}'`;
    }
    return null;
  }

  handleRowEditStop: GridEventListener<"rowEditStop"> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  handleRowEditStart: GridEventListener<"rowEditStart"> = (_params, event) => {
    event.defaultMuiPrevented = true;
  };
}

const muiDataGridCommonFunction = new MuiDataGridCommonFunction();

export default muiDataGridCommonFunction;
