interface SendMessage {
  type: string;
  company_slug?: string | undefined;
  username?: string | undefined;
  group_type?: string;
  sensor_name?: string;
  iot_device_id?: number;
}

export default SendMessage;
