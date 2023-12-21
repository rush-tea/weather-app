import { useMemo } from "react";
import { WeeklyForecastDataType } from "@/app/types/types";
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

interface WeeklyForecastProps {
    weeklyForecastData: WeeklyForecastDataType[];
}

const WeeklyForecast = ({
  weeklyForecastData,
}: WeeklyForecastProps) => {
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
  const getWeeklyForecastChartLabels = useMemo(() => {
    if (!weeklyForecastData) return [];

    return weeklyForecastData.map((item: WeeklyForecastDataType) => {
      const date = new Date(item.timestamp);

      const month = date.toLocaleString("en-US", { month: "long" });
      const day = date.getDate();

      const timeString = `${month} ${day}`;

      return timeString;
    });
  }, [weeklyForecastData]);

  const getWeeklyForecastChartDatasets = useMemo(() => {
    if (!weeklyForecastData?.length) return [];

    const temperatureDataset = {
      id: 1,
      label: "Temperature",
      data: weeklyForecastData.map((item) => item.currentTemperature),
      borderColor: "white",
      currentWeatherForecast: weeklyForecastData,
    };

    return [temperatureDataset];
  }, [weeklyForecastData]);

  return (
    <LineChart
      data={{
        labels: getWeeklyForecastChartLabels,
        datasets: getWeeklyForecastChartDatasets,
      }}
      options={options}
    />
  );
};

export default WeeklyForecast;
