export interface F1Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_type: string;
  circuit_key: number;
  circuit_short_name: string;
  country_key: number;
  country_name: string;
  location: string;
  year: number;
}

export interface F1Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  last_name: string;
  team_colour: string;
  team_name: string;
  name_acronym: string;
}

export interface F1Position {
  date: string;
  driver_number: number;
  position: number;
  session_key: number;
}

export interface F1CarData {
  date: string;
  driver_number: number;
  session_key: number;
  speed: number;
  gear: number;
  throttle: number;
  brake: boolean;
  drs: number;
  rpm: number;
}

export interface F1Timing {
  date: string;
  driver_number: number;
  session_key: number;
  lap_duration: number;
  lap_number: number;
  is_pit_out_lap: boolean;
  segments: number[];
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  st_speed?: number;
  i1_speed?: number;
  i2_speed?: number;
  date_start?: string;
  segments_sector_1?: number[];
  segments_sector_2?: number[];
  segments_sector_3?: number[];
  meeting_key?: number;
}

export interface F1RaceControl {
  meeting_key: number;
  session_key: number;
  date: string;
  driver_number: number | null;
  lap_number: number;
  category: string;
  flag: string | null;
  scope: string | null;
  sector: number | null;
  message: string;
}

export interface F1Weather {
  air_temperature: number;
  date: string;
  humidity: number;
  pressure: number;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}

export interface F1Interval {
  date: string;
  session_key: number;
  meeting_key: number;
  driver_number: number;
  interval: number | null;
  gap_to_leader: number;
}

export interface DashboardData {
  session: F1Session | null;
  drivers: F1Driver[];
  positions: F1Position[];
  carData: F1CarData[];
  timing: F1Timing[];
  intervals: F1Interval[];
  raceControl: F1RaceControl[];
  lastUpdated: Date;
}

export interface ApiError {
  message: string;
  status?: number;
} 