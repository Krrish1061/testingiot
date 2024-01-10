import { GridRenderCellParams } from "@mui/x-data-grid";
import GridCellExpand from "./CellExpand";

function RenderCellExpand(params: GridRenderCellParams) {
  return (
    <GridCellExpand
      value={params.value || ""}
      width={params.colDef.computedWidth}
    />
  );
}

export default RenderCellExpand;
