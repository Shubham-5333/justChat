import React, { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});

  const token = localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/chat",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredUsers =
          response.data.users.filter(
            (user) => user._id !== currentUser.id
          );

        setUsers(filteredUsers);

        if (filteredUsers.length > 0) {
          setActiveChat(filteredUsers[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  // Receive socket messages
  useEffect(() => {
    socket.on("receiveMessage", (messageData) => {
      const chatId =
        messageData.sender === currentUser.id
          ? messageData.receiver
          : messageData.sender;

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), messageData],
      }));
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // Load old messages
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/messages/${activeChat._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages((prev) => ({
          ...prev,
          [activeChat._id]: response.data,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    fetchMessages();
  }, [activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return;

    socket.emit("privateMessage", {
      receiverId: activeChat._id,
      message: newMessage,
    });

    setNewMessage("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentMessages =
    activeChat && messages[activeChat._id]
      ? messages[activeChat._id]
      : [];

  return (
    <div className="chat-page">
      <div className="glass-panel chat-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>

            <button
              className="btn-icon"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </button>
          </div>

          <div
            style={{
              padding: "1rem",
              borderBottom:
                "1px solid var(--surface-border)",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                }}
              />

              <input
                type="text"
                className="input-field"
                placeholder="Search chats..."
                style={{
                  paddingLeft: "2.5rem",
                }}
              />
            </div>
          </div>

          <div className="chat-list">
            {users.map((user) => (
              <div
                key={user._id}
                className={`chat-item ${activeChat?._id === user._id
                    ? "active"
                    : ""
                  }`}
                onClick={() =>
                  setActiveChat(user)
                }
              >
                <div className="avatar">
                  {user.name
                    ?.slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="chat-item-content">
                  <div className="chat-item-name">
                    {user.name}
                  </div>

                  <div className="chat-item-preview">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}

        <div
          className="main-chat"
          style={{
            borderLeft:
              "1px solid var(--surface-border)",
          }}
        >
          <div className="chat-header">
            <div className="avatar">
              {activeChat?.name
                ?.slice(0, 2)
                .toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h3>{activeChat?.name}</h3>
              <span
                style={{
                  color: "var(--success)",
                }}
              >
                Online
              </span>
            </div>

            <button className="btn-icon">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="messages-area">
            {currentMessages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${msg.sender ===
                    currentUser.id
                    ? "sent"
                    : "received"
                  }`}
              >
                <div className="message-bubble">
                  {msg.message}
                </div>

                <div className="message-time">
                  {new Date(
                    msg.createdAt
                  ).toLocaleTimeString()}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="chat-input-area"
            onSubmit={handleSendMessage}
          >
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(
                    e.target.value
                  )
                }
              />
            </div>

            <button
              type="submit"
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;