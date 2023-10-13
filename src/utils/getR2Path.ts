const getRootFolder = (platformId: string, gameId: number) => {
  return `game/${platformId}/${gameId}`;
};

export const getKeyframeBinaryPath = (
  platformId: string,
  gameId: number,
  keyframeId: number
) => {
  const rootFolder = getRootFolder(platformId, gameId);
  return `${rootFolder}/keyframes/${keyframeId}.bin`;
};

export const getGameChunkBinaryPath = (
  platformId: string,
  gameId: number,
  chunkId: number
) => {
  const rootFolder = getRootFolder(platformId, gameId);
  return `${rootFolder}/chunks/${chunkId}.bin`;
};

export const getGameMetadataPath = (platformId: string, gameId: number) => {
  const rootFolder = getRootFolder(platformId, gameId);
  return `${rootFolder}/metadata.json`;
};

export const getGameDataPath = (platformId: string, gameId: number) => {
  const rootFolder = getRootFolder(platformId, gameId);
  return `${rootFolder}/game.json`;
};
