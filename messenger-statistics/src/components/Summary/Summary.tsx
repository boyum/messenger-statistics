import { FC } from "react";
import { ConversationStatistics } from "../../helpers/file.helpers";
import styles from "./Summary.module.css";

type SummaryProps = {
  stats: ConversationStatistics;
};

export const Summary: FC<SummaryProps> = ({ stats }) => {
  const { start, end, numberOfMessages } = stats;

  const dateFmt = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  });
  const numberFmt = new Intl.NumberFormat("en");

  const msInOneDay = 24 * 60 * 60 * 1000;
  const totalNumberOfDays = Math.floor(
    (end.getTime() - start.getTime()) / msInOneDay,
  );

  const messagesPerDay = Math.floor(numberOfMessages / totalNumberOfDays);

  return (
    <div className={styles.container}>
      <p>
        We have analysed the conversation between{" "}
        <b>{stats.participants.slice(0, -1).join(", ")}</b> and{" "}
        <b>{stats.participants.slice(-1)}</b>, and have found out that there has
        been sent <b>{numberFmt.format(numberOfMessages)}</b> messages in the{" "}
        <b>{totalNumberOfDays}</b> days between <b>{dateFmt.format(start)}</b>{" "}
        and <b>{dateFmt.format(end)}</b>
        {messagesPerDay > 0 ? (
          <>
            , which means that about <b>{messagesPerDay}</b> messages are sent
            per day.{" "}
          </>
        ) : (
          <>.</>
        )}
        <b>{stats.numberOfCapsLockMessages}</b> of these messages were written
        in all caps.
      </p>
      {/* <p>
        The most used words were:
        <ul>
          {Object.entries(stats.wordOccurrences)
            .slice(0, 5)
            .map(([word, count]) => {
              <li>
                <b>{word}</b>: {count}
              </li>;
            })}
        </ul>
      </p> */}
    </div>
  );
};
