import fs from "fs";
import { GAME } from "./GAME";
import {
  Chunk,
  ChunkHeader,
  ChunkType,
  Lengths,
  PayloadHeader,
  PendingAvailableChunkInfo,
  PendingAvailableKeyFrameInfo,
  ReplayMetadata,
} from "./RoflModel";

function getSignatures() {
  return [0x52, 0x49, 0x4f, 0x54, 0x00, 0x00];
}

function checkFileSignature(header_bytes: Uint8Array): boolean {
  let signatures = getSignatures();
  for (let i = 0; i < signatures.length; i++) {
    if (signatures[i] !== header_bytes[i]) {
      return false;
    }
  }
  return true;
}

export function parseRofl(roflPath: string) {
  const contents = fs.readFileSync(roflPath);
  const header_bytes = contents.subarray(0, 288);

  if (!checkFileSignature(header_bytes)) {
    console.log("file signatures does not match rofl format");
  }

  let length = new Lengths(header_bytes.subarray(262));
  let bytesLeft = length.File - length.Header;
  let file_content_bytes = contents.subarray(288, 288 + bytesLeft);
  let meta_data_length = length.Metadata;
  let metadata = file_content_bytes.subarray(0, meta_data_length);
  let payload_header_end = length.Metadata + length.PayloadHeader;
  let payload_header_start = length.Metadata;

  let payload_header = new PayloadHeader(
    file_content_bytes.subarray(payload_header_start, payload_header_end)
  );

  let chunk_header_results: Array<ChunkHeader> = [];
  let chunk_header_start = 0;

  for (
    let i = 0;
    i < payload_header.ChunkCount + payload_header.KeyframeCount;
    i++
  ) {
    chunk_header_start = payload_header_end + 17 * i;
    let chunk_header_bytes = file_content_bytes.subarray(
      chunk_header_start,
      chunk_header_start + 17
    );
    chunk_header_results.push(new ChunkHeader(chunk_header_bytes));
  }

  let chunk_results: Array<Chunk> = [];
  let chunk_offset = chunk_header_start + 17;

  let chunk_idx = 0;
  let keyframe_idx = 0;

  let pendingAvailableKeyFrameInfo: Array<PendingAvailableKeyFrameInfo> = [];
  let pendingAvailableChunkInfo: Array<PendingAvailableChunkInfo> = [];
  let game_chunk_bytes_Array: Array<Buffer> = [];
  let keyframe_bytes_array: Array<Buffer> = [];

  for (let i = 0; i < chunk_header_results.length; i++) {
    let chunk_header = chunk_header_results[i];

    let chunk_start = chunk_offset;
    let chunk_end = chunk_start + chunk_header.ChunkLength;
    let chunk_bytes = file_content_bytes.subarray(chunk_start, chunk_end);

    if (chunk_header.chunkType === ChunkType.Chunk) {
      chunk_idx = chunk_idx + 1;
      game_chunk_bytes_Array.push(chunk_bytes);
      pendingAvailableChunkInfo.push({
        chunkId: chunk_idx,
        duration: 30000,
        receivedTime: "Jul 4, 2023 8:05:31 AM",
      });
    }
    if (chunk_header.chunkType === ChunkType.keyframe) {
      keyframe_idx = keyframe_idx + 1;
      keyframe_bytes_array.push(chunk_bytes);
      pendingAvailableKeyFrameInfo.push({
        keyFrameId: keyframe_idx,
        receivedTime: "Jul 4, 2023 8:05:31 AM",
        nextChunkId: keyframe_idx * 2,
      });
    }

    chunk_results.push(
      new Chunk(chunk_header.chunkId, chunk_header.chunkType, chunk_bytes)
    );
    chunk_offset += chunk_header.ChunkLength;
  }

  let mte: ReplayMetadata = {
    gameServerAddress: "",
    port: 0,
    encryptionKey: "",
    chunkTimeInterval: 30000,
    startTime: "Jul 1, 2023 8:04:08 PM",
    gameEnded: true,
    lastChunkId: pendingAvailableChunkInfo.length,
    lastKeyFrameId: pendingAvailableKeyFrameInfo.length,
    endStartupChunkId: 1,
    delayTime: 180000,
    endGameChunkId: pendingAvailableChunkInfo.length,
    endGameKeyFrameId: pendingAvailableKeyFrameInfo.length,
    pendingAvailableChunkInfo: pendingAvailableChunkInfo,
    pendingAvailableKeyFrameInfo: pendingAvailableKeyFrameInfo,
    keyFrameTimeInterval: 60000000,
    decodedEncryptionKey: "",
    startGameChunkId: 2,
    gameLength: 0,
    clientAddedLag: 0,
    clientBackFetchingEnabled: false,
    clientBackFetchingFreq: 1000,
    interestScore: 3401,
    featuredGame: false,
    createTime: "Jul 1, 2023 8:04:24 PM",
  };

  GAME.gameId = payload_header.GameId.toString();
  GAME.observers.encryptionKey = payload_header.EncryptionKey;

  return {
    game: GAME,
    metadata: mte,
    keyframe_bytes_array,
    game_chunk_bytes_Array,
  };
}
