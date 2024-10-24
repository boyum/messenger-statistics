import type { FBAudioFile } from "./FBAudioFile";
import type { FBMessageType } from "./FBMessageType";
import type { FBPhoto } from "./FBPhoto";
import type { FBReaction } from "./FBReaction";
import type { FBVideo } from "./FBVideo";

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
