import { useState, useEffect, useMemo } from "react";
import { fetchWeatherData } from "../../utils/requests";
import styles from "./DashboardComponent.module.css";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import * as _ from "lodash";
import Image from "next/image";
import {
  ThermostatOutlined,
} from "@mui/icons-material";
import React from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DashboardComponentProps {
  coordinates: string | null;
}

interface WeatherDataType {
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

interface ForecastDataType {
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

interface WeeklyForecastDataType {
  timestamp: string;
  currentTemperature: number;
  feelTemperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
}

const DashboardComponent = ({ coordinates }: DashboardComponentProps) => {
  const [weatherData, setWeatherData] = useState<WeatherDataType | null>(null);
  const [todaysForecast, setTodaysForecast] = useState<
    ForecastDataType[] | null
  >(null);
  const [weekForecast, setWeekForecast] = useState<
    WeeklyForecastDataType[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);

  function calculateAverage(arr: number[]): number {
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

            const todaysForecast: ForecastDataType[] = [];
            const weekForecast: ForecastDataType[] = [];

            for (let i = 0; i < forecastData.length; i++) {
              const item = forecastData[i];

              if (
                item.dt_txt.startsWith(current_date.substring(0, 10)) &&
                item.dt > current_datetime
              ) {
                const timestamp = new Date(item.dt * 1000);

                todaysForecast.push({
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

                weekForecast.push({
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

            if (todaysForecast.length < 7) {
              const remainingItems = 7 - todaysForecast.length;
              todaysForecast.push(...weekForecast.slice(0, remainingItems));
            }

            const groupedWeekForecast = _.groupBy(
              weekForecast,
              "timeStampText"
            );
            const averagedWeekForecast = Object.keys(groupedWeekForecast).map(
              (date) => {
                const items = groupedWeekForecast[date];
                const averageItem = {
                  timestamp: date,
                  currentTemperature: calculateAverage(
                    items.map((item) => item.currentTemperature)
                  ),
                  feelTemperature: calculateAverage(
                    items.map((item) => item.feelTemperature)
                  ),
                  pressure: calculateAverage(
                    items.map((item) => item.pressure)
                  ),
                  humidity: calculateAverage(
                    items.map((item) => item.humidity)
                  ),
                  windSpeed: calculateAverage(
                    items.map((item) => item.windSpeed)
                  ),
                };
                return averageItem;
              }
            );

            setTodaysForecast(todaysForecast);
            if (averagedWeekForecast) {
              setWeekForecast(averagedWeekForecast);
            }
          }
        }
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates]);

  const getTodaysForecastLabels = useMemo(() => {
    if (!todaysForecast) return [];

    return todaysForecast.map((item: ForecastDataType) => {
      const timestamp = parseInt(item.timestamp);

      const date = new Date(timestamp * 1000);

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const period = hours < 12 ? "AM" : "PM";

      const timeString = `${formattedHours}:${minutes
        .toString()
        .padStart(2, "0")} ${period}`;

      return timeString;
    });
  }, [todaysForecast]);

  const getTodaysForecastDatasets = useMemo(() => {
    if (!todaysForecast?.length) return [];

    const temperatureDataset = {
      id: 1,
      label: "Temperature",
      data: todaysForecast.map((item) => item.currentTemperature),
      borderColor: "white",
      todaysForecast: todaysForecast,
    };

    return [temperatureDataset];
  }, [todaysForecast]);

  const getWeeklyForecastChartLabels = useMemo(() => {
    if (!weekForecast) return [];

    return weekForecast.map((item: WeeklyForecastDataType) => {
      const date = new Date(item.timestamp);

      const month = date.toLocaleString("en-US", { month: "long" });
      const day = date.getDate();

      const timeString = `${month} ${day}`;

      return timeString;
    });
  }, [weekForecast]);

  const getWeeklyForecastDatasets = useMemo(() => {
    if (!weekForecast?.length) return [];

    const temperatureDataset = {
      id: 1,
      label: "Temperature",
      data: weekForecast.map((item) => item.currentTemperature),
      borderColor: "white",
      todaysForecast: weekForecast,
    };

    return [temperatureDataset];
  }, [weekForecast]);

  const getOrCreateTooltip = (chart: {
    canvas: {
      parentNode: {
        querySelector: (arg0: string) => any;
        appendChild: (arg0: any) => void;
      };
    };
  }) => {
    let tooltipEl = chart.canvas.parentNode.querySelector("div");

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.style.background = "rgba(0, 0, 0, 0.7)";
      tooltipEl.style.borderRadius = "3px";
      tooltipEl.style.color = "white";
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = "none";
      tooltipEl.style.position = "absolute";
      tooltipEl.style.transform = "translate(-50%, 0)";
      tooltipEl.style.transition = "all .1s ease";

      const table = document.createElement("table");
      table.style.margin = "0px";

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context: { chart: any; tooltip: any }) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    while (tooltipEl.firstChild) {
      tooltipEl.firstChild.remove();
    }

    if (tooltip.body) {
      const todaysForecast = tooltip.dataPoints[0].dataset.todaysForecast;
      const tooltipDataIndex = tooltip.dataPoints[0].dataIndex;
      const selectedForecast = todaysForecast[tooltipDataIndex];

      const {
        currentTemperature,
        feelTemperature,
        weatherDescription,
        windSpeed,
        timestamp,
      } = selectedForecast;

      const formattedTimestamp = new Date(timestamp * 1000).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      );

      const forecastDetails = [
        { label: "Temperature", value: `${Math.round(currentTemperature)} °C` },
        { label: "Feels Like", value: `${Math.round(feelTemperature)} °C` },
        { label: "Weather ", value: weatherDescription },
        { label: "Wind Speed", value: `${Math.round(windSpeed)} m/s` },
      ];

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.padding = "5px";
      container.style.fontSize = "8px";
      container.style.minWidth = "100px";

      const heading = document.createElement("h3");
      heading.textContent = formattedTimestamp;
      heading.style.marginBottom = "10px";

      if (heading.textContent !== "Invalid Date") {
        container.appendChild(heading);
      }

      forecastDetails.forEach(({ label, value }) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.marginBottom = "5px";
        row.style.gap = "8px";
        row.style.fontSize = "8px";
        if (value === undefined || value.length === 0) {
          return;
        }

        const labelElement = document.createElement("span");
        labelElement.textContent = label;

        const valueElement = document.createElement("span");
        valueElement.textContent = value.toString();

        row.appendChild(labelElement);
        row.appendChild(valueElement);

        container.appendChild(row);
      });

      tooltipEl.appendChild(container);
    }
    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

tooltipEl.style.opacity = 1;
tooltipEl.style.font = tooltip.options.bodyFont.string;
tooltipEl.style.padding =
  tooltip.options.padding + "px " + tooltip.options.padding + "px";

const idealLeft = positionX + tooltip.caretX - 30;
const idealTop = positionY + tooltip.caretY;
const idealRight = positionX - tooltip.caretX + 30;


const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
const tooltipWidth = tooltip.width;

if (idealLeft < 0) {
  tooltipEl.style.left = Math.max(idealLeft, 0) + "px";
} else if (idealLeft + tooltipWidth > viewportWidth) {
  tooltipEl.style.left = viewportWidth - tooltipWidth + "px";
} else if (tooltip.caretX < tooltipWidth/2) {
  tooltipEl.style.left = idealLeft + 55 + "px";
} else {
  tooltipEl.style.left = idealLeft + "px";
}

tooltipEl.style.top = idealTop + "px";

  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false,
        position: "nearest",
        external: externalTooltipHandler as any,
      },
      legend: {
        display: false,
      },
      title: {
        text: "Weather forecast for today and tomorrow",
        display: true,
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          font: {
            size: 10,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
  };

  const optionsWeek: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false,
        position: "nearest",
        external: externalTooltipHandler as any,
      },
      legend: {
        display: false,
      },
      title: {
        text: "Weather forecast of next week",
        display: true,
        color: "white",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          font: {
            size: 8,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
  };

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
        {" "}
        <h2>Loading...</h2>
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
            <Line
              style={{
                width: "350px",
                height: "200px",
              }}
              data={{
                labels: getTodaysForecastLabels,
                datasets: getTodaysForecastDatasets,
              }}
              options={options}
            />
          </div>
          <div className={styles.weeklyForecastChartContainer}>
            <Line
              style={{
                width: "350px",
                height: "200px",
              }}
              data={{
                labels: getWeeklyForecastChartLabels,
                datasets: getWeeklyForecastDatasets,
              }}
              options={optionsWeek}
            />
          </div>
        </div>
      </>
    )
  );
};

export default DashboardComponent;
