import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import Company from "../../entities/Company";
import IDealer from "../../entities/Dealer";
import User from "../../entities/User";
import ImageAvatar from "../ImageAvatar";

interface Props {
  imgUrl: string | null | undefined;
  altText: string;
  isUserDealer: boolean;
  isUserCompanySuperAdmin: boolean;
  user: User | null;
  company: Company | null;
  dealer: IDealer | null;
}

const InfoText = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h1"
    variant="h6"
    fontSize={14}
    noWrap
    textAlign="center"
  >
    {children}
  </Typography>
);

function ProfileCard({
  imgUrl,
  altText,
  isUserDealer,
  isUserCompanySuperAdmin,
  user,
  dealer,
  company,
}: Props) {
  const cardContent = () => {
    if (isUserDealer) {
      const content = (
        <Stack alignItems="flex-start">
          <InfoText>{dealer?.name}</InfoText>
          <InfoText>{dealer?.email}</InfoText>
        </Stack>
      );
      return content;
    } else if (isUserCompanySuperAdmin) {
      const content = (
        <Stack alignItems="flex-start">
          <InfoText>{company?.name}</InfoText>
          <InfoText>{company?.email}</InfoText>
        </Stack>
      );
      return content;
    } else {
      const content = (
        <Stack alignItems="flex-start">
          <InfoText>{user?.type}</InfoText>
          <InfoText>
            {user?.profile?.first_name
              ? `${user.profile.first_name} ${user.profile.last_name}`
              : user?.username}
          </InfoText>
          <InfoText>{user?.email}</InfoText>
        </Stack>
      );

      return content;
    }
  };

  return (
    <Card elevation={0}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ImageAvatar imgUrl={imgUrl} altText={altText} height={50} width={50} />
        {cardContent()}
      </CardContent>
    </Card>
  );
}

export default ProfileCard;
