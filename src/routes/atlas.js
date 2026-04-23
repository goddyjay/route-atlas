import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { saveAtlas, getAtlas, storeStats } from "../services/atlasStore.js";

const router = Router();

// POST /api/atlas
// Body: { data: <atlas JSON exactly as the frontend received from /api/recommendations> }
// Returns: { success: true, id: "abc123..." }
router.post(
  "/",
  body("data").isObject().withMessage("data must be the atlas object"),
  body("data.routes").isArray({ min: 1 }).withMessage("data.routes required"),
  body("data.user_snapshot").isString().withMessage("data.user_snapshot required"),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const id = saveAtlas(req.body.data);
    res.status(201).json({ success: true, id });
  }
);

// Lightweight introspection for diagnostics. Must be declared BEFORE the
// /:id route so Express matches it first.
router.get("/__stats", (req, res) => {
  res.json({ success: true, data: storeStats() });
});

// GET /api/atlas/:id
// Returns: { success: true, data: <stored atlas> }
router.get(
  "/:id",
  param("id").isString().isLength({ min: 4, max: 64 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const data = getAtlas(req.params.id);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Atlas not found or expired." });
    }
    res.json({ success: true, data });
  }
);

export default router;
