const router = require('express').Router();
const User = require('../models/User');

// GET ALL USERS (except current one ideally, but keeping simple)
router.get('/', async (req, res, next) => {
    try {
        const users = await User.find({}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex);
    }
});

// SET AVATAR
router.post('/startAvatar/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(
            userId,
            {
                isAvatarImageSet: true,
                avatarImage,
            },
            { new: true }
        );
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });
    } catch (ex) {
        next(ex);
    }
});

// DELETE USER
router.delete('/delete/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found", status: false });
        }
        return res.json({ msg: "User deleted successfully", status: true });
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
