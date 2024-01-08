import type { UserSerie } from "react-charts";
import { LineChartData } from "../types/LineChartData";
import { PeriodType } from "../types/PeriodType";

const dayNames = {
  0: "Søndag",
  1: "Mandag",
  2: "Tirsdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lørdag",
};

const monthNames = {
  0: "Januar",
  1: "Februar",
  2: "Mars",
  3: "April",
  4: "Mai",
  5: "Juni",
  6: "Juli",
  7: "August",
  8: "September",
  9: "Oktober",
  10: "November",
  11: "Desember",
};

const formatDate = (periodType: PeriodType, value: number) => {
  switch (periodType) {
    case "day":
      // @ts-expect-error
      return dayNames[value] ?? value;

    case "month":
      // @ts-expect-error
      return monthNames[value] ?? value;

    case "total":
      return new Date(value);

    default:
      return value;
  }
};

export const periodicDataToChartData = (
  periodicData: Record<string, Record<number, number>>,
  periodType: PeriodType,
): Array<UserSerie<LineChartData>> => {
  const data: Array<UserSerie<LineChartData>> = [];

  Object.entries(periodicData).map(([participant, days]) => {
    Object.entries(days).map(([date, count]) => {
      const participantIsAdded = data.find(
        serie => serie.label === participant,
      );

      const primary = formatDate(periodType, Number.parseInt(date, 10));

      if (participantIsAdded) {
        participantIsAdded.data.push({
          primary,
          secondary: count,
        });
      } else {
        data.push({
          label: participant,
          data: [
            {
              primary,
              secondary: count,
            },
          ],
        });
      }
    });
  });

  return data;
};
