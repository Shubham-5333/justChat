import React, { useState, useEffect, useRef } from "react";
import { Send, MoreVertical, Search, LogOut, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { RiAccountCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSocket, resetSocket } from "../socket";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const token = localStorage.getItem("token");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init socket once
  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.on("receiveMessage", (messageData) => {
      const chatId =
        messageData.sender === currentUser.id
          ? messageData.receiver
          : messageData.sender;

      setMessages((prev) => {
        const existing = prev[chatId] || [];
        // Deduplicate by _id
        const alreadyExists = existing.some((m) => m._id === messageData._id);
        if (alreadyExists) return prev;
        return { ...prev, [chatId]: [...existing, messageData] };
      });
    });

    socket.on("onlineUsers", (userIds) => {
      setOnlineUserIds(userIds);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
    };
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get("http://localhost:3000/api/chat", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredUsers = response.data.users.filter(
          (user) => user._id !== currentUser.id
        );

        setUsers(filteredUsers);

        if (filteredUsers.length > 0) {
          setActiveChat(filteredUsers[0]);
        }
      } catch (err) {
        console.error("[fetchUsers]", err);
      } finally {
        setLoadingUsers(false);
      }
    }; 

    fetchUsers();
  }, []);

  // Load messages when active chat changes
  useEffect(() => { 
    if (!activeChat) return;

    // If already loaded, don't re-fetch
    if (messages[activeChat._id]) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/messages/${activeChat._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages((prev) => ({
          ...prev,
          [activeChat._id]: response.data,
        }));
      } catch (error) {
        console.error("[fetchMessages]", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    socketRef.current.emit("privateMessage", {
      receiverId: activeChat._id,
      message: newMessage.trim(),
    });

    setNewMessage("");
  };

  const handleLogout = () => {
    resetSocket();
    localStorage.clear();
    navigate("/login");
  };

  const isOnline = (userId) => onlineUserIds.includes(userId);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages =
    activeChat && messages[activeChat._id] ? messages[activeChat._id] : [];

  return (
    <div className="chat-page">
      <div className="glass-panel chat-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>

          <div style={{ padding: "1rem", borderBottom: "1px solid var(--surface-border)" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Search chats..."
                style={{ paddingLeft: "2.5rem", borderRadius: "9999px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-list">
            {loadingUsers ? (
              <div className="empty-state">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={32} color="#94a3b8" />
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.75rem" }}>
                  {searchQuery ? "No users match your search" : "No other users yet"}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`chat-item ${activeChat?._id === user._id ? "active" : ""}`}
                  onClick={() => setActiveChat(user)}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar">{user.name?.slice(0, 2).toUpperCase()}</div>
                    <span className={`online-dot ${isOnline(user._id) ? "online" : "offline"}`} />
                  </div>

                  <div className="chat-item-content">
                    <div className="chat-item-name">{user.name}</div>
                    <div className="chat-item-preview">{user.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="main-chat" style={{ borderLeft: "1px solid var(--surface-border)" }}>
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="avatar-wrapper">
                  <div className="avatar">{activeChat?.name?.slice(0, 2).toUpperCase()}</div>
                  <span className={`online-dot ${isOnline(activeChat._id) ? "online" : "offline"}`} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3>{activeChat?.name}</h3>
                  <span style={{ color: isOnline(activeChat._id) ? "var(--success)" : "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {isOnline(activeChat._id)
                      ? <><Wifi size={12} /> Online</>
                      : <><WifiOff size={12} /> Offline</>}
                  </span>
                </div>

                <button className="btn-icon">
                  <RiAccountCircleFill  size={20} />
                </button>
              </div>

              <div className="messages-area">
                {loadingMessages ? (
                  <div className="empty-state" style={{ flex: 1 }}>
                    <div className="loading-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="empty-state" style={{ flex: 1 }}>
                    <MessageSquare size={40} color="#94a3b8" />
                    <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>
                      No messages yet. Say hi! 👋
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.sender === currentUser.id ? "sent" : "received"}`}
                    >
                      <div className="message-bubble">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={48} color="#94a3b8" />
              <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "1rem" }}>
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;