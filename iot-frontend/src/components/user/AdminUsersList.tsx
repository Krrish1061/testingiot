import Box from "@mui/material/Box";
import useGetAllUser from "../../hooks/users/useGetAllUser";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Link as RouterLink } from "react-router-dom";
import User from "../../entities/User";
import UserTypes from "../../constants/userTypes";
import { useMemo } from "react";

function getAdminUsers(users: User[] | undefined) {
  if (!users) return null;
  // check for groups
  return users.filter(
    (user) => !user.is_associated_with_company && user.type === UserTypes.admin
  );
}

function AdminUsersList() {
  const { data, isError, isLoading } = useGetAllUser();
  const adminUsersList = useMemo(() => getAdminUsers(data), [data]);

  if (isError) return <Box>Error Ocurred</Box>;
  if (isLoading) return <Box>Loading</Box>;

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
              primary={`${adminUser.profile?.first_name} ${adminUser.profile?.last_name}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default AdminUsersList;
