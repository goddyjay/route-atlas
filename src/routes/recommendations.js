import { Router } from "express";
import {
  handleRecommendations,
  handleRecommendationsStream,
} from "../controllers/recommendationsController.js";
import { MODULE_TYPES } from "../modules/index.js";

const router = Router();

// Block-until-done JSON response. Kept as a fallback for non-SSE clients.
router.post("/", handleRecommendations);

// SSE streaming. Emits start → progress (many) → done | error.
router.post("/stream", handleRecommendationsStream);

router.get("/types", (req, res) => {
  res.json({ success: true, data: { types: MODULE_TYPES } });
});

export default router;
