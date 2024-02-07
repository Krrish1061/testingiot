import IotDeviceDetail from "./IotDeviceDetail";

interface IotDevice {
  id: number;
  user?: string | null;
  company?: string | null;
  board_id?: number | null;
  is_active: boolean;
  iot_device_location: string | null;
  created_at: Date;
  iot_device_details: IotDeviceDetail;
}

export default IotDevice;
