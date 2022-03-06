import { FBConversation } from "../fb-types/FBConversation";
import { FBMessage } from "../fb-types/FBMessage";
import { FBParticipant } from "../fb-types/FBParticipant";
import { CountedWords } from "../types/CountedWords";

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
  totalPhotoCount: number;
  totalVideoCount: number;
  totalAudioMessageCount: number;
  messagesPerDay: Record<string, Record<number, number>>;
  messagesPerDate: Record<string, Record<number, number>>;
  messagesPerMonth: Record<string, Record<number, number>>;
  messagesInTotal: Record<string, Record<number, number>>;
  wordOccurrences: Record<string, number>;
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

export async function parseFile(file: File): Promise<FBConversation> {
  const decoder = new TextDecoder("utf-8");
  const decodedMessage = decoder.decode(await file.arrayBuffer());

  return JSON.parse(decodedMessage) as FBConversation;
}

export function readConversations(
  conversations: Array<FBConversation>,
): ConversationStatistics {
  const convoStats: ConversationStatistics = {
    participants: [],
    numberOfMessages: 0,
    numberOfCapsLockMessages: 0,
    participantMessageCount: {},
    participantPhotoCount: {},
    participantVideoCount: {},
    participantAudioMessageCount: {},
    totalPhotoCount: 0,
    totalVideoCount: 0,
    totalAudioMessageCount: 0,
    messagesPerDay: {},
    messagesPerDate: {},
    messagesPerMonth: {},
    messagesInTotal: {},
    start: new Date(),
    end: new Date(),
    wordOccurrences: {},
  };

  const startTime = Date.now();
  console.info(`Started reading files at ${new Date().toISOString()}.`);

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

  console.log({ messages });

  convoStats.participants = participants.map(participant => participant.name);

  convoStats.participantMessageCount = countMessagesFromParticipants(
    messages,
    participants,
  );

  convoStats.participantPhotoCount = photoCount(messages, participants);
  convoStats.participantVideoCount = videoCount(messages, participants);
  convoStats.participantAudioMessageCount = audioCount(messages, participants);

  convoStats.totalPhotoCount = getMessagesWithPhoto(messages).flatMap(
    message => message.photos,
  ).length;
  convoStats.totalVideoCount = getMessagesWithVideo(messages).flatMap(
    message => message.videos,
  ).length;
  convoStats.totalAudioMessageCount = getMessagesWithAudio(messages).flatMap(
    message => message.audio_files,
  ).length;

  convoStats.messagesPerDay = countMessagesPerDay(messages, participants);
  convoStats.messagesPerDate = countMessagesPerDate(messages, participants);
  convoStats.messagesPerMonth = countMessagesPerMonth(messages, participants);
  convoStats.messagesInTotal = countMessagesInTotal(messages, participants);

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
  return str.replaceAll("Ã¦", "æ").replaceAll("Ã¸", "ø").replaceAll("Ã¥", "å");
}

function groupMessagesByParticipants(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Array<FBMessage>> {
  const group: Record<string, Array<FBMessage>> = Object.fromEntries(
    participants.map(participant => [participant.name, []]),
  );

  for (const message of messages) {
    const name = message.sender_name;
    group[name].push(message);
  }

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

function getMessagesWithPhoto(messages: Array<FBMessage>): Array<FBMessage> {
  return messages.filter(message => Boolean(message.photos));
}

function photoCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithPhotos = getMessagesWithPhoto(messages);
  return countMessagesFromParticipants(messagesWithPhotos, participants);
}

function getMessagesWithVideo(messages: Array<FBMessage>): Array<FBMessage> {
  return messages.filter(message => Boolean(message.videos));
}

function videoCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithVideo = getMessagesWithVideo(messages);
  return countMessagesFromParticipants(messagesWithVideo, participants);
}

function getMessagesWithAudio(messages: Array<FBMessage>): Array<FBMessage> {
  return messages.filter(message => Boolean(message.audio_files));
}

function audioCount(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): CountedWords {
  const messagesWithAudio = getMessagesWithAudio(messages);
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

function countMessagesInTotal(
  messages: Array<FBMessage>,
  participants: Array<FBParticipant>,
): Record<string, Record<number, number>> {
  const groups = groupMessagesByParticipants(messages, participants);
  const msInThreeDays = 3 * 24 * 60 * 60 * 1000;

  const newGroups = Object.fromEntries(
    Object.entries(groups).map(([participant, messages]) => {
      const dates: Record<string, number> = {};

      for (const message of messages) {
        const date =
          Math.floor(message.timestamp_ms / msInThreeDays) * msInThreeDays;

        if (!dates[date]) {
          dates[date] = 0;
        }

        dates[date] += 1;
      }

      return [participant, dates];
    }),
  );

  return newGroups;
}
