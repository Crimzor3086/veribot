import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Shield, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');

  // Load proposals on component mount
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/proposals`);
      setProposals(response.data.proposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        prompt: inputMessage
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.text,
        proof: response.data.proof,
        requestId: response.data.requestId,
        verifiable: response.data.verifiable,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Passed': return 'status-passed';
      case 'Draft': return 'status-draft';
      case 'Completed': return 'status-completed';
      default: return 'status-draft';
    }
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">VeriBot</h1>
                <p className="text-sm text-secondary-600">DAO Governance Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-secondary-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>On-Chain Verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'proposals'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Proposals ({proposals.filter(p => p.status === 'Active').length})
            </button>
          </nav>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="card h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        Welcome to VeriBot!
                      </h3>
                      <p className="text-secondary-600 mb-6">
                        Ask me anything about DAO governance, voting, or current proposals.
                      </p>
                      <div className="space-y-2 text-sm text-secondary-500">
                        <p>Try asking:</p>
                        <p>• "Summarize recent proposals"</p>
                        <p>• "Explain our tokenomics"</p>
                        <p>• "How does voting work?"</p>
                        <p>• "What's our treasury status?"</p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-bubble ${
                        message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          message.type === 'user' ? 'bg-primary-600' : 'bg-secondary-600'
                        }`}>
                          {message.type === 'user' ? (
                            <Users className="h-4 w-4 text-white" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-secondary-900">
                              {message.type === 'user' ? 'You' : 'VeriBot'}
                            </span>
                            <span className="text-xs text-secondary-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="text-secondary-800 whitespace-pre-wrap">
                            {message.text}
                          </div>
                          {message.type === 'ai' && message.verifiable && (
                            <div className="mt-2 flex items-center space-x-2">
                              <div className="verification-badge">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                On-Chain Verified
                              </div>
                              <span className="text-xs text-secondary-500">
                                Request ID: {message.requestId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="chat-bubble chat-bubble-ai">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-secondary-600">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse">VeriBot is thinking...</div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="border-t border-secondary-200 p-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about DAO governance, voting, or proposals..."
                      className="input-field flex-1"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  DAO Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary-600" />
                      <span className="text-sm text-secondary-600">Active Proposals</span>
                    </div>
                    <span className="font-semibold text-secondary-900">
                      {proposals.filter(p => p.status === 'Active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary-600" />
                      <span className="text-sm text-secondary-600">Total Proposals</span>
                    </div>
                    <span className="font-semibold text-secondary-900">
                      {proposals.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-secondary-600">Verified Responses</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {messages.filter(m => m.type === 'ai' && m.verifiable).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setInputMessage('Summarize recent proposals')}
                    className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    📋 Summarize proposals
                  </button>
                  <button
                    onClick={() => setInputMessage('Explain our tokenomics')}
                    className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    💰 Explain tokenomics
                  </button>
                  <button
                    onClick={() => setInputMessage('How does voting work?')}
                    className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    🗳️ Voting process
                  </button>
                  <button
                    onClick={() => setInputMessage('What is our treasury status?')}
                    className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    🏦 Treasury status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-secondary-900">
                Governance Proposals
              </h2>
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <span>
                  {proposals.filter(p => p.status === 'Active').length} Active
                </span>
                <span>
                  {proposals.filter(p => p.status === 'Passed').length} Passed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="proposal-card">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-secondary-900 text-sm">
                      #{proposal.id}: {proposal.title}
                    </h3>
                    <span className={`status-badge ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-secondary-600 mb-4 line-clamp-3">
                    {proposal.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600">Votes</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">
                          {proposal.votesFor}%
                        </span>
                        <span className="text-secondary-400">•</span>
                        <span className="text-red-600 font-medium">
                          {proposal.votesAgainst}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${proposal.votesFor}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-secondary-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {proposal.status === 'Active' ? getTimeRemaining(proposal.endTime) : 'Ended'}
                        </span>
                      </div>
                      <span>by {proposal.proposer.slice(0, 6)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
