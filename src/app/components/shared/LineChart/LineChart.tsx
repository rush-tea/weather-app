import React from "react";
import {
  Chart as ChartJS,
  ChartData,
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
import { Line } from "react-chartjs-2";

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

interface LineChartPropsType {
  options: ChartOptions<"line">;
  data: ChartData<"line", number[], string>;
}

const LineChart = ({ options, data }: LineChartPropsType) => {
  return (
    <Line
      style={{
        width: "350px",
        height: "200px",
      }}
      data={data}
      options={options}
    />
  );
};

export default LineChart;
