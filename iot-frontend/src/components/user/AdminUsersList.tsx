import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  ListChildComponentProps,
  FixedSizeList as VirtualizedList,
} from "react-window";
import UserTypes from "../../constants/userTypes";
import User from "../../entities/User";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import ErrorReload from "../ErrorReload";
import LoadingSpinner from "../LoadingSpinner";
import Box from "@mui/material/Box";

function getAdminUsers(users: User[] | undefined) {
  if (!users) return null;
  // check for groups
  return users.filter(
    (user) => !user.is_associated_with_company && user.type === UserTypes.admin
  );
}

function AdminUsersList() {
  const { data, isError, isLoading, refetch } = useGetAllUser();
  const adminUsersList = useMemo(() => getAdminUsers(data), [data]);

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve user List!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner size={20} />;

  const arrayLength = adminUsersList?.length || 0;

  const renderRow = (props: ListChildComponentProps) => {
    const { index, style } = props;
    if (adminUsersList) {
      const adminUser = adminUsersList[index];
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
            to={`/user/${adminUser.username}`}
          >
            <ListItemText
              primary={
                adminUser.profile?.first_name
                  ? `${adminUser.profile?.first_name} ${adminUser.profile?.last_name}`
                  : adminUser.username
              }
              sx={{ whiteSpace: "normal" }}
            />
          </ListItemButton>
        </ListItem>
      );
    }
  };

  return (
    <Box marginTop={1}>
      {adminUsersList ? (
        <VirtualizedList
          height={arrayLength < 8 ? arrayLength * 50 : 400}
          itemCount={arrayLength}
          itemSize={50}
          overscanCount={5}
          width={"100%"}
        >
          {renderRow}
        </VirtualizedList>
      ) : null}
    </Box>
  );
}

export default AdminUsersList;
