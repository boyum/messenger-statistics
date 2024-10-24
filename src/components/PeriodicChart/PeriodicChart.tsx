import { type FC, lazy, useMemo } from "react";
import type { AxisOptions } from "react-charts";
import { periodicDataToChartData } from "../../helpers/chart.helpers";
import type { LineChartData } from "../../types/LineChartData";
import type { PeriodType } from "../../types/PeriodType";

type PeriodicChartProps = {
  data: Record<string, Record<number, number>>;
  periodType: PeriodType;
};

const Chart = lazy(() =>
  import("react-charts").then(m => ({ default: m.Chart })),
);

export const PeriodicChart: FC<PeriodicChartProps> = ({ data, periodType }) => {
  const chartData = periodicDataToChartData(data, periodType);

  const primaryAxis = useMemo<AxisOptions<LineChartData>>(() => {
    const axis: AxisOptions<LineChartData> = {
      getValue: datum => datum.primary as unknown as Date,
    };

    if (periodType === "total") {
      axis.scaleType = "time";
    }

    return axis;
  }, [periodType]);

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
              aspectRatio: "2 / 1",
            }}
          >
            <Chart
              options={{
                data: chartData,
                primaryAxis: primaryAxis as AxisOptions<unknown>,
                secondaryAxes: secondaryAxes as AxisOptions<unknown>[],
              }}
            />
          </div>
        </>
      )}
    </>
  );
};
