import { FC, useCallback } from "react";
import { Participant } from "../Participant/Participant";

// https://github.com/TanStack/react-charts/blob/beta/src/components/Chart.tsx#L40-L57
const defaultColorScheme = [
  "#0f83ab",
  "#faa43a",
  "#fd6868",
  "#53cfc9",
  "#a2d925",
  "#decf3f",
  "#734fe9",
  "#cd82ad",
  "#006d92",
  "#de7c00",
  "#f33232",
  "#3f9a80",
  "#53c200",
  "#d7af00",
  "#4c26c9",
  "#d44d99",
] as const;

type ParticipantsProps = {
  participants: Array<string>;
};

export const Participants: FC<ParticipantsProps> = ({ participants }) => {
  const getColor = useCallback(
    (index: number) => defaultColorScheme[index],
    [],
  );

  return (
    <>
      {participants.map((name, index) => (
        <Participant
          key={name}
          name={name}
          color={getColor(index)}
          isSecondToLast={index === participants.length - 2}
          isLast={index === participants.length - 1}
        />
      ))}
    </>
  );
};
