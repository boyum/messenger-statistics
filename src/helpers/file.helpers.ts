import { FBConversation } from "../fb-types/FBConversation";
import { FBMessage } from "../fb-types/FBMessage";
import { FBParticipant } from "../fb-types/FBParticipant";
import { CountedWords } from "../types/CountedWords";
import countWords from "count-words-occurrence";

export type ConversationStatistics = {
  participants: Array<string>;
  numberOfMessages: number;
  numberOfCapsLockMessages: number;
  start: Date;
  end: Date;
  participantMessageCount: Record<string, number>;
  participantPhotoCount: Record<string, number>;
  participantVideoCount: Record<string, number>;
  participantAudioMessageCount: Record<string, number>;
  messagesPerDay: Record<string, Record<number, number>>;
  messagesPerDate: Record<string, Record<number, number>>;
  messagesPerMonth: Record<string, Record<number, number>>;
  wordOccurrences: Record<string, number>;
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function readConversations(
  conversations: FBConversation[],
): ConversationStatistics {
  const convoStats: ConversationStatistics = {
    participants: [],
    numberOfMessages: 0,
    numberOfCapsLockMessages: 0,
    participantMessageCount: {},
    participantPhotoCount: {},
    participantVideoCount: {},
    participantAudioMessageCount: {},
    messagesPerDay: {},
    messagesPerDate: {},
    messagesPerMonth: {},
    start: new Date(),
    end: new Date(),
    wordOccurrences: {},
  };

  const startTime = Date.now();
  console.log(`Started reading files at ${new Date().toISOString()}.`);

  const participants: Array<FBParticipant> = conversations[0].participants.map(
    participant => ({
      ...participant,
      name: fixLetters(participant.name),
    }),
  );
  const messages: Array<FBMessage> = conversations
    .flatMap(conversation => conversation.messages)
    .map(message => ({
      ...message,
      sender_name: fixLetters(message.sender_name),
    }));

  convoStats.participants = participants.map(participant => participant.name);

  // convoStats.messages = messages;
  convoStats.participantMessageCount = countMessagesFromParticipants(
    messages,
    participants,
  );

  convoStats.participantPhotoCount = photoCount(messages, participants);
  convoStats.participantVideoCount = videoCount(messages, participants);
  convoStats.participantAudioMessageCount = audioCount(messages, participants);

  convoStats.messagesPerDay = countMessagesPerDay(messages, participants);
  convoStats.messagesPerDate = countMessagesPerDate(messages, participants);
  convoStats.messagesPerMonth = countMessagesPerMonth(messages, participants);

  convoStats.numberOfMessages = messages.length;

  const timestamps = messages.map(message => message.timestamp_ms);
  convoStats.start = new Date(Math.min(...timestamps));
  convoStats.end = new Date(Math.max(...timestamps));

  const allWords = messages.map(message => message.content).filter(isDefined);
  // convoStats.wordOccurrences = countWords(allWords.join(" "));
  convoStats.numberOfCapsLockMessages = allWords.filter(word =>
    messageIsAllCaps(word),
  ).length;

  const endTime = Date.now();
  console.info(
    `\nFinished reading files at ${endTime}.\nTotal process time: ${
      (endTime - startTime) / 1000
    } seconds.`,
  );

  return convoStats;
}

function fixLetters(str: string): string {
  return str.replaceAll("Ã¸", "ø");
}

function groupMessagesByParticipants(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Array<FBMessage>> {
  console.log({ participants });

  const group: Record<string, Array<FBMessage>> = Object.fromEntries(
    participants.map(participant => [participant.name, []]),
  );

  messages
    .map(message => message)
    .forEach(message => {
      const name = message.sender_name;

      if (!group[name]) {
        console.log({ group, message });
      }
      return group[name].push(message);
    });

  return group;
}

function countMessagesFromParticipants(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, number> {
  const participantsCounter = Object.fromEntries(
    participants.map(participant => [participant.name, 0]),
  );

  messages
    .map(message => message.sender_name)
    .forEach(senderName => participantsCounter[senderName]++);

  return participantsCounter;
}

function photoCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithPhotos = messages.filter(message =>
    Boolean(message.photos),
  );
  return countMessagesFromParticipants(messagesWithPhotos, participants);
}

function videoCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithVideo = messages.filter(message => Boolean(message.videos));
  return countMessagesFromParticipants(messagesWithVideo, participants);
}

function audioCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithAudio = messages.filter(message =>
    Boolean(message.audio_files),
  );
  return countMessagesFromParticipants(messagesWithAudio, participants);
}

function messageIsAllCaps(message: string): boolean {
  return message.length > 1 && message.toUpperCase() === message;
}

function countMessagesPerDay(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Record<number, number>> {
  const groups = groupMessagesByParticipants(messages, participants);

  const newGroups = Object.fromEntries(
    Object.entries(groups).map(([participant, messages]) => {
      const days: Record<number, number> = {};

      for (const message of messages) {
        const dayMessageWasSentOn = new Date(message.timestamp_ms).getDay();

        if (!days[dayMessageWasSentOn]) {
          days[dayMessageWasSentOn] = 0;
        }

        days[dayMessageWasSentOn] += 1;
      }

      return [participant, days];
    }),
  );

  return newGroups;
}
function countMessagesPerDate(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Record<number, number>> {
  const groups = groupMessagesByParticipants(messages, participants);

  const newGroups = Object.fromEntries(
    Object.entries(groups).map(([participant, messages]) => {
      const dates: Record<number, number> = {};

      for (const message of messages) {
        const dateMessageWasSentOn = new Date(message.timestamp_ms).getDate();

        if (!dates[dateMessageWasSentOn]) {
          dates[dateMessageWasSentOn] = 0;
        }

        dates[dateMessageWasSentOn] += 1;
      }

      return [participant, dates];
    }),
  );

  return newGroups;
}

function countMessagesPerMonth(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Record<number, number>> {
  const groups = groupMessagesByParticipants(messages, participants);

  const newGroups = Object.fromEntries(
    Object.entries(groups).map(([participant, messages]) => {
      const months: Record<number, number> = {};

      for (const message of messages) {
        const monthMessageWasSentIn = new Date(message.timestamp_ms).getMonth();

        if (!months[monthMessageWasSentIn]) {
          months[monthMessageWasSentIn] = 0;
        }

        months[monthMessageWasSentIn] += 1;
      }

      return [participant, months];
    }),
  );

  return newGroups;
}
