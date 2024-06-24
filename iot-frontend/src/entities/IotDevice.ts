import IotDeviceDetail from "./IotDeviceDetail";

interface IotDevice {
  id: number;
  user?: string | null;
  company?: string | null;
  dealer?: string | null;
  board_id?: number | null;
  is_active: boolean;
  created_at: Date;
  iot_device_details: IotDeviceDetail;
  sensor_name_list: string[];
}

export default IotDevice;
