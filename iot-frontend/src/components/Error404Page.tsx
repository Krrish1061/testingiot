import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

const StyledGrid = styled(Grid)(({ theme }) => ({
  minHeight: "100vh",
  background: theme.palette.background.default,
  padding: theme.spacing(6, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(8),
  },
}));

const StyledTextCenter = styled("div")({
  textAlign: "center",
});

const Title = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  fontSize: theme.typography.h6.fontSize,
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.primary.main,
}));

const Subtitle1 = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h3.fontSize,
  fontWeight: theme.typography.fontWeightBold,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    fontSize: theme.typography.h4.fontSize,
  },
}));

const Subtitle2 = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  fontSize: theme.typography.h6.fontSize,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.secondary,
}));

const HomeButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginTop: theme.spacing(2),
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function Error404Page() {
  const navigate = useNavigate();
  const error = useRouteError();
  return (
    <StyledGrid container justifyContent="center" alignContent="center">
      <StyledTextCenter>
        {isRouteErrorResponse(error) ? (
          <>
            <Title>404</Title>
            <Subtitle1 variant="h5">Page not found</Subtitle1>
          </>
        ) : (
          <>
            <Title>Oops!!!</Title>
            <Subtitle1 variant="h5">Something went wrong!!</Subtitle1>
          </>
        )}
        <Subtitle2 variant="body2">
          Sorry, we couldn’t find the page you’re looking for.
        </Subtitle2>
        <HomeButton
          variant="contained"
          onClick={() => {
            navigate("/", {
              replace: true,
            });
          }}
        >
          Go back home
        </HomeButton>
      </StyledTextCenter>
    </StyledGrid>
  );
}

export default Error404Page;
