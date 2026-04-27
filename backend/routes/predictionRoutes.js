const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generatePredictions,
  getPredictions,
  getAreaHeatmap,
} = require('../controllers/predictionController');

router.get('/', protect, getPredictions);
router.post('/generate', protect, authorize('admin'), generatePredictions);
router.get('/heatmap', protect, getAreaHeatmap);

module.exports = router;
