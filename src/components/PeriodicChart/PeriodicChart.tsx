import { FC, useMemo } from "react";
import { AxisOptions, Chart, UserSerie } from "react-charts";
import { periodicDataToChartData } from "../../helpers/chart.helpers";
import { LineChartData } from "../../types/LineChartData";
import { PeriodType } from "../../types/PeriodType";

type PeriodicChartProps = {
  data: Record<string, Record<number, number>>;
  periodType: PeriodType;
};

export const PeriodicChart: FC<PeriodicChartProps> = ({ data, periodType }) => {
  const chartData = periodicDataToChartData(data, periodType);

  const primaryAxis = useMemo<AxisOptions<LineChartData>>(
    () => ({
      getValue: datum => datum.primary as unknown as Date,
    }),
    [],
  );

  const secondaryAxes = useMemo<AxisOptions<LineChartData>[]>(
    () => [
      {
        getValue: datum => datum.secondary,
        scaleType: "linear",
      },
    ],
    [],
  );

  return (
    <>
      {chartData && (
        <>
          <div
            style={{
              position: "relative",
              minWidth: "300px",
              width: "100%",
              aspectRatio: "1",
            }}
          >
            <Chart
              options={{
                data: chartData,
                primaryAxis,
                secondaryAxes,
              }}
            />
          </div>
        </>
      )}
    </>
  );
};
