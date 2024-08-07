import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Link as RouterLink } from "react-router-dom";
import {
  ListChildComponentProps,
  FixedSizeList as VirtualizedList,
} from "react-window";
import useGetAllCompany from "../../hooks/company/useGetAllCompany";
import ErrorReload from "../ErrorReload";
import LoadingSpinner from "../LoadingSpinner";

const CompanyList = () => {
  const { data: companyList, error, refetch, isLoading } = useGetAllCompany();
  if (error)
    return (
      <ErrorReload
        text="Could not Retrieve the Company List!!!"
        handleRefetch={() => refetch()}
      />
    );

  if (isLoading) return <LoadingSpinner size={20} />;

  const arrayLength = companyList.length;

  const renderRow = (props: ListChildComponentProps) => {
    const { index, style } = props;

    return (
      <ListItem
        disableGutters
        disablePadding
        style={style}
        key={index}
        divider={index !== arrayLength - 1}
      >
        <ListItemButton
          disableGutters
          component={RouterLink}
          to={`/company/${companyList[index].slug}`}
        >
          <ListItemText
            primary={companyList[index].name}
            primaryTypographyProps={{
              sx: {
                overflow: "hidden",
                whiteSpace: "normal",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: "2", // Number of lines before truncating
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  if (companyList)
    return (
      <VirtualizedList
        height={arrayLength < 8 ? arrayLength * 50 : 400}
        itemCount={companyList.length}
        itemSize={50}
        overscanCount={5}
        width={"100%"}
      >
        {renderRow}
      </VirtualizedList>
    );
  else return;
};

export default CompanyList;
