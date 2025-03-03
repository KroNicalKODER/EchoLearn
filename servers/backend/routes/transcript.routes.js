import express from 'express';

import { getTranscripts, saveTranscript } from '../controllers/transcript.controllers';

const router = express.Router();

router.post('/save', saveTranscript);
router.get('/:roomId', getTranscripts);

export default router;