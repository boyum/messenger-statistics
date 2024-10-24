import type { FBVideoThumbnail } from "./FBVideoThumbnail";

export type FBVideo = {
  uri: string;
  creation_timestamp: string;
  thumbnail: FBVideoThumbnail;
};
