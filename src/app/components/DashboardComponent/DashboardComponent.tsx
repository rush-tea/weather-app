import { useState, useEffect } from "react";
import { fetchWeatherData } from "../../utils/requests";
import styles from "./DashboardComponent.module.css";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RiseLoader from "react-spinners/ClipLoader";
import * as _ from "lodash";
import Image from "next/image";
import { ThermostatOutlined } from "@mui/icons-material";
import {
  DashboardComponentProps,
  CurrentWeatherForecastDataType,
  WeatherDataType,
  WeeklyForecastDataType,
} from "@/app/types/types";
import CurrentWeatherForecast from "../CurrentWeatherForecastChart/CurrentWeatherForecast";
import WeeklyForecast from "../WeeklyForecastChart/WeeklyForecast";

const DashboardComponent = ({ coordinates }: DashboardComponentProps) => {
  const [weatherData, setWeatherData] = useState<WeatherDataType | null>(null);
  const [currentWeatherForecast, setCurrentWeatherForecast] = useState<
    CurrentWeatherForecastDataType[] | null
  >(null);
  const [weeklyForecast, setWeeklyForecast] = useState<
    WeeklyForecastDataType[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);

  const calculateAverage = (arr: number[]): number => {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
  }

  useEffect(() => {
    const fetchWeather = async () => {
      if (coordinates) {
        setLoading(true);
        const [latitude, longitude] = coordinates.split(" ");
        const response = await fetchWeatherData(latitude, longitude);
        const firstWeatherData =
          response && response.length > 0 ? response[0] : null;

        if (firstWeatherData) {
          const {
            coord,
            weather,
            main,
            visibility,
            wind,
            clouds,
            dt,
            sys,
            timezone,
            id,
            name,
          } = firstWeatherData;

          const sunriseDate = new Date(sys.sunrise * 1000);
          const sunsetDate = new Date(sys.sunset * 1000);

          const formattedSunrise = sunriseDate.toLocaleTimeString("en-US");
          const formattedSunset = sunsetDate.toLocaleTimeString("en-US");

          setWeatherData({
            latitude: coord.lat,
            longitude: coord.lon,
            weatherDescription: weather[0].description,
            iconCode: weather[0].icon,
            currentTemperature: main.temp,
            feelTemperature: main.feels_like,
            minTemperature: main.temp_min,
            maxTemperature: main.temp_max,
            pressure: main.pressure,
            humidity: main.humidity,
            visibility: visibility,
            windSpeed: wind.speed,
            degrees: wind.deg,
            clouds: clouds.all,
            time: dt,
            timezone: timezone,
            id: id,
            cityName: name,
            countryCode: sys.country,
            sunrise: formattedSunrise,
            sunset: formattedSunset,
          });

          const forecastData =
            response && response[1] && response[1].list.length > 0
              ? response[1].list
              : null;

          if (forecastData) {
            const todayMidnightTimestamp =
              new Date().setHours(0, 0, 0, 0) / 1000;
            const current_datetime = Math.floor(Date.now() / 1000);
            const current_date = new Date().toISOString().split("T")[0];

            const currentWeatherForecast: CurrentWeatherForecastDataType[] = [];
            const weeklyForecast: CurrentWeatherForecastDataType[] = [];

            for (let i = 0; i < forecastData.length; i++) {
              const item = forecastData[i];

              if (
                item.dt_txt.startsWith(current_date.substring(0, 10)) &&
                item.dt > current_datetime
              ) {

                currentWeatherForecast.push({
                  timestamp: item.dt,
                  currentTemperature: item.main.temp,
                  feelTemperature: item.main.feels_like,
                  pressure: item.main.pressure,
                  seaLevel: item.main.sea_level,
                  humidity: item.main.humidity,
                  weatherDescription: item.weather[0].description,
                  iconCode: item.weather[0].icon,
                  clouds: item.clouds.all,
                  windSpeed: item.wind.speed,
                  visibility: item.visibility,
                  timeStampText: item.dt_txt,
                });
              }

              if (item.dt > todayMidnightTimestamp) {
                const timestamp = new Date(item.dt * 1000);
                const timeString = timestamp.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                });

                weeklyForecast.push({
                  timestamp: item.dt,
                  currentTemperature: item.main.temp,
                  feelTemperature: item.main.feels_like,
                  pressure: item.main.pressure,
                  seaLevel: item.main.sea_level,
                  humidity: item.main.humidity,
                  weatherDescription: item.weather[0].description,
                  iconCode: item.weather[0].icon,
                  clouds: item.clouds.all,
                  windSpeed: item.wind.speed,
                  visibility: item.visibility,
                  timeStampText: item.dt_txt.slice(0, 10),
                });
              }
            }

            if (currentWeatherForecast.length < 7) {
              const remainingItems = 7 - currentWeatherForecast.length;
              currentWeatherForecast.push(
                ...weeklyForecast.slice(0, remainingItems)
              );
            }

            const groupedWeeklyForecast = _.groupBy(
              weeklyForecast,
              "timeStampText"
            );

            const averagedWeeklyForecast = Object.keys(
              groupedWeeklyForecast
            ).map((date) => {
              const items = groupedWeeklyForecast[date];
              console.log(items, date);
              const averageItem = {
                timestamp: date,
                currentTemperature: calculateAverage(
                  items.map((item) => item.currentTemperature)
                ),
                feelTemperature: calculateAverage(
                  items.map((item) => item.feelTemperature)
                ),
                pressure: calculateAverage(items.map((item) => item.pressure)),
                humidity: calculateAverage(items.map((item) => item.humidity)),
                windSpeed: calculateAverage(
                  items.map((item) => item.windSpeed)
                ),
              };
              return averageItem;
            });

            setCurrentWeatherForecast(currentWeatherForecast);
            if (averagedWeeklyForecast) {
              setWeeklyForecast(averagedWeeklyForecast);
            }
          }
        }
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  if (!weatherData && !loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className={styles.emptyContainer}
      >
        {" "}
        <h2>Choose Location to get Weather Details</h2>
      </div>
    );
  }

  if (loading && !weatherData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RiseLoader
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    weatherData && (
      <>
        <div className={styles.dashboardComponentContainer}>
          <div className={styles.currentWeatherSectionContainer}>
            <div className={styles.currentWeatherSection}>
              <div className={styles.currentLocationContainer}>
                <div className={styles.currentLocation}>
                  <LocationOnOutlinedIcon />
                  <h4>
                    {weatherData.cityName}, {weatherData.countryCode}
                  </h4>
                </div>

                <div className={styles.sunTimingContainer}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                      borderBottom: "1px solid white",
                    }}
                  >
                    <Image
                      style={{
                        marginRight: "8px",
                      }}
                      alt="Sunrise image"
                      src="/sunrise-icon.png"
                      width={20}
                      height={20}
                    />
                    <h5 style={{ opacity: 0.8 }}>{weatherData.sunrise}</h5>{" "}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px",
                    }}
                  >
                    <Image
                      style={{
                        marginRight: "8px",
                      }}
                      alt="Sunset Icon"
                      src="/sunset-icon.png"
                      width={20}
                      height={20}
                    />
                    <h5 style={{ opacity: 0.8 }}>{weatherData.sunset}</h5>{" "}
                  </div>
                </div>
              </div>
              <div className={styles.currentWeatherDetails}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <h4 style={{ opacity: 0.8 }}>
                    {weatherData.weatherDescription}{" "}
                  </h4>
                  <Image
                    src={`/${weatherData.iconCode}.png`}
                    width={40}
                    height={40}
                    alt="Weather Description"
                    style={{
                      marginLeft: "10px",
                    }}
                  />
                </div>

                <h1>{Math.round(weatherData.currentTemperature)} °C</h1>
              </div>
            </div>
          </div>
          <div className={styles.airConditionsSectionContainer}>
            <div className={styles.airConditionsSection}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ThermostatOutlined
                    sx={{
                      fontSize: "12px",
                      marginRight: "5px",
                    }}
                  />
                  <h6
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    Real Feel
                  </h6>
                </div>
                <h4>{Math.round(weatherData.feelTemperature)} °C</h4>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/50n.png"
                    width={20}
                    height={20}
                    alt="Wind speed"
                    style={{
                      marginRight: "5px",
                    }}
                  />{" "}
                  <h6
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    Wind Speed
                  </h6>
                </div>
                <h4>{Math.round(weatherData.windSpeed)} m/s</h4>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/04n.png"
                    width={20}
                    height={20}
                    alt="Clouds"
                    style={{
                      marginRight: "5px",
                    }}
                  />{" "}
                  <h6
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    Clouds
                  </h6>
                </div>
                <h4>{Math.round(weatherData.clouds)} %</h4>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src="/humidity.svg"
                    width={15}
                    height={15}
                    alt="Humidity"
                    style={{
                      marginRight: "5px",
                    }}
                  />{" "}
                  <h6
                    style={{
                      opacity: 0.8,
                    }}
                  >
                    Humidity
                  </h6>
                </div>
                <h4>{Math.round(weatherData.humidity)} %</h4>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.chartsContainer}>
          <div className={styles.todaysForecastChartContainer}>
            {currentWeatherForecast && (
              <CurrentWeatherForecast
                currentWeatherForecastData={currentWeatherForecast}
              />
            )}
          </div>
          <div className={styles.weeklyForecastChartContainer}>
            {weeklyForecast && (
              <WeeklyForecast weeklyForecastData={weeklyForecast} />
            )}
          </div>
        </div>
      </>
    )
  );
};

export default DashboardComponent;
