const express = require('express');

const router = express.Router();
const { create } = require('../../controllers/instructor.controllers');
const { isAuthenticated } = require('../../middlewares/auth.middlewares');

router.post('/instructor', create);

module.exports = router;
