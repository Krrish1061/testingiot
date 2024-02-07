import { useEffect } from "react";
import useWebSocketStore from "../../store/webSocketStore";
import useGetWebSocketToken from "./useGetWebSocketToken";

// function to get the name of the group for connecting to the websocket
// function getGroupName(user: User): string {
//   // for user associated with Company
//   if (user.is_associated_with_company) {
//     return user.company as string;
//   }

//   // for the admin user that are  not associated with comapny
//   if (user.groups.includes(UserGroups.adminGroup)) {
//     return `admin-user-${user.id}`;
//   }

//   // for the moderator and viewer user
//   return `admin-user-${user.extra_fields?.created_by}`;
// }

function useConnectWebSocket() {
  const connectWebSocket = useWebSocketStore((state) => state.connectWebSocket);
  const websocket = useWebSocketStore((state) => state.websocket);
  const {
    data: webSocketToken,
    mutateAsync: getWebSocketToken,
    isSuccess,
  } = useGetWebSocketToken();

  const websocketEndpoint = "ws://127.0.0.1:8000/ws/iot/pubsub/";

  useEffect(() => {
    if (!websocket && isSuccess) {
      connectWebSocket(websocketEndpoint + "?token=" + webSocketToken.token);
    }
    if (!websocket && !isSuccess) {
      (async () => await getWebSocketToken())();
    }

    // if (websocket) {
    //   if (!user?.groups.includes(UserGroups.superAdminGroup)) {
    //     const groupName = getGroupName(user as User);
    //     console.log("sendWebSocketMessage 4", groupName);
    //     sendWebSocketMessage({
    //       type: "group_subscribe",
    //       group_name: groupName,
    //       group_type: "company",
    //     });
    //   }
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websocket, isSuccess]);
}

export default useConnectWebSocket;
