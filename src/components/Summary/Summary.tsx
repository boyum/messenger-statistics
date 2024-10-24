import type { FC } from "react";
import type { ConversationStatistics } from "../../helpers/file.helpers";
import { Participants } from "../Participants/Participants";
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
        <Participants participants={stats.participants} />, and have found out
        that there has been sent <b>{numberFmt.format(numberOfMessages)}</b>{" "}
        messages in the <b>{totalNumberOfDays}</b> days between{" "}
        <b>{dateFmt.format(start)}</b> and <b>{dateFmt.format(end)}</b>
        {messagesPerDay > 0 ? (
          <>
            , which means that about <b>{messagesPerDay}</b> messages are sent
            per day.
          </>
        ) : (
          <>.</>
        )}
        <b> {stats.numberOfCapsLockMessages}</b> of these messages were written
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
      <div>
        The most used emoji were:
        <ul>
          {Object.entries(stats.emojiOccurrences)
            .slice(0, 5)
            .map(([word, count]) => (
              <li key={word}>
                <b>{word} :</b> {count}
              </li>
            ))}
        </ul>
      </div>
      <p>
        In total, <b>{stats.totalPhotoCount}</b> images,{" "}
        <b>{stats.totalVideoCount}</b> videos and{" "}
        <b>{stats.totalAudioMessageCount}</b> audio clips were sent in the
        conversation.
      </p>
    </div>
  );
};
