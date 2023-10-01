import { IContext } from "../interfaces/IContext";


class GameRunnerService {
    public async getWindowsGameStart(c:IContext,  {gameId,region, address, port}: {gameId: string,region: string, address: string, port: string}) {
        const filePath = `${region}/${gameId}/game.json`
        const res = await c.env.MY_BUCKET.get(filePath);
        if(!res) return c.notFound();        
        const obj = await res.json<{observers: {
            encryptionKey: string
        }}>();

        const encryptionKey = obj.observers.encryptionKey;
        const platformId = region;
    }
}