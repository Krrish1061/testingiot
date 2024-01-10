import Box from "@mui/material/Box";
import DownloadIcon from "@mui/icons-material/Download";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useWebSocketStore from "../store/webSocketStore";
// import useGetWebSocketToken from "../hooks/useGetWebSocketToken";
// import { useEffect } from "react";
import LiveDataCardContainer from "../components/LiveDataCardContainer";

function Index() {
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  // const connectWebSocket = useWebSocketStore((state) => state.connectWebSocket);
  // const websocket = useWebSocketStore((state) => state.websocket);
  // const {
  //   data: webSocketToken,
  //   mutateAsync: getWebSocketToken,
  //   isSuccess,
  // } = useGetWebSocketToken();

  // useEffect(() => {
  //   // Connect to WebSocket when component mounts
  //   const endpoint = "ws://127.0.0.1:8000/ws/iot/pubsub/";
  //   if (!websocket && isSuccess) {
  //     connectWebSocket(endpoint + "?token=" + webSocketToken.token);
  //   }
  //   if (!websocket && !isSuccess) {
  //     (async () => await getWebSocketToken())();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [websocket, isSuccess]);

  const handleClick = (data: string) => {
    sendWebSocketMessage({
      type: "group_subscribe",
      group_name: data,
      group_type: "company",
    });
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        marginBottom={2}
        spacing={2}
      >
        <Typography variant="h6" component="h1">
          DASHBOARD
        </Typography>
        <Button
          variant="contained"
          size="medium"
          startIcon={<DownloadIcon />}
          onClick={() => handleClick("thoplo-machine-pvt-ltd")}
          color="secondary"
        >
          <Typography noWrap>DOWNLOAD DATA</Typography>
        </Button>
      </Stack>
      {/* {liveData && Object.entries(liveData).map(([iot_device_id, data], index))} */}
      <LiveDataCardContainer />
      <br />
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
      perferendis laborum nihil inventore deleniti architecto totam porro maxime
      repudiandae nisi nemo praesentium officiis consequatur deserunt laudantium
      eveniet, temporibus alias magni vitae illum quis. Possimus nulla quae quas
      voluptatem eveniet quos modi veritatis officia et itaque ipsa a rem nam
      voluptatum natus sint odio possimus culpa. Corporis molestiae laboriosam
      quisquam incidunt ad libero, quam, ipsum nisi deleniti fugit sequi vel
      voluptatibus similique assumenda perspiciatis iure. Quod eligendi
      voluptate, ilcilis eius illum, cupiditate eveniet dicta reprehenderit odit
      doloribus. Esse, aperiam quidem corporis natus dolorem sit dolorum hic
      laboriosam eaque officiis exercitationem, odit facere eveniet! Ex at vitae
      quas dolorum recusandae repellat asperiores, veniam officiis obcaecati
      expedita quisquam, magnam illum assumenda! Quasi itaque eos distinctio.
      Repellat unde accusantium beatae delectus amet exercitationem voluptate
      nemo hic molestias? Ex amet nobis optio nihil tempora consequatur quam
      possimus! Ea temporibus molestiae placeat quam! Natus soluta
      reprehenderit, sequi veritatis sunt totam officiis non. Autem doloremque
      laudantium voluptates, nobis ex quis vitae dolorem, a
    </Box>
  );
}

export default Index;
