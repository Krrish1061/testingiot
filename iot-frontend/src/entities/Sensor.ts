interface Sensor {
  id: number;
  name: string;
  unit?: string;
  symbol?: string;
  created_at: Date;
  max_limit?: number;
  is_value_boolean?: boolean;
  min_limit?: number;
}

export default Sensor;
