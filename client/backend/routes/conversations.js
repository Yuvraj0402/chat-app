const router = require('express').Router();
const Conversation = require('../models/Conversation');

// NEW CONVERSATION or GET EXISTING
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        // Check if conversation exists
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            isGroup: false
        });

        if (conversation) {
            return res.status(200).json(conversation);
        }

        const newConversation = new Conversation({
            participants: [senderId, receiverId]
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE GROUP CONVERSATION
router.post('/group', async (req, res) => {
    try {
        const { creatorId, participantIds, groupName } = req.body;

        // Include creator in participants
        const allParticipants = [creatorId, ...participantIds];

        const newGroupConversation = new Conversation({
            participants: allParticipants,
            isGroup: true,
            groupName: groupName,
            groupAvatar: null
        });

        const savedConversation = await newGroupConversation.save();

        // Populate participants before sending back
        const populatedConversation = await Conversation.findById(savedConversation._id)
            .populate('participants', 'username avatarImage email');

        res.status(200).json(populatedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET CONVERSATIONS OF A USER
router.get('/:userId', async (req, res) => {
    try {
        if (!req.params.userId || req.params.userId === 'undefined' || req.params.userId === 'null') {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const conversations = await Conversation.find({
            participants: { $in: [req.params.userId] },
        }).populate('participants', 'username avatarImage email').populate('lastMessage'); // populate participants to show names
        res.status(200).json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err); // Log the full error
        res.status(500).json(err);
    }
});

module.exports = router;
