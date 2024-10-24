import type { FC } from "react";
import styles from "./Participant.module.css";

type ParticipantProps = {
  name: string;
  color: string;
};

export const Participant: FC<ParticipantProps> = ({ name, color }) => {
  return (
    // @ts-expect-error Custom properties are ok
    <span className={styles.participant} style={{ "--color": color }}>
      <b>{name}</b>
    </span>
  );
};
