import useGetAllUser from "../../hooks/users/useGetAllUser";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Link as RouterLink } from "react-router-dom";
import User from "../../entities/User";
import UserTypes from "../../constants/userTypes";
import { useMemo } from "react";
import ErrorReload from "../ErrorReload";
import LoadingSpinner from "../LoadingSpinner";

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
  if (isLoading) return <LoadingSpinner />;

  return (
    <List disablePadding>
      {adminUsersList?.map((adminUser, index: number) => (
        <ListItem
          disableGutters
          disablePadding
          key={index}
          divider={index !== adminUsersList.length - 1}
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
      ))}
    </List>
  );
}

export default AdminUsersList;
