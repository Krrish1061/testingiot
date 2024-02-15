import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarContainer,
} from "@mui/x-data-grid";

function Toolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

export default Toolbar;
