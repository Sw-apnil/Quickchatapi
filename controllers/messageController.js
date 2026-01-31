import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { formatMessage } from "../lib/utils.js"; 
// 🟢 formatMessage maps: sender -> senderId, receiver -> receiverId


// ======================================================
// Get all users except the logged-in user (Sidebar)
// ======================================================
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    const unseenMessages = {};
    const userLastMessageMap = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        sender: user._id,
        receiver: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }

      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: user._id },
          { sender: user._id, receiver: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .select("createdAt");

      userLastMessageMap[user._id] = lastMsg ? lastMsg.createdAt : null;
    });

    await Promise.all(promises);

    const usersWithLastMsg = filteredUsers.map((user) => {
      const u = user.toObject();
      u.lastMessageAt = userLastMessageMap[user._id] || null;
      return u;
    });

    res.json({
      success: true,
      users: usersWithLastMsg,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ======================================================
// Get all messages for selected user
// ======================================================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: selectedUserId },
        { sender: selectedUserId, receiver: myId },
      ],
    });

    await Message.updateMany(
      { sender: selectedUserId, receiver: myId },
      { seen: true }
    );

    // 🔴 CHANGED: map DB fields -> frontend contract
    const formattedMessages = messages.map((msg) => formatMessage(msg));

    res.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ======================================================
// Mark a message as seen
// ======================================================
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({
      success: true,
      message: "Message marked as seen",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// ======================================================
// Send message to selected user
// ======================================================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiver = req.params.id;   // selected user
    const sender = req.user._id;       // logged-in user

    if (!text && !image) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text,
      image: imageUrl,
    });

    // 🔴 CHANGED: format message for frontend consistency
    const formattedMessage = formatMessage(newMessage);

    // 🔴 CHANGED: emit formatted message (NOT raw DB doc)
    const receiverSocketId = userSocketMap[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", formattedMessage);
    }

    res.status(201).json({
      success: true,
      newMessage: formattedMessage,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ======================================================
// Delete a message
// ======================================================
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    message.deleted = true;
    message.text = "This message was deleted";
    message.image = "";
    await message.save();

    // 🔴 CHANGED: format deleted message
    const formattedDeleted = formatMessage(message);

    const senderSocketId = userSocketMap[message.sender];
    const receiverSocketId = userSocketMap[message.receiver];

    if (senderSocketId)
      io.to(senderSocketId).emit("messageDeleted", formattedDeleted);

    if (receiverSocketId)
      io.to(receiverSocketId).emit("messageDeleted", formattedDeleted);

    res.json({
      success: true,
      message: "Message deleted",
      data: formattedDeleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
