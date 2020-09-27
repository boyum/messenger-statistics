import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { FBConversation } from './fb-types/FBConversation';
import { FBMessage } from './fb-types/FBMessage';
import { FBParticipant } from './fb-types/FBParticipant';
import { CountedWords } from './types/CountedWords';

const readFile = promisify(fs.readFile);

// The name of the conversation. Conversations should be situated in /inbox
const conversationName: string = '';

const filesInConversation = fs.readdirSync(join(__dirname, '..', 'inbox', conversationName));
const files = filesInConversation.filter(fileName => fileName.includes('message_'));

const countedWords: string[] = [];

readFiles(files);

async function readFiles(files: string[]) {
  const startTime = Date.now();
  console.log(`Started reading files at ${new Date().toISOString()}.`);

  const conversations: FBConversation[] = await Promise.all(
    files
      .map(fileName => join(__dirname, '..', 'inbox', conversationName, fileName))
      .map(filePath => readFile(filePath))
      .map(async fileBuffer => (await fileBuffer))
      .map(async fileContentsBufferPromise => (await fileContentsBufferPromise).toString('utf-8'))
      .map(async fileContents => JSON.parse(await fileContents))
  );

  console.log(`All files read in ${(Date.now() - startTime) / 1000} seconds.\n`);

  const participants: FBParticipant[] = conversations[0].participants;
  const messages: FBMessage[] =
    conversations
      .flatMap(conversation => conversation.messages);

  console.info(`Participants: ${participants.map(participant => participant.name).join(',')}.\nTotal messages: ${messages.length}.\n`);

  if (countedWords.length) {
    const wordCount = countWords(messages, countedWords);
    console.info(`Number of times notable words were mentioned:\n${formatCountedWords(wordCount, false)}\n`);
  }

  const participantMessageCount = countMessagesFromParticipants(messages, participants);
  console.info(`Number of messages from participants:\n${formatCountedWords(participantMessageCount)}\n`);

  const participantPhotoCount = photoCount(messages, participants);
  console.info(`Number of messages from participants with photos:\n${formatCountedWords(participantPhotoCount)}\n`);

  const participantVideoCount = videoCount(messages, participants);
  console.info(`Number of messages from participants with videos:\n${formatCountedWords(participantVideoCount)}\n`);

  const participantAudioMessageCount = audioCount(messages, participants);
  console.info(`Number of messages from participants with audio messages:\n${formatCountedWords(participantAudioMessageCount)}\n`)

  const participantShoutMessageCount = countShouts(messages, participants);
  console.info(`Number of times participants have shouted:\n${formatCountedWords(participantShoutMessageCount)}\n`)

  const endTime = Date.now();
  console.log(`\nFinished reading files at ${endTime}.\nTotal process time: ${(endTime - startTime) / 1000} seconds.`);
}

function formatCountedWords(words: CountedWords, showTotal: boolean = true): string {
  const total = Object.entries(words).reduce((sum, [_, count]) => sum + count, 0);
  const totalString = showTotal ? `Total: ${total}` : '';

  const countedWordsFormatted =
    Object.entries(words)
      .map(([word, count]) => `${word}: ${count}`)
      .join('\n');

  return `${countedWordsFormatted}\n${totalString}`;
}

function countWords(messages: FBMessage[], words: string[]): CountedWords {
  return messages
    .map(message => message.content)
    .filter(Boolean)
    .reduce((countedWords, messageContent) => {
      for (const word of words) {
        const foundWordInMessageContent = messageContent.toLowerCase().includes(word);
        if (foundWordInMessageContent) {
          countedWords[word] ? countedWords[word]++ : 1;
        }
      }

      return countedWords;
    }, {} as CountedWords);
}

function countMessagesFromParticipants(messages: FBMessage[], participants: FBParticipant[]): CountedWords {
  const participantsCounter = Object.fromEntries(
    participants.map(participant => ([participant.name, 0]))
  );

  messages
    .map(message => message.sender_name)
    .forEach(senderName => participantsCounter[senderName]++);

  return participantsCounter;
}

function photoCount(messages: FBMessage[], participants: FBParticipant[]): CountedWords {
  const messagesWithPhotos = messages.filter(message => Boolean(message.photos));
  return countMessagesFromParticipants(messagesWithPhotos, participants);
}

function videoCount(messages: FBMessage[], participants: FBParticipant[]): CountedWords {
  const messagesWithVideo = messages.filter(message => Boolean(message.videos));
  return countMessagesFromParticipants(messagesWithVideo, participants);
}

function audioCount(messages: FBMessage[], participants: FBParticipant[]): CountedWords {
  const messagesWithAudio = messages.filter(message => Boolean(message.audio_files));
  return countMessagesFromParticipants(messagesWithAudio, participants);
}

function countShouts(messages: FBMessage[], participants: FBParticipant[]): CountedWords {
  const messagesWithOnlyShouts = messages.filter(message => message.content === '\u00f0\u009f\u0097\u00a3');
  return countMessagesFromParticipants(messagesWithOnlyShouts, participants);
}
