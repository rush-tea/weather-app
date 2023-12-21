export const getOrCreateTooltip = (chart: {
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

export const externalTooltipHandler = (context: {
  chart: any;
  tooltip: any;
}) => {
  const { chart, tooltip } = context;
  console.log(tooltip);
  const tooltipEl = getOrCreateTooltip(chart);
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  while (tooltipEl.firstChild) {
    tooltipEl.firstChild.remove();
  }

  if (tooltip.body) {
    const currentWeatherForecast =
      tooltip.dataPoints[0].dataset.currentWeatherForecast;
    const tooltipDataIndex = tooltip.dataPoints[0].dataIndex;
    const selectedForecast = currentWeatherForecast[tooltipDataIndex];

    const {
      currentTemperature,
      feelTemperature,
      weatherDescription,
      windSpeed,
      timestamp,
    } = selectedForecast;

    let formattedTimestamp = "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
      formattedTimestamp = new Date(timestamp).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    } else if (/^\d{10}$/.test(timestamp)) {
      formattedTimestamp = new Date(timestamp * 1000).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      );
    }

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
    heading.style.marginBottom = "5px";

    if (heading.textContent.length > 0) {
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

  const viewportWidth =
    window.innerWidth || document.documentElement.clientWidth;
  const tooltipWidth = tooltip.width;

  if (idealLeft < 0) {
    tooltipEl.style.left = Math.max(idealLeft, 0) + "px";
  } else if (idealLeft + tooltipWidth > viewportWidth) {
    tooltipEl.style.left = viewportWidth - tooltipWidth + "px";
  } else if (tooltip.caretX < tooltipWidth / 2) {
    tooltipEl.style.left = idealLeft + 55 + "px";
  } else {
    tooltipEl.style.left = idealLeft + "px";
  }

  tooltipEl.style.top = idealTop + "px";
};
