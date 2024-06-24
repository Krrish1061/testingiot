import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import ChangeImage from "../components/ChangeImage";
import ChangeImageBadge from "../components/ChangeImageBadge";
import ErrorReload from "../components/ErrorReload";
import ImageAvatar from "../components/ImageAvatar";
import LoadingSpinner from "../components/LoadingSpinner";
import CompanyProfile from "../components/company/CompanyProfile";
import ChangeEmailForm from "../components/user/ChangeEmailForm";
import ChangePasswordForm from "../components/user/ChangePasswordForm";
import useCompany from "../hooks/company/useCompany";
import useUpdateCompanyLogo from "../hooks/company/useUploadCompanyLogo";
import useCompanyStore from "../store/companyStore";
import useDrawerStore from "../store/drawerStore";

function ViewCompanyProfile() {
  const [open, setOpen] = useState(false);
  const { isError, isLoading, refetch } = useCompany();
  const company = useCompanyStore((state) => state.company);
  const [file, setFile] = useState<string>("");
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const selectedImage = useRef<HTMLInputElement | null>(null);

  const {
    mutateAsync,
    isSuccess,
    isLoading: updatingCompanyProfile,
  } = useUpdateCompanyLogo();

  const handleImageUpload = async () => {
    if (selectedImage.current && selectedImage.current.files) {
      await mutateAsync({ logo: selectedImage.current.files[0] });
    }
  };

  if (isError)
    return (
      <ErrorReload
        text="Could not Retrieve the Company details!!!"
        handleRefetch={() => refetch()}
      />
    );
  if (isLoading) return <LoadingSpinner size={40} />;
  if (company === null) return;

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
          <ChangeImageBadge
            setOpen={setOpen}
            setFile={setFile}
            selectedImage={selectedImage}
            imageAvatar={
              <ImageAvatar
                imgUrl={company.profile?.logo}
                altText={company.name}
                height={200}
                width={200}
              />
            }
          />
          <ChangeImage
            open={open}
            setOpen={setOpen}
            file={file}
            setFile={setFile}
            selectedImage={selectedImage}
            handleImageUpload={handleImageUpload}
            isSuccess={isSuccess}
            isLoading={updatingCompanyProfile}
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
            Change Password
          </Divider>

          <ChangePasswordForm />

          <Divider flexItem textAlign="left">
            Change Email Address
          </Divider>

          <ChangeEmailForm />
        </Stack>
      </Stack>
    </Box>
  );
}

export default ViewCompanyProfile;
