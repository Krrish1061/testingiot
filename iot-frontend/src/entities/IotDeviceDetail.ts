interface IotDeviceDetail {
  name: string | null;
  environment_type: string | null;
  optimal_operating_environment?: object | null;
  description: string | null;
  power_consumption?: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  device_specifications: object | null;
}

export default IotDeviceDetail;
