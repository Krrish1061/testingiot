import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";

interface Props {
  sensor: string;
  selectedDays: 1 | 7 | 15;
  isLoading: boolean;
  mainsinterruptionCountLoading: boolean;
  onClick: (index: 1 | 7 | 15) => void;
}

function DaysSelectors({
  selectedDays,
  onClick,
  isLoading,
  mainsinterruptionCountLoading,
  sensor,
}: Props) {
  return (
    <Stack direction="row" justifyContent="center">
      <ButtonGroup
        variant="outlined"
        size="large"
        sx={{
          "& .MuiButtonGroup-grouped": {
            fontSize: { xs: "12px", md: "15px" },
          },
        }}
        disabled={
          isLoading || (sensor === "mains" && mainsinterruptionCountLoading)
        }
      >
        <Button
          color={selectedDays === 1 ? "secondary" : "primary"}
          variant={selectedDays === 1 ? "contained" : undefined}
          // disabled={isLoading}
          onClick={() => onClick(1)}
        >
          Today
        </Button>
        <Button
          color={selectedDays === 7 ? "secondary" : "primary"}
          variant={selectedDays === 7 ? "contained" : undefined}
          // disabled={isLoading}
          onClick={() => onClick(7)}
        >
          Last 7 days
        </Button>
        <Button
          color={selectedDays === 15 ? "secondary" : "primary"}
          variant={selectedDays === 15 ? "contained" : undefined}
          // disabled={isLoading}
          onClick={() => onClick(15)}
        >
          Last 15 days
        </Button>
      </ButtonGroup>
    </Stack>
  );
}

export default DaysSelectors;
