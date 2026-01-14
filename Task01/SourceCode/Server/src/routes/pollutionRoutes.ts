import { Router } from 'express';
import { checkPollution, getRecentSearches } from '../controllers/pollutionController';

const router = Router();

router.post('/check', checkPollution);

router.get('/history', getRecentSearches);

export default router;
