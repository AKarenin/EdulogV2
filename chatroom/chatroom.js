import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth } from "../../firebase"; // Import Firebase auth to get the current user
import { chatWithGPT } from "../chatgpt/chatgpt";
import "./chatroom.css";

const Chatroom = ({ joinCode }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const studentId = auth.currentUser?.uid; // Get the current student's ID

  useEffect(() => {
    if (!joinCode || !studentId) return;

    const messagesRef = collection(
      db,
      "rooms",
      joinCode,
      "students",
      studentId,
      "messages"
    );

    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
    });

    return unsubscribe;
  }, [joinCode, studentId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !studentId) return;

    const messagesRef = collection(
      db,
      "rooms",
      joinCode,
      "students",
      studentId,
      "messages"
    );

    const userMessage = newMessage;
    setNewMessage("");

    try {
      // Save user's message
      await setDoc(doc(messagesRef), {
        text: userMessage,
        sender: "user",
        timestamp: serverTimestamp(),
      });

      setIsProcessing(true);

      // Get GPT's response
      const chatGPTReply = await chatWithGPT(userMessage);

      // Save GPT's response
      await setDoc(doc(messagesRef), {
        text: chatGPTReply,
        sender: "chatGPT",
        timestamp: serverTimestamp(),
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Error sending message:", error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-main">
        <div className="main-header">Chatroom: {joinCode}</div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message-container ${
                msg.sender === "chatGPT" ? "chatGPT-container" : "user-container"
              }`}
            >
              <div
                className={`chat-message ${
                  msg.sender === "chatGPT" ? "chatGPT" : "user"
                }`}
              >
                <strong>
                  {msg.sender === "chatGPT" ? "ChatGPT" : "You"}:
                </strong>{" "}
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="message-input-container">
          <input
            className="message-input"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="send-button"
            onClick={sendMessage}
            disabled={isProcessing}
          >
            {isProcessing ? "ChatGPT is thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
