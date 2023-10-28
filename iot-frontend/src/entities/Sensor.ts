interface Sensor {
  name: string;
  unit?: string;
  symbol?: string;
  created_at: Date;
  max_value?: number;
  min_value?: number;
}

export default Sensor;
