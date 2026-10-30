import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// ==========================================
// GET CONVERSATIONS FOR CURRENT USER
// ==========================================
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "fullName email profileImage community")
      .sort({ updatedAt: -1 });

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          readAt: null
        });

        return {
          _id: conv._id,
          participants: conv.participants,
          otherParticipant: otherParticipant || null,
          lastMessage: conv.lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt
        };
      })
    );

    return res.status(200).json({
      conversations: formattedConversations
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
};

// ==========================================
// CREATE OR GET CONVERSATION WITH RECIPIENT
// ==========================================
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId } = req.body;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        message: "A valid recipient ID is required"
      });
    }

    if (recipientId.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot start a conversation with yourself"
      });
    }

    const recipient = await User.findById(recipientId).select(
      "fullName email profileImage community"
    );

    if (!recipient) {
      return res.status(404).json({
        message: "Recipient user not found"
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 }
    }).populate("participants", "fullName email profileImage community");

    let isNew = false;
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
      await conversation.populate(
        "participants",
        "fullName email profileImage community"
      );
      isNew = true;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    return res.status(isNew ? 201 : 200).json({
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        otherParticipant: otherParticipant || null,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt
      }
    });
  } catch (error) {
    console.error("Get Or Create Conversation Error:", error);
    return res.status(500).json({
      message: "Failed to access conversation",
      error: error.message
    });
  }
};

// ==========================================
// GET MESSAGES IN CONVERSATION
// ==========================================
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "fullName email profileImage community"
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You do not have access to this conversation"
      });
    }

    // Mark messages sent to this user as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readAt: null
      },
      {
        $set: { readAt: new Date() }
      }
    );

    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullName email profileImage")
      .sort({ createdAt: 1 });

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    return res.status(200).json({
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        otherParticipant: otherParticipant || null,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt
      },
      messages
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};

// ==========================================
// SEND MESSAGE
// ==========================================
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Message content cannot be empty"
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 2000) {
      return res.status(400).json({
        message: "Message length cannot exceed 2000 characters"
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You do not have access to this conversation"
      });
    }

    const message = new Message({
      conversationId,
      senderId: userId,
      text: trimmedText
    });

    await message.save();

    conversation.lastMessage = {
      text: trimmedText,
      senderId: userId,
      createdAt: new Date()
    };
    await conversation.save();

    await message.populate("senderId", "fullName email profileImage");

    return res.status(201).json({
      message
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message
    });
  }
};

// ==========================================
// MARK CONVERSATION AS READ
// ==========================================
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        message: "Invalid conversation ID"
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: "You do not have access to this conversation"
      });
    }

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        readAt: null
      },
      {
        $set: { readAt: new Date() }
      }
    );

    return res.status(200).json({
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark As Read Error:", error);
    return res.status(500).json({
      message: "Failed to mark messages as read",
      error: error.message
    });
  }
};

// ==========================================
// GET USERS FOR STARTING NEW CHATS
// ==========================================
export const getAvailableUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;

    let query = {
      _id: { $ne: userId }
    };

    if (search && search.trim() !== "") {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("_id fullName email profileImage community location")
      .limit(30)
      .sort({ fullName: 1 });

    return res.status(200).json({
      users
    });
  } catch (error) {
    console.error("Get Available Users Error:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};
