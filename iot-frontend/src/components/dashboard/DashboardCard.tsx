import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

interface Props {
  headerIcon: ReactNode;
  title: string;
  content: number | undefined;
}

function DashboardCard({ headerIcon, title, content }: Props) {
  return (
    <Card
      elevation={3}
      sx={{
        height: 1,
        maxWidth: 160,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={headerIcon}
        title={title}
        titleTypographyProps={{
          component: "h1",
          color: (theme) => theme.palette.text.secondary,
          fontSize: 16,
          sx: {
            wordBreak: "break-word",
          },
        }}
        sx={{
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          paddingBottom: 0,
        }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          flexGrow: 1,
          paddingY: 0,
          paddingX: content === undefined ? 0 : undefined,
          "&:last-child": {
            paddingBottom: 0,
          },
        }}
      >
        {content !== undefined ? (
          <Typography component="h2" variant="h3" textAlign="center">
            {content}
          </Typography>
        ) : (
          <Skeleton animation="wave" sx={{ width: 1, height: 50 }} />
        )}
      </CardContent>
    </Card>
  );
}

export default DashboardCard;
