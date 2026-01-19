import { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserGender } from '../../hooks/useUserGender';
import React from 'react';
import ChatBubble from '../components/chat/ChatBubble';
import ErrorDisplay from '../components/ErrorDisplay';
import DatePickerModal from '../components/chat/DatePickerModal';
import Onboarding from './Onboarding';
import { getUserProfile } from "../api/api";
import ConfirmLeaveModal from '../components/chat/ConfirmLeaveModal.tsx'
import OnboardingTour from '../../components/OnboardingTour';
import { Step } from 'react-joyride';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/ai`;

// =====================================
// ✔ TYPES
// =====================================

interface OptionItem {
  text: string;
  icon?: string;
  action?: 'LOG_PERIOD_TODAY' | 'CHOOSE_PERIOD_DATE' | string;
}

interface OptionsBlock {
  title?: string;
  icon?: string;
  items: OptionItem[];
}

interface ChatMessage {
  id: number | string;
  type: 'user' | 'ai';
  content?: string;
  time?: string;
  avatar?: string;
  isTyping?: boolean;
  options?: OptionsBlock | null;
  calendarData?: any | null;
}

interface UserPreferences {
  aiModelName?: string;
  chatsLeft?: number;
  [key: string]: any;
}

type RecognitionType = SpeechRecognition | null;

// =====================================
// ✔ COMPONENT
// =====================================
interface ChatInputProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  isListening: boolean;
  handleMicClick: () => void;
  handleSendMessage: () => void;
}

const ChatInput = ({
  inputValue,
  setInputValue,
  isListening,
  handleMicClick,
  handleSendMessage,
}: ChatInputProps) => {
  return (
    <div className="flex items-center gap-3 w-full p-1 max-w-2xl">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-full" data-tour="ai-input">
            <button
              type="button"
              onClick={handleMicClick}
              className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100' : 'hover:bg-gray-100'
                }`}
            >
              <Mic
                size={18}
                className={isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'}
              />
            </button>

            <input
              type="text"
              value={inputValue}
              placeholder={isListening ? 'Listening...' : 'Type to start chatting...'}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-500 text-gray-900"
            />
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            data-tour="ai-send"
            className={`flex-shrink-0 p-2.5 ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
          >
            <img src="/Sent.png" alt="Send" className="w-10 h-10" />
          </button>
    </div>
  );
};


export default function Chat() {
  const navigate = useNavigate();
  const { userGender } = useUserGender();

  // --- AUTH INTEGRATION ---
  // We get the real user ID and Token from the Login process
  // MUST be declared BEFORE any useEffect hooks that use them
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  const userId = localStorage.getItem('userId');

  // Onboarding state
  // Default to false; we'll show onboarding whenever the sidebar sets the
  // `forceShowOnboarding` flag or dispatches the `openOnboarding` event.
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [showAITour, setShowAITour] = useState(false);


  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserPreferences | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  //poup before leaving page
  const confirmNavigation = (path: string) => {
    if (messages.length > 0) {
      setPendingRoute(path);
      setShowLeaveModal(true);
      return;
    }
    navigate(path);
  };
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    
    // Save the current conversation to the list before leaving
    if (conversationId && messages.length > 0 && token) {
      // Ensure this conversation is in the conversations list
      fetch(`${API_URL}/chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(allConvos => {
          const currentConv = Array.isArray(allConvos) 
            ? allConvos.find((c: any) => c.id === conversationId)
            : null;
          
          if (currentConv) {
            setConversations(prev => {
              const exists = prev.some(c => c.id === conversationId);
              if (!exists) {
                const updated = [currentConv, ...prev];
                const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
                const unique = Array.from(
                  new Map(updated.map(conv => [conv.id, conv])).values()
                ).filter(conv => !deletedConvos.includes(conv.id));
                localStorage.setItem('ai_conversations', JSON.stringify(unique));
                return unique;
              }
              return prev;
            });
          }
        })
        .catch(err => console.error('Failed to save conversation before leave:', err));
    }
    
    // Mark that user left the page - next time they come back, create a new conversation
    localStorage.setItem('chat_user_left_page', 'true');
    if (pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setPendingRoute(null);
  };

  const isInitialState = messages.length === 0;

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      try {
        const conversationKey = `chat_conversation_${conversationId}`;
        localStorage.setItem(conversationKey, JSON.stringify(messages));
        localStorage.setItem('chat_last_conversation_id', conversationId);
        
        // Add/update this conversation in the conversations list if it has messages
        // This ensures it appears in the sidebar
        if (token) {
          // Use a small delay to ensure the conversation exists in backend
          setTimeout(() => {
            // Fetch conversation details to get title and created_at
            fetch(`${API_URL}/chat`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then(res => res.json())
              .then(allConvos => {
                const currentConv = Array.isArray(allConvos) 
                  ? allConvos.find((c: any) => c.id === conversationId)
                  : null;
                
                if (currentConv) {
                  setConversations(prev => {
                    // Check if conversation already exists in list
                    const exists = prev.some(c => c.id === conversationId);
                    if (!exists) {
                      // Add it to the list
                      const updated = [currentConv, ...prev];
                      // Remove duplicates and filter out deleted ones
                      const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
                      const unique = Array.from(
                        new Map(updated.map(conv => [conv.id, conv])).values()
                      ).filter(conv => !deletedConvos.includes(conv.id))
                      .sort((a, b) => {
                        const dateA = new Date(a.created_at || 0).getTime();
                        const dateB = new Date(b.created_at || 0).getTime();
                        return dateB - dateA;
                      });
                      localStorage.setItem('ai_conversations', JSON.stringify(unique));
                      return unique;
                    }
                    return prev;
                  });
                }
              })
              .catch(err => console.error('Failed to fetch conversation details:', err));
          }, 500);
        }
      } catch (err) {
        console.error('Failed to save messages to localStorage:', err);
      }
    }
  }, [messages, conversationId, token]);

  // Load messages from localStorage or API when conversationId is set
  // Only load if we haven't loaded yet and messages are empty
  useEffect(() => {
    if (!conversationId || !token || hasLoadedMessages) return;
    // Don't load if messages already exist (from initialization or user interaction)
    if (messages.length > 0 && !hasLoadedMessages) {
      setHasLoadedMessages(true);
      return;
    }

    const loadMessages = async () => {
      try {
        // First try to load from localStorage
        const conversationKey = `chat_conversation_${conversationId}`;
        const savedMessages = localStorage.getItem(conversationKey);
        
        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              setHasLoadedMessages(true);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse saved messages, loading from API');
          }
        }

        // If no saved messages, try to load from API (only if conversation might have messages)
        try {
          const messagesRes = await fetch(`${API_URL}/chat/${conversationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (messagesRes.ok) {
            const apiMessages = await messagesRes.json();
            if (Array.isArray(apiMessages) && apiMessages.length > 0) {
              const formattedMessages: ChatMessage[] = apiMessages.map((msg: any) => ({
                id: msg.id,
                type: msg.sender_type === 'user' ? 'user' : 'ai',
                content: msg.content,
                time: msg.time || new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                avatar: msg.sender_type === 'user' ? (userProfileImage || '/UserAvatar.png') : '/Avatar.png',
              }));
              setMessages(formattedMessages);
              // Save to localStorage
              localStorage.setItem(conversationKey, JSON.stringify(formattedMessages));
            }
          }
        } catch (apiErr) {
          // Silently fail - new conversation might not have messages yet
          console.log('No existing messages found for conversation');
        }
        setHasLoadedMessages(true);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setHasLoadedMessages(true);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, token]);

  // Reset hasLoadedMessages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setHasLoadedMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (messages.length > 0) {
        e.preventDefault();
        e.returnValue = ''; // required for browser popup
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages.length]);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setUserProfileImage(
          data.profile_image_url ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        );
      } catch (err) {
        console.error("Failed to load user profile image:", err);
      }
    };

    loadProfile();
  }, []);


  // Debug: log onboarding storage and state to help diagnose visibility issues
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug(
        '[Chat] hasSeenOnboarding=',
        localStorage.getItem('hasSeenOnboarding'),
        'isOnboarding=',
        isOnboarding,
        'isOnline=',
        isOnline,
        'isSending=',
        isSending
      );
    } catch (e) {
      // ignore
    }
  }, [isOnboarding, isOnline, isSending]);

  // Listen for a request to open onboarding. The sidebar sets
  // `forceShowOnboarding` in localStorage and dispatches `openOnboarding` so
  // this component will show onboarding even if it is already mounted.
  useEffect(() => {
    const checkAndOpen = () => {
      try {
        const flag = localStorage.getItem('forceShowOnboarding');
        if (flag) {
          setIsOnboarding(true);
          localStorage.removeItem('forceShowOnboarding');
        }
      } catch (e) {
        // ignore
      }
    };

    // Initial check when component mounts
    checkAndOpen();

    // Event listener for clicks while already on the page
    const handler = () => setIsOnboarding(true);
    window.addEventListener('openOnboarding', handler as EventListener);

    return () => window.removeEventListener('openOnboarding', handler as EventListener);
  }, []);

  // Check if user has seen AI chat onboarding
  useEffect(() => {
    const hasSeenAITour = localStorage.getItem('hasSeenAITour');
    if (!hasSeenAITour && !isOnboarding && !isLoading && conversationId) {
      setTimeout(() => {
        setShowAITour(true);
      }, 2000);
    }
  }, [isOnboarding, isLoading, conversationId]);

  // Fetch all conversations for the user
  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;
      
      setLoadingConversations(true);
      try {
        const res = await fetch(`${API_URL}/chat`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const allConvos = Array.isArray(data) ? data : [];
          
          // Get deleted conversations list to filter them out
          const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
          
          // Filter to only show conversations that have messages (saved conversations)
          // AND are not deleted
          // Note: We show ALL saved conversations, including the current one (user can see their active chat)
          const savedConvos: any[] = [];
          const seenIds = new Set<string>(); // Prevent duplicates
          
          for (const conv of allConvos) {
            // Skip if deleted
            if (deletedConvos.includes(conv.id)) continue;
            
            if (seenIds.has(conv.id)) continue; // Skip duplicates
            seenIds.add(conv.id);
            
            // Check if we have messages in localStorage
            const conversationKey = `chat_conversation_${conv.id}`;
            const savedMessages = localStorage.getItem(conversationKey);
            if (savedMessages) {
              try {
                const messages = JSON.parse(savedMessages);
                if (Array.isArray(messages) && messages.length > 0) {
                  savedConvos.push(conv);
                  continue;
                }
              } catch {
                // Invalid JSON, check API
              }
            }
            
            // If not in localStorage, check API
            try {
              const messagesRes = await fetch(`${API_URL}/chat/${conv.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (messagesRes.ok) {
                const messages = await messagesRes.json();
                if (Array.isArray(messages) && messages.length > 0) {
                  savedConvos.push(conv);
                }
              }
            } catch {
              // Skip if API check fails
            }
          }
          
          // Get locally saved titles to preserve user edits
          const savedConvosList = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
          const titleMap = new Map(savedConvosList.map((c: any) => [c.id, c.title]));
          
          // Merge saved titles with fetched conversations
          const mergedConvos = savedConvos.map(conv => {
            const savedTitle = titleMap.get(conv.id);
            if (savedTitle && savedTitle !== conv.title) {
              // Use the locally saved title if it exists and is different
              return { ...conv, title: savedTitle };
            }
            return conv;
          });
          
          // Remove duplicates and sort by date (newest first)
          const uniqueConvos = Array.from(
            new Map(mergedConvos.map(conv => [conv.id, conv])).values()
          ).sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          
          setConversations(uniqueConvos);
          // Save to localStorage for persistence (preserve any title edits)
          localStorage.setItem('ai_conversations', JSON.stringify(uniqueConvos));
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        // Try to load from localStorage as fallback
        try {
          const saved = localStorage.getItem('ai_conversations');
          const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
          
          if (saved) {
            const parsed = JSON.parse(saved);
            // Filter out deleted conversations only
            const filtered = Array.isArray(parsed) 
              ? parsed.filter((conv: any) => !deletedConvos.includes(conv.id))
              : [];
            setConversations(filtered);
          } else {
            setConversations([]);
          }
        } catch (e) {
          console.error('Failed to load conversations from localStorage:', e);
          setConversations([]);
        }
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [token]); // Only fetch when token changes - don't refresh on every message

  // Load conversations from localStorage on mount (filtered)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_conversations');
      const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
      
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out deleted conversations, but keep all others (including current)
        const filtered = Array.isArray(parsed) 
          ? parsed.filter((conv: any) => !deletedConvos.includes(conv.id))
          : [];
        setConversations(filtered);
      } else {
        setConversations([]);
      }
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
      setConversations([]);
    }
  }, []);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<RecognitionType>(null);

  // =====================================
  // ✔ SPEECH RECOGNITION SETUP
  // =====================================
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition: SpeechRecognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        setInputValue(event.results[0][0].transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Function to load a conversation
  const loadConversation = async (convId: string) => {
    if (!token) return;
    
    try {
      setConversationId(convId);
      setHasLoadedMessages(false);
      setMessages([]);
      
      // Load messages for this conversation
      const res = await fetch(`${API_URL}/chat/${convId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const apiMessages = await res.json();
        if (Array.isArray(apiMessages) && apiMessages.length > 0) {
          const formattedMessages: ChatMessage[] = apiMessages.map((msg: any) => ({
            id: msg.id,
            type: msg.sender_type === 'user' ? 'user' : 'ai',
            content: msg.content,
            time: msg.time || new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            avatar: msg.sender_type === 'user' ? (userProfileImage || '/UserAvatar.png') : '/Avatar.png',
          }));
          setMessages(formattedMessages);
          // Save to localStorage
          const conversationKey = `chat_conversation_${convId}`;
          localStorage.setItem(conversationKey, JSON.stringify(formattedMessages));
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  // Function to update conversation title
  const updateConversationTitle = async (convId: string, newTitle: string) => {
    if (!token || !newTitle.trim()) return;
    
    const trimmedTitle = newTitle.trim();
    
    // Update on backend first
    try {
      const res = await fetch(`${API_URL}/chat/${convId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!res.ok) {
        throw new Error(`Backend update failed: ${res.status}`);
      }

      // Update local state and localStorage after successful backend update
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === convId ? { ...conv, title: trimmedTitle } : conv
        );
        localStorage.setItem('ai_conversations', JSON.stringify(updated));
        return updated;
      });
      
      setEditingTitleId(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Failed to update title on backend:', err);
      // Still update locally as fallback
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === convId ? { ...conv, title: trimmedTitle } : conv
        );
        localStorage.setItem('ai_conversations', JSON.stringify(updated));
        return updated;
      });
      setEditingTitleId(null);
      setEditingTitle('');
    }
  };

  // Function to delete a conversation
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the conversation when clicking delete
    
    if (!token) return;
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    // Track deleted conversations to prevent them from reappearing
    const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
    if (!deletedConvos.includes(convId)) {
      deletedConvos.push(convId);
      localStorage.setItem('ai_deleted_conversations', JSON.stringify(deletedConvos));
    }
    
    try {
      // Delete from backend first (this will delete from database)
      const res = await fetch(`${API_URL}/chat/${convId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Backend delete failed: ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to delete conversation from backend:', err);
      // Continue with local deletion even if backend fails
    }
    
    // Remove from local state
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== convId);
      localStorage.setItem('ai_conversations', JSON.stringify(updated));
      return updated;
    });
    
    // If this was the current conversation, clear it
    if (conversationId === convId) {
      setConversationId(null);
      setMessages([]);
      setHasLoadedMessages(false);
      localStorage.removeItem('chat_last_conversation_id');
      // Also remove messages from localStorage
      const conversationKey = `chat_conversation_${convId}`;
      localStorage.removeItem(conversationKey);
    }
    
    // Remove from localStorage
    const conversationKey = `chat_conversation_${convId}`;
    localStorage.removeItem(conversationKey);
  };

  // Handle title editing
  const startEditingTitle = (conv: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the conversation when clicking edit
    setEditingTitleId(conv.id);
    setEditingTitle(conv.title || 'New Chat');
  };

  const cancelEditingTitle = () => {
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const saveTitle = (convId: string) => {
    if (editingTitle.trim()) {
      updateConversationTitle(convId, editingTitle);
    } else {
      cancelEditingTitle();
    }
  };

  // =====================================
  // ✔ INITIALIZE CHAT
  // =====================================
  useEffect(() => {
    if (isOnboarding) return;

    // 1. Check if user is logged in - token is required, userId is optional
    if (!token) {
      // If not logged in, redirect to the login page
      navigate('/login');
      return;
    }

    // If userId is missing, try to get it from auth/me endpoint or continue without it
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      // Try to extract userId from token or continue without it
      // Some auth flows might not set userId in localStorage
      console.warn('userId not found in localStorage, continuing without it');
    }

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Chat initialization timeout - rendering anyway');
        setIsLoading(false);
        setIsOnline(false);
        setMessages([]);
      }
    }, 5000); // 5 second timeout (reduced from 10)

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setIsOnline(true);
        
        // If no token, don't try to initialize - just set loading to false
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Check if there's an existing active conversation in localStorage
        const lastConversationId = localStorage.getItem('chat_last_conversation_id');
        const hasLeftPage = localStorage.getItem('chat_user_left_page') === 'true';
        
        // Only create a new conversation if:
        // 1. There's no existing conversation ID, OR
        // 2. User left the page (they want a fresh start)
        if (!lastConversationId || hasLeftPage) {
          // Create a new conversation only if needed
          const convoRes = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: 'New Chat' })
          });

          if (!isMounted) return;

          if (!convoRes.ok) {
            if (convoRes.status === 401) {
              // Token expired
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              navigate('/login');
              return;
            }
            throw new Error('Failed to start conversation');
          }

          const convo = await convoRes.json();
          const newId = convo.id || convo._id || convo.conversationId || null;
          if (newId && isMounted) {
            setConversationId(newId);
            localStorage.setItem('chat_last_conversation_id', newId);
            localStorage.removeItem('chat_user_left_page'); // Clear the flag
          }
        } else {
          // Reuse existing conversation - load its messages
          if (isMounted) {
            setConversationId(lastConversationId);
            localStorage.removeItem('chat_user_left_page'); // Clear the flag
            
            // Try to load messages from localStorage first
            const conversationKey = `chat_conversation_${lastConversationId}`;
            const savedMessages = localStorage.getItem(conversationKey);
            if (savedMessages) {
              try {
                const parsed = JSON.parse(savedMessages);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setMessages(parsed);
                  setHasLoadedMessages(true);
                } else {
                  setHasLoadedMessages(false);
                }
              } catch {
                setHasLoadedMessages(false);
              }
            } else {
              setHasLoadedMessages(false);
            }
          }
        }

        // 3. Load user preferences
        if (isMounted) {
          try {
            const prefsRes = await fetch(`${API_URL}/user/preferences`, {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });

            if (prefsRes.ok) {
              const prefs = await prefsRes.json();
              setUserInfo(prefs);
            }
          } catch {
            console.log('Using default preferences');
          }
        }

        // Initialize with empty messages only for new conversation
        if (isMounted && (!lastConversationId || hasLeftPage)) {
          setMessages([]);
          setHasLoadedMessages(false);
        }

      } catch (err) {
        console.error('Chat initialization error:', err);
        if (isMounted) {
          setIsOnline(false);
          setIsLoading(false);
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
          // Ensure we always have a conversation ID or empty state
          if (!conversationId && token) {
            // Try to get last conversation from localStorage as fallback
            const lastConvId = localStorage.getItem('chat_last_conversation_id');
            if (lastConvId) {
              setConversationId(lastConvId);
            }
          }
        }
      }
    };

    // Only initialize if we have a token
    if (token) {
      initializeChat();
    } else {
      // No token - set loading to false immediately
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isOnboarding, token, navigate]); // Removed userId from dependencies

  // =====================================
  // ✔ SEND MESSAGE
  // =====================================
  const sendNewMessage = async (text: string) => {
    if (!text.trim()) return;

    if (userInfo && userInfo.chatsLeft !== undefined && userInfo.chatsLeft <= 0) {
      alert("You have reached your daily chat limit of 100 messages.");
      return;
    }

    let convoIdToUse: string | null = conversationId;

    // Check localStorage for existing conversation
    if (!convoIdToUse) {
      const lastConversationId = localStorage.getItem('chat_last_conversation_id');
      if (lastConversationId) {
        convoIdToUse = lastConversationId;
        setConversationId(lastConversationId);
      }
    }

    // Only create a new conversation if we truly don't have one
    if (!convoIdToUse) {
      try {
        const convoRes = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ title: 'New Chat' })
        });

        if (convoRes.ok) {
          const convo = await convoRes.json();
          const newId = convo.id || convo._id || convo.conversationId || null;
          if (newId) {
            setConversationId(newId);
            localStorage.setItem('chat_last_conversation_id', newId);
            convoIdToUse = newId;
          }
        }
      } catch (err) {
        console.warn('Auto-create conversation error', err);
      }
    }

    if (!convoIdToUse) {
      const fallbackMessage: ChatMessage = {
        id: Math.random(),
        type: 'ai',
        content: 'Sorry, unable to start a chat session. Please try again later.',
        time: new Date().toLocaleTimeString(),
        avatar: '/Avatar.png'
      };
      setMessages(prev => [...prev, fallbackMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Math.random(),
      type: 'user',
      content: text,
      time: new Date().toLocaleTimeString(),
      avatar: userProfileImage || "/UserAvatar.png"
    };


    const typingIndicator: ChatMessage = {
      id: Math.random(),
      type: 'ai',
      isTyping: true,
      avatar: '/Avatar.png'
    };

    setMessages(prev => [...prev, userMessage, typingIndicator]);
    setInputValue('');

    try {
      setIsSending(true);
      
      // Debug: Log API URL and token status
      if (!import.meta.env.VITE_BACKEND_URL) {
        console.error('VITE_BACKEND_URL is not set in environment variables');
      }
      if (!token) {
        console.warn('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/chat/${convoIdToUse}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const aiMessage = (await response.json()) as ChatMessage;
      aiMessage.time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Remove typing indicators and add the new AI message
      setMessages(prev => {
        const withoutTyping = prev.filter(m => !m.isTyping);
        return [...withoutTyping, aiMessage];
      });

      if (userInfo && typeof userInfo.chatsLeft === 'number') {
        setUserInfo({
          ...userInfo,
          chatsLeft: Math.max(0, userInfo.chatsLeft - 1)
        });
      }

      // Save conversation ID to localStorage
      if (convoIdToUse) {
        localStorage.setItem('chat_last_conversation_id', convoIdToUse);
      }
      
      // Refresh conversation list after message is sent to ensure it appears in sidebar
      // Use a delay to ensure backend has processed the message
      if (token && convoIdToUse) {
        setTimeout(() => {
          // Fetch all conversations and update the list
          fetch(`${API_URL}/chat`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(res => res.json())
            .then(allConvos => {
              if (Array.isArray(allConvos)) {
                const deletedConvos = JSON.parse(localStorage.getItem('ai_deleted_conversations') || '[]');
                const savedConvos: any[] = [];
                const seenIds = new Set<string>();
                
                // Check each conversation for messages
                Promise.all(
                  allConvos.map(async (conv: any) => {
                    if (deletedConvos.includes(conv.id) || seenIds.has(conv.id)) return null;
                    seenIds.add(conv.id);
                    
                    // Check localStorage first
                    const conversationKey = `chat_conversation_${conv.id}`;
                    const savedMessages = localStorage.getItem(conversationKey);
                    if (savedMessages) {
                      try {
                        const messages = JSON.parse(savedMessages);
                        if (Array.isArray(messages) && messages.length > 0) {
                          return conv;
                        }
                      } catch {}
                    }
                    
                    // Check API
                    try {
                      const messagesRes = await fetch(`${API_URL}/chat/${conv.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (messagesRes.ok) {
                        const messages = await messagesRes.json();
                        if (Array.isArray(messages) && messages.length > 0) {
                          return conv;
                        }
                      }
                    } catch {}
                    return null;
                  })
                ).then(results => {
                  const filtered = results.filter((c: any) => c !== null);
                  
                  // Preserve locally saved titles
                  const savedConvosList = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
                  const titleMap = new Map(savedConvosList.map((c: any) => [c.id, c.title]));
                  
                  // Merge saved titles with fetched conversations
                  const merged = filtered.map((conv: any) => {
                    const savedTitle = titleMap.get(conv.id);
                    if (savedTitle && savedTitle !== conv.title) {
                      return { ...conv, title: savedTitle };
                    }
                    return conv;
                  });
                  
                  const unique = Array.from(
                    new Map(merged.map(conv => [conv.id, conv])).values()
                  ).sort((a, b) => {
                    const dateA = new Date(a.created_at || 0).getTime();
                    const dateB = new Date(b.created_at || 0).getTime();
                    return dateB - dateA;
                  });
                  setConversations(unique);
                  localStorage.setItem('ai_conversations', JSON.stringify(unique));
                });
              }
            })
            .catch(err => console.error('Failed to refresh conversations:', err));
        }, 1000); // Wait 1 second for backend to process
      }

    } catch (err: any) {
      console.error('Error sending message:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Sorry, connection lost. Please try again.';
      
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err?.message?.includes('404')) {
        errorMessage = 'Chat endpoint not found. Please check the server configuration.';
      } else if (err?.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      const fallbackMessage: ChatMessage = {
        id: Math.random(),
        type: 'ai',
        content: errorMessage,
        time: new Date().toLocaleTimeString(),
        avatar: '/Avatar.png'
      };
      setMessages(prev => [...prev.filter(m => !m.isTyping), fallbackMessage]);
    }
    finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => sendNewMessage(inputValue);
  const handleOptionClick = (text: string) => sendNewMessage(text);

  const handleLogPeriodToday = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch(`${API_URL}/cycle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ last_period_start: today })
      });

      if (!res.ok) throw new Error('Failed to log period');
      sendNewMessage('when is my period');
    } catch (err) {
      console.error('Failed to log period today', err);
      setMessages(prev => [...prev, {
        id: Math.random(),
        type: 'ai',
        content: 'Failed to log your period. Please try again.',
        time: new Date().toLocaleTimeString(),
        avatar: '/Avatar.png'
      }] as ChatMessage[]);
    }
  };

  const handleChooseDate = () => setIsDatePickerOpen(true);

  const handleDateSelected = async (date: string) => {
    setIsDatePickerOpen(false);
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/cycle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ last_period_start: date })
      });

      if (!res.ok) throw new Error('Failed to update cycle date');
      sendNewMessage('when is my period');
    } catch (err) {
      console.error('Failed to set chosen date', err);
      setMessages(prev => [...prev, {
        id: Math.random(),
        type: 'ai',
        content: 'Failed to set the date. Please try again.',
        time: new Date().toLocaleTimeString(),
        avatar: '/Avatar.png'
      }] as ChatMessage[]);
    }
  };

  // Delete conversation history
  const handleDeleteConversation = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConversation = async () => {
    try {
      // Clear messages from state
      setMessages([]);
      setHasLoadedMessages(false);

      // Clear from localStorage
      if (conversationId) {
        const conversationKey = `chat_conversation_${conversationId}`;
        localStorage.removeItem(conversationKey);
      }

      // Clear all conversation keys from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_conversation_')) {
          keysToRemove.push(key);
        }
      }
      
      // Refresh conversations list after deletion
      if (token) {
        try {
          const convosRes = await fetch(`${API_URL}/chat`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (convosRes.ok) {
            const convosData = await convosRes.json();
            const convos = Array.isArray(convosData) ? convosData : [];
            setConversations(convos);
            localStorage.setItem('ai_conversations', JSON.stringify(convos));
          }
        } catch (err) {
          console.error('Failed to refresh conversations after delete:', err);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('chat_last_conversation_id');

      // Optionally delete from backend (if API supports it)
      if (conversationId && token) {
        try {
          await fetch(`${API_URL}/chat/${conversationId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.warn('Failed to delete conversation from backend:', err);
          // Continue anyway - we've cleared local storage
        }
      }

      setShowDeleteConfirm(false);
      
      // Create a new conversation
      if (token && userId) {
        try {
          const convoRes = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: 'New Chat' })
          });

          if (convoRes.ok) {
            const convo = await convoRes.json();
            const newId = convo.id || convo._id || convo.conversationId || null;
            if (newId) {
              setConversationId(newId);
              setHasLoadedMessages(false);
            }
          }
        } catch (err) {
          console.error('Failed to create new conversation:', err);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setShowDeleteConfirm(false);
    }
  };

  // =====================================
  // ✔ RENDER
  // =====================================

  // AI Chat Onboarding Steps
  const aiTourSteps: Step[] = [
    {
      target: '[data-tour="ai-title"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to AI Assistant!</h3>
          <p className="text-sm text-gray-600">
            Get personalized health and fitness advice powered by advanced AI. Ask questions about nutrition, workouts, period tracking, and more!
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="ai-chat-area"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Chat with AI</h3>
          <p className="text-sm text-gray-600">
            Type your questions here or use the microphone icon for voice input. The AI understands your profile and provides personalized responses!
          </p>
        </div>
      ),
      placement: 'top',
    },
  ];

  const handleAITourComplete = () => {
    localStorage.setItem('hasSeenAITour', 'true');
    setShowAITour(false);
  };

  // Debug: Log render state
  useEffect(() => {
    console.log('[Chat] Component mounted/updated');
    console.log('[Chat] Render state:', {
      isLoading,
      isOnboarding,
      conversationId,
      messagesCount: messages.length,
      hasToken: !!token,
      hasUserId: !!userId,
      isOnline
    });
  }, [isLoading, isOnboarding, conversationId, messages.length, token, userId, isOnline]);

  if (isOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          setIsOnboarding(false);
          localStorage.setItem('hasSeenOnboarding', 'true');
        }}
      />
    );
  }

  // Fallback: Always render something, even if loading fails
  // This ensures the UI is never completely blank
  // Remove the strict check - allow rendering even during loading

  // NavItem component for sidebar
  const NavItem = ({
    icon,
    label,
    onClick,
  }: {
    icon: string;
    label: string;
    onClick?: () => void;
  }) => {
    const isNutrition = icon.includes('Vector (17)');
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all justify-start"
      >
        <img
          src={icon}
          className="w-6 h-6"
          style={isNutrition ? { filter: 'grayscale(100%) brightness(0.5) opacity(0.7)' } : {}}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  // Don't block rendering during loading - show the UI with a loading indicator
  // The component will render and show loading state inline





  // Ensure component always renders - allow rendering even without userId if token exists
  // The userId might not be set in some auth flows, but token is required
  // Check for both 'token' and 'auth_token' in localStorage
  const authToken = token || localStorage.getItem('auth_token');
  if (!authToken) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h1>
          <p className="text-sm text-gray-500">Please log in to access the AI chat.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100 font-Plus Jakarta Sans" style={{ minHeight: '100vh' }}>

        {/* UNCLOSABLE SIDEBAR */}
        <div className="hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full bg-white border-r border-gray-200 shadow-sm w-60 z-40">
          <div className="mt-[100px] flex flex-col gap-8 px-3">
            <NavItem
              icon="/home-gray.png"
              label="Home"
              onClick={() => confirmNavigation('/welcome')}
            />

            <NavItem
              icon="/ai-pic.png"
              label="AI Assistant"
              onClick={() => confirmNavigation('/wellness/ai-chat')}
            />

            <NavItem
              icon="/resources.png"
              label="My Bookings"
              onClick={() => confirmNavigation('/bookings')}
            />

            {(userGender === 'Female' || userGender === null) && (
              <NavItem
                icon="/cycle-1.png"
                label="Periods Cycle"
                onClick={() => confirmNavigation('/cycles')}
              />
            )}

            <NavItem
              icon="/leaf-1.png"
              label="Nutrition"
              onClick={() => confirmNavigation('/nutrition/home')}
            />

            <NavItem
              icon="/Monotone add (6).png"
              label="Profile"
              onClick={() => confirmNavigation('/wellness/settings')}
            />
          </div>

        </div>

        {/* MAIN CONTENT AREA - SPLIT INTO TWO HALVES */}
        <div className="flex flex-1 md:ml-60" style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
          {/* LEFT HALF - CHAT INTERFACE */}
          <div className="relative flex flex-col w-full md:w-[65%] border-r border-gray-200 bg-white">
            {/* HEADER */}


            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white pt-2 md:pt-3">
              <div className="flex items-center gap-3">
                {/* MOBILE: Back button before robot icon */}
                <button
                  onClick={() => confirmNavigation("/welcome")}
                  className="md:hidden p-1 -ml-1"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img src="/ai-icon.png" alt="AI Assistant" className="w-7 h-7 rounded-lg object-contain" data-tour="ai-header" />
                <div>
                  <h1 className="text-base font-bold text-gray-900" data-tour="ai-title">FitFare AI Assistant</h1>

                  {userInfo ? (
                    <p className="text-xs text-gray-500">
                      {userInfo.aiModelName || 'Gemini 2.5'} • {userInfo.chatsLeft ?? 100} chats left
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500"></p>
                  )}

                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* MOBILE: Clock icon for conversation history */}
                <button
                  onClick={() => setShowMobileHistory(!showMobileHistory)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition"
                  title="Conversation History"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Delete conversation button */}
                {messages.length > 0 && (
                  <button
                    onClick={handleDeleteConversation}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    title="Delete conversation history"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>


            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 dark:bg-gray-800 relative" data-tour="ai-chat-area">
              {/* Loading indicator - only show if truly loading and no messages */}
              {isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-600">Initializing chat...</p>
                  </div>
                </div>
              )}
              {/* Copyright in the middle of chat area */}
              {isInitialState && !isLoading && (
                <div className="flex-1 flex flex-col mt-20 p-2 items-center justify-center gap-6">
                  {/* CENTER CARD */}
                  <div className="max-w-2xl text-center">
                    {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg"> */}
                    <div className='mt-20'>
                      <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Ready to get started?</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Start a conversation in the chat area and experience the power of AI-driven health assistance.
                      </p>
                      <div>
                         <span className="font-medium text-gray-700 dark:text-gray-300">Type your question to begin</span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER INPUT */}
                  <ChatInput
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    isListening={isListening}
                    handleMicClick={handleMicClick}
                    handleSendMessage={handleSendMessage}
                  />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="flex flex-col items-center gap-3 opacity-10">
                  <img src="/logo.png" alt="FitFare" className="w-45 h-45 object-contain" />
                  {/* <p className="text-gray-600 text-base font-medium">© 2025 FitFare. All rights reserved.</p> */}
                </div>
              </div>

              <div className="relative z-10">


                {messages.map(m => (
                  <ChatBubble
                    key={m.id}
                    message={m.content}
                    type={m.type}
                    time={m.time}
                    avatar={m.avatar}
                    isTyping={m.isTyping}
                    options={m.options as any}
                    calendarData={m.calendarData}
                    onOptionSelect={handleOptionClick}
                    onLogPeriod={handleLogPeriodToday}
                    onChooseDate={handleChooseDate}
                  />
                ))}
              </div>
            </div>

            {!isInitialState && !isLoading && (
              <div className="bg-gray-50 px-4 py-3  pb-6 border-t border-gray-200">
                <ChatInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  isListening={isListening}
                  handleMicClick={handleMicClick}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            )}
            
            {/* Show input even during loading if no messages yet */}
            {isInitialState && isLoading && (
              <div className="bg-gray-50 px-4 py-3 pb-6 border-t border-gray-200">
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-gray-500">Initializing chat interface...</p>
                </div>
              </div>
            )}

            {/* INPUT BAR */}


          </div>

          {/* RIGHT HALF - AI ASSISTANT INFO PAGE - Always visible */}
          <div className="hidden md:block w-[35%] bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-y-auto">
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                {/* Always show "What does FitFare AI do?" - Conversation history commented out */}
                {/* CONVERSATION HISTORY CODE COMMENTED OUT - START
                {conversations && conversations.length > 0 ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-gray-700 rounded-full mb-6">
                        <img src="/ai-icon.png" alt="AI Assistant" className="w-12 h-12 object-contain" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Conversation History
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {loadingConversations ? (
                        <div className="text-center py-8">
                          <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-600 mt-2">Loading conversations...</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={`w-full bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-2 ${
                              conversationId === conv.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => loadConversation(conv.id)}
                                className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition"
                              >
                                <img src="/ai-icon.png" alt="Chat" className="w-6 h-6 object-contain" />
                              </button>
                              <div className="flex-1 min-w-0">
                                {editingTitleId === conv.id ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          saveTitle(conv.id);
                                        } else if (e.key === 'Escape') {
                                          cancelEditingTitle();
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => saveTitle(conv.id)}
                                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditingTitle}
                                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between gap-2">
                                      <button
                                        onClick={() => loadConversation(conv.id)}
                                        className="flex-1 text-left"
                                      >
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                                          {conv.title || 'New Chat'}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          {conv.created_at
                                            ? new Date(conv.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                              })
                                            : 'Recently'}
                                        </p>
                                      </button>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          onClick={(e) => startEditingTitle(conv, e)}
                                          className="p-1 hover:bg-gray-100 rounded transition"
                                          title="Edit title"
                                        >
                                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={(e) => deleteConversation(conv.id, e)}
                                          className="p-1 hover:bg-red-100 rounded transition"
                                          title="Delete conversation"
                                        >
                                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                CONVERSATION HISTORY CODE COMMENTED OUT - END */}
                    {/* Header - Always visible */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-gray-700 rounded-full mb-6">
                        <img src="/ai-icon.png" alt="AI Assistant" className="w-12 h-12 object-contain" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        What does our FitFare AI Assistant do?
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        Your intelligent health and fitness companion, powered by advanced AI
                      </p>
                    </div>

                {/* Features Grid */}
                <div className="space-y-6 mb-12">
                  {/* Feature 1 */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personalized Health Guidance</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Get tailored advice on nutrition, fitness routines, and wellness goals based on your unique profile, preferences, and health data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Period Cycle Tracking</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          For female users, track your menstrual cycle, log symptoms, predict upcoming periods, and receive personalized health insights.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nutrition Analysis</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Analyze your meals, track calories and macros, and receive smart recommendations to help you achieve your dietary goals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 4 */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Ask questions anytime about fitness, health, nutrition, or wellness. Our AI is always ready to help you on your health journey.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 5 */}
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-pink-100 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Monitor your fitness progress, track your streaks, and get insights on your health journey with detailed analytics and reports.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateSelect={handleDateSelected}
      />

      <ConfirmLeaveModal
        open={showLeaveModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

      {/* Delete Conversation Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Conversation History</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete all conversation history? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Onboarding Tour */}
      <OnboardingTour
        steps={aiTourSteps}
        run={showAITour}
        onComplete={handleAITourComplete}
        onSkip={handleAITourComplete}
      />

      {/* MOBILE: Conversation History Slider */}
      {showMobileHistory && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setShowMobileHistory(false)}
          />
          
          {/* Slider Panel */}
          <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-gradient-to-br from-blue-50 via-white to-purple-50 z-50 md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Conversation History</h2>
                <button
                  onClick={() => setShowMobileHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conversation List */}
              {conversations && conversations.length > 0 ? (
                <div className="space-y-3">
                  {loadingConversations ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading conversations...</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border-2 ${
                          conversationId === conv.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              loadConversation(conv.id);
                              setShowMobileHistory(false);
                            }}
                            className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 transition"
                          >
                            <img src="/ai-icon.png" alt="Chat" className="w-6 h-6 object-contain" />
                          </button>
                          <div className="flex-1 min-w-0">
                            {editingTitleId === conv.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateConversationTitle(conv.id, editingTitle);
                                      setEditingTitleId(null);
                                      setEditingTitle('');
                                    } else if (e.key === 'Escape') {
                                      setEditingTitleId(null);
                                      setEditingTitle('');
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      updateConversationTitle(conv.id, editingTitle);
                                      setEditingTitleId(null);
                                      setEditingTitle('');
                                    }}
                                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingTitleId(null);
                                      setEditingTitle('');
                                    }}
                                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <button
                                    onClick={() => {
                                      loadConversation(conv.id);
                                      setShowMobileHistory(false);
                                    }}
                                    className="flex-1 text-left"
                                  >
                                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                      {conv.title || 'New Chat'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {conv.created_at
                                        ? new Date(conv.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })
                                        : 'Recently'}
                                    </p>
                                  </button>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingTitleId(conv.id);
                                        setEditingTitle(conv.title || 'New Chat');
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded transition"
                                      title="Edit title"
                                    >
                                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id, e);
                                      }}
                                      className="p-1 hover:bg-red-100 rounded transition"
                                      title="Delete conversation"
                                    >
                                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <img src="/ai-icon.png" alt="AI Assistant" className="w-8 h-8 object-contain" />
                  </div>
                  <p className="text-sm text-gray-600">No conversation history yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </>
  );
}

// =====================================
// ✔ SpeechRecognition Type Definitions
// =====================================

declare interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: any;
}

declare interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (ev: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: () => void;
  start(): void;
  stop(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};