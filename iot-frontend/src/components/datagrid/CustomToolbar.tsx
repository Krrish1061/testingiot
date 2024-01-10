import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarContainer,
} from "@mui/x-data-grid";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );
}

export default CustomToolbar;
