import { Router } from 'express';
import { HistoryController } from './history.controller';

const router = Router();

router.get('/getAll/:userId', HistoryController.getAllHistory);

export const HistoryRoutes = router;
