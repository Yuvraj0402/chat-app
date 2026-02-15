const router = require('express').Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// GET MEDIA (messages with files/images/audio) for a conversation - must be before /:conversationId
router.get('/:conversationId/media', async (req, res, next) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
            type: { $in: ['image', 'file', 'audio'] },
            'fileData.url': { $exists: true, $ne: '' }
        })
            .sort({ timestamp: -1 })
            .lean();
        return res.json(messages);
    } catch (ex) {
        next(ex);
    }
});

// GET MESSAGES
router.get('/:conversationId', async (req, res, next) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId });
        return res.json(messages);
    } catch (ex) {
        next(ex);
    }
});

// SEND MESSAGE
router.post('/', async (req, res, next) => {
    try {
        const { conversationId, sender, content, type, fileData, viewOnce } = req.body;
        const payload = {
            content: content || (fileData?.name ? fileData.name : ''),
            sender: sender,
            conversationId: conversationId,
            type: type || 'text',
            viewOnce: viewOnce || false
        };
        if (fileData && typeof fileData === 'object') {
            payload.fileData = {
                name: fileData.name,
                size: fileData.size,
                mimeType: fileData.mimeType,
                url: fileData.url
            };
        }
        const data = await Message.create(payload);

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: data._id
        });

        if (data) return res.json({ msg: "Message added successfully.", data });
        else return res.json({ msg: "Failed to add message into database" });
    } catch (ex) {
        next(ex);
    }
});

// MARK MESSAGE AS VIEWED (for view once messages)
router.post('/:messageId/mark-viewed', async (req, res, next) => {
    try {
        const { userId } = req.body;
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }

        // Only process if it's a view once message
        if (!message.viewOnce) {
            return res.json({ msg: "Not a view once message" });
        }

        // Check if already viewed
        const alreadyViewed = message.viewedBy.some(v => v.user.toString() === userId);

        if (!alreadyViewed) {
            // Mark as viewed
            message.viewedBy.push({ user: userId, viewedAt: new Date() });
            message.isExpired = true;
            await message.save();

            // Delete the file from server (optional - implement if needed)
            // const fs = require('fs');
            // const path = require('path');
            // if (message.fileData?.url) {
            //     const filePath = path.join(__dirname, '..', message.fileData.url);
            //     if (fs.existsSync(filePath)) {
            //         fs.unlinkSync(filePath);
            //     }
            // }

            return res.json({ msg: "Message marked as viewed", isExpired: true });
        }

        return res.json({ msg: "Already viewed", isExpired: true });
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;

