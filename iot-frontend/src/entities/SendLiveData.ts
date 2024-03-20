interface SendLiveData {
  id: number;
  company?: string;
  user?: string;
  endpoint: string;
  send_device_board_id: boolean;
}

export default SendLiveData;
