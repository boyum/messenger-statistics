import { FBAudioFile } from "./FBAudioFile";
import { FBMessageType } from "./FBMessageType";
import { FBPhoto } from "./FBPhoto";
import { FBReaction } from "./FBReaction";
import { FBVideo } from "./FBVideo";

export type FBMessage = {
  sender_name: string;
  timestamp_ms: number;
  type: FBMessageType;
  content?: string;
  photos?: FBPhoto[];
  reactions?: FBReaction[];
  audio_files?: FBAudioFile[];
  videos?: FBVideo[];
};
