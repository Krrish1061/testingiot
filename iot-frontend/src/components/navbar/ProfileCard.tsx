import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Face2Icon from "@mui/icons-material/Face2";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

function ProfileCard() {
  return (
    <Card
      elevation={0}
      sx={{
        width: 250,
        paddingTop: 2,
        marginBottom: -1,
      }}
    >
      <CardContent
        sx={{
          margin: 0,
          padding: 0,
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{
            height: 50,
            width: 50,
          }}
        >
          <Face2Icon color="primary" sx={{ height: 50, width: 50 }} />
        </Avatar>
        <Stack alignItems="flex-start">
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            Admin
          </Typography>
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            Krishna Sapkota
          </Typography>
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            admin@domain.com
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
