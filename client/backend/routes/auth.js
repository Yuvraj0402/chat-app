const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false });
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        });
        delete user.password;

        // Generate JWT (optional if using stateful or just returning user for now)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        return res.json({ status: true, user, token });
    } catch (ex) {
        next(ex);
    }
});

// LOGIN
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Don't send password
        const userObj = user.toObject();
        delete userObj.password;

        return res.json({ status: true, user: userObj, token });
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
