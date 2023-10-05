import Face2Icon from "@mui/icons-material/Face2";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

//  use Menu component from material Ui specially -- MenuList composition
function UserButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <div>
      <Button
        variant="outlined"
        size="medium"
        aria-describedby={id}
        onClick={handleClick}
        sx={{ backgroundColor: "white" }}
      >
        <Avatar
          sx={{
            marginRight: 2,
            height: 30,
            width: 30,
          }}
        >
          <Face2Icon color="primary" sx={{ height: 25, width: 25 }} />
        </Avatar>
        <Typography
          component="h1"
          variant="h6"
          //   color="white"
          fontSize={16}
          noWrap
          textAlign="center"
        >
          {/* first name only truncate the name if exceeds */}
          Krishna
        </Typography>
      </Button>
    </div>
  );
}

export default UserButton;
