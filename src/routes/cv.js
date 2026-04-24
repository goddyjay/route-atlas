import { Router } from "express";
import { handleCvCheck } from "../controllers/recommendationsController.js";

const router = Router();

// POST /api/cv/check
// Body: { cv_text: string, target_role?: string }
// Returns: { success: true, data: { ats_score, top_fixes, ... } }
router.post("/check", handleCvCheck);

export default router;
