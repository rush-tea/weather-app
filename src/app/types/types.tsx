export interface DashboardComponentProps {
  coordinates: string | null;
}

export interface WeatherDataType {
  latitude: number;
  longitude: number;
  weatherDescription: string;
  iconCode: string;
  currentTemperature: number;
  feelTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  pressure: number;
  humidity: number;
  visibility: number;
  windSpeed: number;
  degrees: number;
  clouds: number;
  time: number;
  timezone: number;
  id: number;
  cityName: string;
  countryCode: string;
  sunrise: string;
  sunset: string;
}

export interface CurrentWeatherForecastDataType {
  timestamp: string;
  currentTemperature: number;
  feelTemperature: number;
  pressure: number;
  seaLevel: number;
  humidity: number;
  weatherDescription: string;
  iconCode: string;
  clouds: number;
  windSpeed: number;
  visibility: number;
  timeStampText: string;
}

export interface WeeklyForecastDataType {
  timestamp: string;
  currentTemperature: number;
  feelTemperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
}
