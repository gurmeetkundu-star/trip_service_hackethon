import express from 'express';
import { createPatch, getPatches } from '../controllers/patchController.js';

const router = express.Router();

router.post('/', createPatch);
router.get('/', getPatches);

export default router;
