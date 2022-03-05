import { FC } from "react";
import styles from "./Participant.module.css";

type ParticipantProps = {
  name: string;
  color: string;
  isSecondToLast: boolean;
  isLast: boolean;
};

export const Participant: FC<ParticipantProps> = ({
  name,
  color,
  isSecondToLast,
  isLast,
}) => {
  const suffix = isLast ? null : isSecondToLast ? " and " : ", ";

  return (
    // @ts-expect-error Custom properties are ok
    <span className={styles.participant} style={{ "--color": color }}>
      <b>{name}</b>
      {suffix}
    </span>
  );
};
