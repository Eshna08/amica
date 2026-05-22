import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import CrisisAlert from '../components/crisis/CrisisAlert';
import storage from '../utils/storage';
import chatService from '../utils/chat';
import { getEmergencyContacts } from '../utils/crisis';
import { ChatMessage as ChatMessageType, Conversation, EmergencyContact, CrisisData } from '../types';
import { MessageCircle, Clock, PlusCircle, Trash2, Brain } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = React.useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Module 1 – Crisis state
  const [crisisData, setCrisisData] = React.useState<CrisisData | null>(null);
  const [emergencyContact, setEmergencyContact] = React.useState<EmergencyContact | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load conversations and emergency contact
  React.useEffect(() => {
    const loadedConversations = storage.getConversations();
    setConversations(loadedConversations);

    if (loadedConversations.length === 0) {
      const newConversation = storage.createConversation('New Conversation');
      const initialized = chatService.initializeConversation(newConversation.id);
      if (initialized) {
        setConversations([initialized]);
        setActiveConversation(initialized);
      } else {
        setConversations([newConversation]);
        setActiveConversation(newConversation);
      }
    } else {
      setActiveConversation(loadedConversations[loadedConversations.length - 1]);
    }

    // Load emergency contact for crisis alert
    getEmergencyContacts().then(contacts => {
      if (contacts.length > 0) setEmergencyContact(contacts[0]);
      else {
        const local = storage.getEmergencyContactsLocal();
        if (local.length > 0) setEmergencyContact(local[0]);
      }
    });
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = async (message: string) => {
    if (!activeConversation) return;
    setIsLoading(true);

    try {
      const updatedConversation = await chatService.sendMessage(
        activeConversation.id,
        message,
        'chat',
        // Crisis callback: fires when HIGH risk is detected
        (detectedCrisis: CrisisData) => {
          setCrisisData(detectedCrisis);
        }
      );

      if (updatedConversation) {
        setConversations(prev =>
          prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
        );
        setActiveConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    const newConversation = storage.createConversation('New Chat');
    const initialized = chatService.initializeConversation(newConversation.id);
    if (initialized) {
      setConversations([...conversations, initialized]);
      setActiveConversation(initialized);
    } else {
      setConversations([...conversations, newConversation]);
      setActiveConversation(newConversation);
    }
  };

  const handleDeleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this conversation?');
    if (!confirmed) return;

    const success = storage.deleteConversation(conversationId);
    if (success) {
      const updated = conversations.filter(c => c.id !== conversationId);
      setConversations(updated);
      if (activeConversation?.id === conversationId) {
        if (updated.length > 0) {
          setActiveConversation(updated[updated.length - 1]);
        } else {
          const newConvo = storage.createConversation('New Conversation');
          const init = chatService.initializeConversation(newConvo.id);
          setConversations(init ? [init] : [newConvo]);
          setActiveConversation(init || newConvo);
        }
      }
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  const handleClearChat = () => {
    if (!activeConversation) return;
    const cleared = { ...activeConversation, messages: [] };
    setActiveConversation(cleared);
    setConversations(prev => prev.map(c => c.id === cleared.id ? cleared : c));
    storage.updateConversation(cleared.id, { messages: [] });
  };

  const getDisplayMessages = (messages: ChatMessageType[]) =>
    messages.filter(msg => msg.role !== 'system');

  return (
    <>
      {/* Module 1 – Crisis Alert Overlay */}
      {crisisData && (
        <CrisisAlert
          emergencyContact={emergencyContact}
          onDismiss={() => setCrisisData(null)}
        />
      )}

      <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row">
        {/* Conversations sidebar */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <PlusCircle size={16} />
              New Chat
            </button>
          </div>

          <div className="overflow-y-auto">
            <AnimatePresence>
              {conversations.map((convo) => (
                <motion.div
                  key={convo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-full border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeConversation?.id === convo.id ? 'bg-gray-100' : ''}`}>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelectConversation(convo)}
                        className="flex-1 p-3 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle size={16} className="text-gray-500" />
                          <span className="truncate font-medium">{convo.title}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{new Date(convo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(convo.id, e)}
                        className="p-2 m-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile selector */}
          <div className="md:hidden p-2 bg-white border-b">
            <div className="flex gap-2">
              <select
                value={activeConversation?.id}
                onChange={(e) => {
                  const sel = conversations.find(c => c.id === e.target.value);
                  if (sel) handleSelectConversation(sel);
                }}
                className="flex-1 p-2 border rounded"
              >
                {conversations.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {activeConversation && conversations.length > 1 && (
                <button
                  onClick={(e) => handleDeleteConversation(activeConversation.id, e)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <button
              onClick={handleNewConversation}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <PlusCircle size={16} />
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {activeConversation && (
              <div>
                {getDisplayMessages(activeConversation.messages).length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full py-20 text-center text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Brain size={48} className="mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold mb-2">Welcome to Amica</h2>
                    <p className="max-w-md">
                      I'm your AI mental wellness companion. You can talk to me about your thoughts,
                      feelings, or anything that's on your mind.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {getDisplayMessages(activeConversation.messages).map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t flex items-center justify-between">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <button
              onClick={handleClearChat}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;