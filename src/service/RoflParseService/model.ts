import { Buffer } from 'node:buffer';

enum ChunkType {
  keyframe,
  Chunk,
}

class Lengths {    
  Header: number;
  File: number;
  MetadataOffset: number;
  Metadata: number;
  PayloadHeaderOffset: number;
  PayloadHeader: number;
  PayloadOffset: number;

  constructor(byteData: Buffer) {
    this.Header = byteData.readUint16LE(0);
    this.File = byteData.readUint32LE(2);
    this.MetadataOffset = byteData.readUint32LE(6);
    this.Metadata = byteData.readUInt32LE(10);
    this.PayloadHeaderOffset = byteData.readUInt32LE(14);
    this.PayloadHeader = byteData.readUInt32LE(18);
    this.PayloadOffset = byteData.readUInt32LE(22);
  }

}

class Chunk {
  Id: number;
  Type: ChunkType;
  Data: Uint8Array;
  constructor(id: number, t: ChunkType, byte_data: Uint8Array) {
    this.Id = id;
    this.Type = t;
    this.Data = byte_data;
  }
}

class ChunkHeader {
  chunkId: number; // u32
  chunkType: ChunkType;
  ChunkLength: number; // u32
  NextChunkId: number; // u32
  Offset: number; // u32

  constructor(byte_data: Buffer) {
    this.chunkId = byte_data.readUint32LE(0);
    this.chunkType =
      byte_data[4] === 0x01 ? ChunkType.Chunk : ChunkType.keyframe;
    this.ChunkLength = byte_data.readUint32LE(5);
    this.NextChunkId = byte_data.readUint32LE(9);
    this.Offset = byte_data.readUint32LE(13);
  }
}

class PayloadHeader {
  GameId: BigInt; // u64
  GameLength: number; //u32;
  KeyframeCount: number; //u32
  ChunkCount: number; // u32
  EndStartupChunkId: number; // u32
  StartGameChunkId: number; // u32
  KeyframeInterval: number; // u32
  EncryptionKeyLength: number; // u16
  EncryptionKey: string;

  constructor(byte_data: Buffer) {
    let encryption_key_length = byte_data.readUint16LE(32);
    let usize_index = encryption_key_length;
    let encryption_key = new TextDecoder().decode(
      byte_data.subarray(34, 34 + usize_index)
    );
    this.GameId = byte_data.readBigInt64LE(0);
    this.GameLength = byte_data.readUint32LE(8);
    this.KeyframeCount = byte_data.readUint32LE(12);
    this.ChunkCount = byte_data.readUint32LE(16);
    this.EndStartupChunkId = byte_data.readUint32LE(20);
    this.StartGameChunkId = byte_data.readUint32LE(24);
    this.KeyframeInterval = byte_data.readUint32LE(28);
    this.EncryptionKeyLength = byte_data.readUint32LE(32);
    this.EncryptionKey = encryption_key;
  }
}
type PendingAvailableChunkInfo = {
  chunkId: number;
  duration: number;
  receivedTime: string;
};
type PendingAvailableKeyFrameInfo = {
  keyFrameId: number;
  receivedTime: string;
  nextChunkId: number;
};

type ReplayMetadata = {
  port: number;
  gameServerAddress: string;
  encryptionKey: string;
  chunkTimeInterval: number;
  startTime: string;
  gameEnded: boolean;
  lastChunkId: number;
  lastKeyFrameId: number;
  endStartupChunkId: number;
  delayTime: number;
  pendingAvailableChunkInfo: Array<PendingAvailableChunkInfo>;
  pendingAvailableKeyFrameInfo: Array<PendingAvailableKeyFrameInfo>;
  keyFrameTimeInterval: number;
  decodedEncryptionKey: string;
  startGameChunkId: number;
  gameLength: number;
  clientAddedLag: number;
  clientBackFetchingEnabled: boolean;
  clientBackFetchingFreq: number;
  interestScore: number;
  featuredGame: boolean;
  createTime: string;
  endGameChunkId: number;
  endGameKeyFrameId: number;
};
