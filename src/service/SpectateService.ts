
import { getClinetIp } from "../utils/getClientIp";
import { IMetaData } from "../interfaces/IMetaData";
import { ILastChunkInfo } from "../interfaces/ILastChunkInfo";
import { IContext } from "../interfaces/IContext";


class SpectateService {
    public getVersion(c: IContext) {
        return '2.0.0';
    }

    public async getGameMetaData(c: IContext, {region, gameId}: {region: string, gameId: string}) {
        const filePath = `${region}/${gameId}/metadata.json`        
        const res = await c.env.MY_BUCKET.get(filePath);        
        return res?.json();
    }

    public async getGameDataChunk(c: IContext, {region,gameId, chunkId}: {region: string, gameId: string,chunkId: string}){
        const filePath = `${region}/${gameId}/chunks/${chunkId}.bin`
        console.log(filePath);
        const res = await c.env.MY_BUCKET.get(filePath);
        console.log(res);
        return res?.blob();
    }

    public async getKeyFrame(c: IContext, {region,gameId, keyFrameId}: {region: string, gameId: string, keyFrameId: string}) {
        const filePath = `${region}/${gameId}/keyframes/${keyFrameId}.bin`
        const res = await c.env.MY_BUCKET.get(filePath);
        return res?.blob();
    }
    
    private findKeyFrameByChunkId(metadata: IMetaData, chunkId: number): number {
        let keyFrameId = 1;
        for (let keyFrameInfo of metadata.pendingAvailableKeyFrameInfo) {
            if (keyFrameInfo.nextChunkId > chunkId) {
                break;
            }
            keyFrameId = keyFrameInfo.keyFrameId;
        }
        return keyFrameId;
    }

    public async getLastChunkInfo(c:IContext, {region,gameId, chunkId}: {region: string, gameId: string,chunkId: string}) {
        const clientIp = getClinetIp(c);
        const lastChunkStr = await c.env.MY_KV.get(gameId + clientIp)
        
        if(lastChunkStr === null) {
            throw new Error('invalid call')
        }

        const lastChunkId = parseInt(lastChunkStr);

        let currentChunkId = lastChunkId + 1;                   
        console.log(currentChunkId)
        await c.env.MY_KV.put(gameId + clientIp, currentChunkId.toString());
        // catch 

        const metadataPath = `${region}/${gameId}/metadata.json`;
        const data = await c.env.MY_BUCKET.get(metadataPath);

        if(!data) {
            throw new Error('Not Found');
            // return c.notFound()
        }
        const metadata: IMetaData = await data.json()

        if (metadata.pendingAvailableChunkInfo.length === 0 || metadata.pendingAvailableKeyFrameInfo.length === 0)
            throw new Error("No chunks or keyFrames available");

        const firstChunkWithKeyFrame = metadata.pendingAvailableKeyFrameInfo[0].nextChunkId;
        let firstChunkId = firstChunkWithKeyFrame;

        // Quoting Divi from 7 years ago: "A bug appears when endStartupChunkId = 3 and startGameChunkId = 5, the game won't load"
        // Never had that an endStartupChunkId at 3 but leaving it for safety
        if (metadata.endStartupChunkId + 2 === firstChunkId) {
            firstChunkId = metadata.startGameChunkId + 2;
        }

        let keyFrameId = this.findKeyFrameByChunkId(metadata, firstChunkId);
        const lastChunkInfo: ILastChunkInfo = {
            chunkId: firstChunkId,
            availableSince: 30000,
            nextAvailableChunk: 30000,
            nextChunkId: firstChunkId,
            keyFrameId: keyFrameId,
            endStartupChunkId: metadata.endStartupChunkId,
            startGameChunkId: metadata.startGameChunkId,
            endGameChunkId: 0,
            duration: 30000
        }

        // If we don't have the chunks between 1 and the first chunk with keyFrame, skip them in order
        // to avoid the client to call getLastChunkInfo an unnecessary amount of times
        if (firstChunkId !== metadata.startGameChunkId && currentChunkId - 1 == metadata.startGameChunkId) {
            currentChunkId = firstChunkId;
            
            await c.env.MY_KV.put(gameId + clientIp, currentChunkId.toString())
            // this._clientsLastChunk[gameId + ip] = currentChunkId;
        }

        // In-game chunks
        if (currentChunkId > metadata.startGameChunkId) {
            // Failsafes for currentChunkId to not go out of bounds
            if (currentChunkId > metadata.lastChunkId) {
                currentChunkId = metadata.lastChunkId;
            } else if (currentChunkId < firstChunkWithKeyFrame) {
                currentChunkId = firstChunkWithKeyFrame;
            }
            keyFrameId = this.findKeyFrameByChunkId(metadata, currentChunkId);
            lastChunkInfo.keyFrameId = keyFrameId;
            lastChunkInfo.chunkId = currentChunkId;
            lastChunkInfo.nextChunkId = metadata.lastChunkId;
            lastChunkInfo.nextAvailableChunk = currentChunkId === firstChunkId + 6 ? 30000 : 100;
        }

        // No more chunks, game is finished.
        if (currentChunkId === metadata.lastChunkId) {
            lastChunkInfo.nextAvailableChunk = 90000;
            lastChunkInfo.endGameChunkId = metadata.endGameChunkId;
            // this.logInfo(`Client ${ip} has queried the last chunk info of game ${gameId} (${region})`);
        }
        return lastChunkInfo;
    }
}

export const spectateService = new SpectateService();