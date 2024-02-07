import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useWebSocketStore from "../../store/webSocketStore";

import IndexHeader from "../index/IndexHeader";
import LiveDataCardContainer from "../liveData/LiveDataCardContainer";

function RenderUserDashboard() {
  const { username } = useParams();
  const sendWebSocketMessage = useWebSocketStore(
    (state) => state.sendWebSocketMessage
  );
  const setliveDataToNull = useWebSocketStore(
    (state) => state.setliveDataToNull
  );

  useEffect(() => {
    setliveDataToNull();
    sendWebSocketMessage({
      type: "group_subscribe",
      username: username,
      group_type: "user",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <>
      <IndexHeader />
      <LiveDataCardContainer />
    </>
  );
}

export default RenderUserDashboard;
