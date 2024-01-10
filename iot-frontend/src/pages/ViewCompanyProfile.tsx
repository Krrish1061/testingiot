import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useDrawerStore from "../store/drawerStore";
import useCompany from "../hooks/company/useCompany";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import ImageAvatar from "../components/ImageAvatar";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { ChangeEvent, useState, useRef } from "react";
import CompanyProfile from "../components/company/CompanyProfile";
import ChangeCompanyEmail from "../components/company/ChangeCompanyEmail";
import useCompanyStore from "../store/companyStore";
import VisuallyHiddenInput from "../components/styledComponents/VisuallyHiddenInput";
import ChangeCompanyLogo from "../components/company/ChangeCompanyLogo";

function ViewCompanyProfile() {
  const [open, setOpen] = useState(false);
  const { isError, isLoading } = useCompany();
  const company = useCompanyStore((state) => state.company);
  const [file, setFile] = useState<string>("");
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const selectedImage = useRef<HTMLInputElement | null>(null);

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      setFile(URL.createObjectURL(file[0]));
      setOpen(true);
    }
  };

  if (isError) return <div> error occured</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h6" component="h1" m={1}>
        Company Profile
      </Typography>

      <Stack
        direction={{
          xs: "column",
          sm: isDrawerOpen ? "column" : "row",
          md: "row",
        }}
        justifyContent="center"
        alignItems={{
          xs: "center",
          sm: isDrawerOpen ? "center" : "flex-start",
          md: "flex-start",
        }}
        spacing={2}
        marginTop={2}
        padding={2}
      >
        <Stack justifyContent="center" alignItems="center" spacing={3}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <IconButton
                size="small"
                component="label"
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "secondary.dark",
                  },
                }}
              >
                <EditIcon fontSize="inherit" sx={{ color: "white" }} />
                <VisuallyHiddenInput
                  ref={selectedImage}
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                />
              </IconButton>
            }
          >
            <ImageAvatar
              imgUrl={company.profile?.logo}
              altText={company.name}
              height={200}
              width={200}
            />
          </Badge>
          <ChangeCompanyLogo
            open={open}
            setOpen={setOpen}
            file={file}
            setFile={setFile}
            selectedImage={selectedImage}
          />

          <Box component="div" textAlign="center">
            <Typography variant="body1" component="h1" fontWeight="bold">
              {company.name}
            </Typography>
          </Box>
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderRightWidth: 2,
            display: {
              xs: "none",
              sm: isDrawerOpen ? "none" : "block",
              md: "block",
            },
          }}
        />

        <Stack spacing={1}>
          <Divider flexItem textAlign="left">
            Company Information
          </Divider>

          <CompanyProfile />

          <Divider flexItem textAlign="left">
            Change Email Address
          </Divider>
          {/* below component backend is not fully implemented */}
          <ChangeCompanyEmail email={company.email} />
        </Stack>
      </Stack>
    </Box>
  );
}

export default ViewCompanyProfile;
