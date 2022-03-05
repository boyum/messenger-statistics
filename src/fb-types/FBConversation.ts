import { FBMessage } from "./FBMessage";
import { FBParticipant } from "./FBParticipant";

export type FBConversation = {
  participants: FBParticipant[];
  messages: FBMessage[];
  title: string;
  is_still_participant: boolean;
  thread_type: string;
  thread_path: string;
};
