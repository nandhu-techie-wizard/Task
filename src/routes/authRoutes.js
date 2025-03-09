const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', authMiddleware, getAllUsers);


module.exports = router;
