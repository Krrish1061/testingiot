import Company from "../entities/Company";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import useCompanies from "../hooks/useCompanies";
import Typography from "@mui/material/Typography";

const CompanyList = () => {
  const { data, error } = useCompanies();
  if (error) return <Typography>{error.message}</Typography>;

  return (
    <Box>
      <List disablePadding>
        {data
          ? data.map((company: Company, index: number) => (
              <ListItem
                disableGutters
                disablePadding
                key={index}
                divider={index !== data.length - 1}
              >
                <ListItemButton disableGutters>
                  <ListItemText primary={company.name} />
                </ListItemButton>
              </ListItem>
            ))
          : null}
      </List>
    </Box>
  );
};

export default CompanyList;
