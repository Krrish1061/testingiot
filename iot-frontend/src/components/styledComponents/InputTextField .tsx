import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const InputTextField = styled(TextField)(({ theme }) => ({
  "& input:-webkit-autofill": {
    WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
  },
}));

export default InputTextField;
