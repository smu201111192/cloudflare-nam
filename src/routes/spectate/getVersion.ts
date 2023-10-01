
import { IContext } from "../../interfaces/IContext";
import { spectateService } from "../../service/SpectateService";
export default async function getVersion(c: IContext) {
    const version = spectateService.getVersion(c);
    return c.text(version);
}
