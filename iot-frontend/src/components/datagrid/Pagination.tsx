import {
  useGridApiContext,
  gridPageCountSelector,
  useGridSelector,
  GridPagination,
} from "@mui/x-data-grid";
import { ChangeEvent, MouseEvent } from "react";
import { TablePaginationProps } from "@mui/material/TablePagination";
import MuiPagination from "@mui/material/Pagination";

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
      onChange={(event: ChangeEvent<unknown>, newPage) => {
        onPageChange(event as MouseEvent<HTMLButtonElement>, newPage - 1);
      }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPagination(props: any) {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}

export default CustomPagination;
