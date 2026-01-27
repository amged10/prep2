// Resources feature removed
const express = require('express');
const router = express.Router();

// All routes return 410 Gone to indicate removal
router.use((req, res) => {
  res.status(410).json({ message: 'Resources feature removed' });
});

module.exports = router;
