import { useMemo } from "react";
import { CurrentWeatherForecastDataType } from "@/app/types/types";
import LineChart from "../shared/LineChart/LineChart";
import { externalTooltipHandler } from "@/app/utils/chartUtils";
import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

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

interface CurrentWeatherForecastProps {
  currentWeatherForecastData: CurrentWeatherForecastDataType[];
}

const CurrentWeatherForecast = ({
  currentWeatherForecastData,
}: CurrentWeatherForecastProps) => {
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
  const getCurrentWeatherForecastLabels = useMemo(() => {
    if (!currentWeatherForecastData) return [];

    return currentWeatherForecastData.map(
      (item: CurrentWeatherForecastDataType) => {
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
      }
    );
  }, [currentWeatherForecastData]);
  const getCurrentWeatherForecastDatasets = useMemo(() => {
    if (!currentWeatherForecastData?.length) return [];

    const temperatureDataset = {
      id: 1,
      label: "Temperature",
      data: currentWeatherForecastData.map((item) => item.currentTemperature),
      borderColor: "white",
      currentWeatherForecast: currentWeatherForecastData,
    };

    return [temperatureDataset];
  }, [currentWeatherForecastData]);

  return (
    <LineChart
      data={{
        labels: getCurrentWeatherForecastLabels,
        datasets: getCurrentWeatherForecastDatasets,
      }}
      options={options}
    />
  );
};

export default CurrentWeatherForecast;
