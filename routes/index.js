const express = require('express');
const router = express.Router();
const { 
  getIndex,
  getShowSearchResult,
} = require('../controllers/index'); 

router.get('/search', getShowSearchResult);
router.get('/', getIndex);

module.exports = router;
