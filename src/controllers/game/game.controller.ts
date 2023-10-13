import { Handler } from "hono";
import * as gameRunnerService from "../../service/GameRunnerService";
import { Environment } from "../../binding.types";

export const startGame: Handler<Environment> = async (c) => {
  const region = c.req.param("region");
  const gameId = c.req.param("gameId");
  if (!region || !gameId) {
    return c.notFound();
  }
  const command = await gameRunnerService.getCommand(c.env.MY_BUCKET, {
    gameId,
    region,
  });
  return c.text(command);
};
