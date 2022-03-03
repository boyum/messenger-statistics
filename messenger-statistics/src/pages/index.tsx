import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import { PeriodicChart } from "../components/PeriodicChart/PeriodicChart";
import { Summary } from "../components/Summary/Summary";
import { FBConversation } from "../fb-types/FBConversation";
import {
  ConversationStatistics,
  readConversations,
} from "../helpers/file.helpers";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [convoStats, setConvoStats] = useState<ConversationStatistics>();

  const readFiles = useCallback(async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const fileContents = await Promise.all(
      Array.from(files).map(file => file.text()),
    );

    const conversations = fileContents.map(
      file => JSON.parse(file) as FBConversation,
    );

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
