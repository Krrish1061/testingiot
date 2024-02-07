interface IotDeviceSensor {
  id: number;
  iot_device: number;
  field_name: string;
  sensor_name: string;
  max_limit: number | null;
  min_limit: number | null;
  created_at: Date;
}

export default IotDeviceSensor;
