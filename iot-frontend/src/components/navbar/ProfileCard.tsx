import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useAuthStore from "../../store/authStore";
import ImageAvatar from "../ImageAvatar";

function ProfileCard() {
  const user = useAuthStore((state) => state.user);
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
        <ImageAvatar
          imgUrl={user?.profile?.profile_picture}
          altText={`${user?.profile?.first_name} ${user?.profile?.last_name}`}
          height={50}
          width={50}
        />

        <Stack alignItems="flex-start">
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            {user?.type}
          </Typography>
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            {user?.profile?.first_name} {user?.profile?.last_name}
          </Typography>
          <Typography
            component="h1"
            variant="h6"
            fontSize={16}
            noWrap
            textAlign="center"
          >
            {user?.email}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
