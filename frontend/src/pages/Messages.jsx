import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaComments,
  FaPaperPlane,
  FaUserCircle,
  FaSearch,
  FaPlus,
  FaTimes,
  FaArrowLeft,
  FaSyncAlt,
  FaCheck
} from "react-icons/fa";
import "../styles/Messages.css";

function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get("recipientId");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // New Chat Modal States
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.id || u?._id;
    } catch {
      return null;
    }
  })();

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto"
      });
    }
  };

  // ==========================================
  // FETCH CONVERSATIONS
  // ==========================================
  const fetchConversations = async (selectConvId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const convList = response.data.conversations || [];
      setConversations(convList);

      if (selectConvId) {
        const found = convList.find((c) => c._id === selectConvId);
        if (found) {
          setSelectedConversation(found);
        }
      }

      setError("");
    } catch (err) {
      console.error("Fetch Conversations Error:", err);
      setError(
        err.response?.data?.message || "Failed to load conversations"
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  // ==========================================
  // FETCH MESSAGES FOR SELECTED CONVERSATION
  // ==========================================
  const fetchMessages = async (convId, isPolling = false) => {
    if (!convId) return;

    try {
      if (!isPolling) {
        setLoadingMessages(true);
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/messages/${convId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const fetchedMessages = response.data.messages || [];
      setMessages(fetchedMessages);

      if (!isPolling) {
        setTimeout(() => scrollToBottom(false), 100);
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
      if (!isPolling) {
        setError(
          err.response?.data?.message || "Failed to load messages"
        );
      }
    } finally {
      if (!isPolling) {
        setLoadingMessages(false);
      }
    }
  };

  // ==========================================
  // START CONVERSATION WITH RECIPIENT
  // ==========================================
  const startConversationWithUser = async (recipientId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/messages/conversations",
        { recipientId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const conv = response.data.conversation;
      setShowNewChatModal(false);
      await fetchConversations(conv._id);
      setSelectedConversation(conv);
    } catch (err) {
      console.error("Start Conversation Error:", err);
      alert(
        err.response?.data?.message || "Failed to start conversation"
      );
    }
  };

  // Handle URL recipientId param if provided
  useEffect(() => {
    if (recipientParam) {
      startConversationWithUser(recipientParam);
    } else {
      fetchConversations();
    }
  }, [recipientParam]);

  // Load messages and setup polling when selected conversation changes
  useEffect(() => {
    if (selectedConversation?._id) {
      fetchMessages(selectedConversation._id, false);

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      pollingRef.current = setInterval(() => {
        fetchMessages(selectedConversation._id, true);
      }, 4000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedConversation?._id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation?._id || sending) {
      return;
    }

    const textToSend = messageText.trim();
    setMessageText("");

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/messages/${selectedConversation._id}`,
        { text: textToSend },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const newMessage = response.data.message;
      setMessages((prev) => [...prev, newMessage]);

      // Update conversations list with latest message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedConversation._id
            ? {
                ...c,
                lastMessage: {
                  text: textToSend,
                  senderId: currentUserId,
                  createdAt: new Date()
                },
                updatedAt: new Date()
              }
            : c
        )
      );

      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error("Send Message Error:", err);
      alert(err.response?.data?.message || "Failed to send message");
      setMessageText(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // FETCH USERS FOR NEW CHAT MODAL
  // ==========================================
  const fetchAvailableUsers = async (search = "") => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token");
      const url = search
        ? `http://localhost:5000/api/messages/users?search=${encodeURIComponent(
            search
          )}`
        : "http://localhost:5000/api/messages/users";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAvailableUsers(response.data.users || []);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showNewChatModal) {
      fetchAvailableUsers(userSearch);
    }
  }, [showNewChatModal, userSearch]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const name = c.otherParticipant?.fullName || "";
    const email = c.otherParticipant?.email || "";
    const term = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term)
    );
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="messages-page">
      <div className="messages-layout-container">
        {/* ================= HEADER ================= */}
        <div className="messages-top-bar">
          <div className="messages-header-text">
            <h1>
              <FaComments /> Community Messages
            </h1>
            <p>Direct communication between community members</p>
          </div>

          <button
            type="button"
            className="messages-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {error && <div className="messages-error-banner">{error}</div>}

        {/* ================= CHAT CONTAINER ================= */}
        <div className="messages-box">
          {/* ================= LEFT SIDEBAR: CONVERSATION LIST ================= */}
          <div className="conversations-sidebar">
            <div className="conversations-header">
              <h2>Chats</h2>
              <button
                type="button"
                className="new-chat-btn"
                onClick={() => {
                  setShowNewChatModal(true);
                  setUserSearch("");
                }}
                title="Start a new chat"
              >
                <FaPlus /> New Chat
              </button>
            </div>

            <div className="conversations-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="conversations-list">
              {loadingConversations ? (
                <div className="conversations-loading">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="no-conversations">
                  <FaComments className="no-conv-icon" />
                  <h3>No Conversations</h3>
                  <p>
                    {searchTerm
                      ? "No matching conversations found."
                      : "Start sharing and connecting with members."}
                  </p>
                  <button
                    type="button"
                    className="start-chat-btn"
                    onClick={() => {
                      setShowNewChatModal(true);
                      setUserSearch("");
                    }}
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected =
                    selectedConversation?._id === conv._id;
                  const other = conv.otherParticipant;
                  const lastMsg = conv.lastMessage;

                  return (
                    <div
                      key={conv._id}
                      className={`conversation-item ${
                        isSelected ? "active" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="conv-avatar">
                        {other?.profileImage ? (
                          <img
                            src={`http://localhost:5000${other.profileImage}`}
                            alt={other.fullName}
                          />
                        ) : (
                          <FaUserCircle className="default-avatar" />
                        )}
                      </div>

                      <div className="conv-info">
                        <div className="conv-name-row">
                          <span className="conv-name">
                            {other?.fullName || "Community Member"}
                          </span>
                          <span className="conv-time">
                            {formatTime(
                              lastMsg?.createdAt || conv.updatedAt
                            )}
                          </span>
                        </div>

                        <div className="conv-preview-row">
                          <p className="conv-preview">
                            {lastMsg?.text
                              ? lastMsg.text
                              : "No messages yet"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="unread-badge">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT PANE: ACTIVE CHAT ================= */}
          <div className="chat-window">
            {selectedConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="chat-header">
                  <div className="chat-recipient-info">
                    <div className="chat-recipient-avatar">
                      {selectedConversation.otherParticipant
                        ?.profileImage ? (
                        <img
                          src={`http://localhost:5000${selectedConversation.otherParticipant.profileImage}`}
                          alt="Recipient"
                        />
                      ) : (
                        <FaUserCircle className="default-avatar" />
                      )}
                    </div>

                    <div>
                      <h3>
                        {selectedConversation.otherParticipant?.fullName ||
                          "User"}
                      </h3>
                      <span>
                        {selectedConversation.otherParticipant
                          ?.community || "Community Member"}{" "}
                        •{" "}
                        {selectedConversation.otherParticipant?.email}
                      </span>
                    </div>
                  </div>

                  <div className="chat-header-actions">
                    <button
                      type="button"
                      className="refresh-chat-btn"
                      onClick={() =>
                        fetchMessages(selectedConversation._id, false)
                      }
                      title="Refresh messages"
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="chat-messages-body">
                  {loadingMessages ? (
                    <div className="messages-loading">
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty-messages">
                      <FaComments className="empty-chat-icon" />
                      <h4>No messages yet</h4>
                      <p>
                        Say hello to{" "}
                        {selectedConversation.otherParticipant?.fullName ||
                          "this member"}
                        !
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine =
                        msg.senderId?._id?.toString() ===
                          currentUserId?.toString() ||
                        msg.senderId?.toString() ===
                          currentUserId?.toString();

                      return (
                        <div
                          key={msg._id}
                          className={`message-bubble-wrapper ${
                            isMine ? "mine" : "theirs"
                          }`}
                        >
                          <div
                            className={`message-bubble ${
                              isMine ? "mine" : "theirs"
                            }`}
                          >
                            <p className="message-text">{msg.text}</p>
                            <div className="message-meta">
                              <span className="message-time">
                                {formatTime(msg.createdAt)}
                              </span>
                              {isMine && (
                                <span className="message-status">
                                  <FaCheck />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  className="chat-input-bar"
                  onSubmit={handleSendMessage}
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    maxLength={2000}
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    className="send-message-btn"
                    disabled={!messageText.trim() || sending}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <FaComments className="big-chat-icon" />
                <h2>Select a Conversation</h2>
                <p>
                  Choose a chat from the sidebar or click "New Chat" to
                  message any community member.
                </p>
                <button
                  type="button"
                  className="start-chat-btn"
                  onClick={() => {
                    setShowNewChatModal(true);
                    setUserSearch("");
                  }}
                >
                  <FaPlus /> Start a Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= NEW CHAT USER PICKER MODAL ================= */}
        {showNewChatModal && (
          <div className="new-chat-modal-overlay">
            <div className="new-chat-modal">
              <div className="new-chat-modal-header">
                <h3>Select Community Member</h3>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={() => setShowNewChatModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="user-search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="users-list-scroll">
                {loadingUsers ? (
                  <div className="users-loading">Searching members...</div>
                ) : availableUsers.length === 0 ? (
                  <div className="no-users-found">
                    <p>No community members found.</p>
                  </div>
                ) : (
                  availableUsers.map((u) => (
                    <div
                      key={u._id}
                      className="user-picker-item"
                      onClick={() => startConversationWithUser(u._id)}
                    >
                      <div className="user-picker-avatar">
                        {u.profileImage ? (
                          <img
                            src={`http://localhost:5000${u.profileImage}`}
                            alt={u.fullName}
                          />
                        ) : (
                          <FaUserCircle className="default-avatar" />
                        )}
                      </div>

                      <div className="user-picker-details">
                        <h4>{u.fullName}</h4>
                        <p>{u.email}</p>
                        {u.community && (
                          <span className="user-comm-pill">
                            {u.community}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
