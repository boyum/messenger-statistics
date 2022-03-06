import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { PeriodicChart } from "../components/PeriodicChart/PeriodicChart";
import { Summary } from "../components/Summary/Summary";
import {
  ConversationStatistics,
  parseFile,
  readConversations,
} from "../helpers/file.helpers";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [convoStats, setConvoStats] = useState<ConversationStatistics>();

  const readFiles = useCallback(async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const conversations = await Promise.all(
      Array.from(files).map(async file => parseFile(file)),
    );

    console.log({conversations})

    setConvoStats(readConversations(conversations));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Messenger statistics</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Conversation analyser</h1>

        {!convoStats && (
          <label className={styles.label}>
            Upload message file(s). These are usually called `message_X`.
            <input
              type="file"
              accept="application/json"
              multiple
              onInput={event =>
                readFiles((event.target as HTMLInputElement).files)
              }
            />
          </label>
        )}
        {convoStats && (
          <>
            <Summary stats={convoStats} />

            <PeriodicChart
              periodType="total"
              data={convoStats.messagesInTotal}
            />

            <div style={{ display: "flex" }}>
              <PeriodicChart
                periodType="day"
                data={convoStats.messagesPerDay}
              />
              <PeriodicChart
                periodType="month"
                data={convoStats.messagesPerMonth}
              />
              <PeriodicChart
                periodType="date"
                data={convoStats.messagesPerDate}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
