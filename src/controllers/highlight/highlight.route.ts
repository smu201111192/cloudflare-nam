import { Hono } from "hono";
import { Environment } from "../../binding.types";
import * as highlightController from "./highlight.controller";
const highlightRoutes = new Hono<Environment>();

highlightRoutes.get("/", highlightController.getHighlights);

export default highlightRoutes;
