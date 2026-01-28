import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import {io, userSocketMap} from "../server.js";


//Get all user except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    //Count the number of messages not seen
    const unseenMessages = {};
    // Store last message time for each user
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
      // Find the latest message exchanged with this user
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
    // Attach lastMessageAt to each user
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
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get all messages for selected user

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
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


// api to mark message as seen
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
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//send message to slected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiver = req.params.id;
    const sender = req.user._id;

    let imageUrl = "";
    if (!text && !image) {
      return res.status(400).json({
      success: false,
      message: "Message cannot be empty"
      });
    }



    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text,
      image: imageUrl
    });

     // Emit the new message to the receiver's socket immediately
    const receiverSocketId = userSocketMap[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      newMessage
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

