'use client'

import { useRef, useEffect } from 'react';
import { Card, Button, Input, Badge } from '@/ui';
import { Send, Sparkles, User, Bot, Lightbulb, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { DocumentPreviewModal, useDocumentPreview, getMockDocumentUrl } from '@/components/documents/preview';
import type { Message } from '@/services/ai/ddChatService';
import { useUIKey } from '@/store/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ddChatSendRequested } from '@/store/slices/uiEffectsSlice';
import { ddChatConversationRequested, ddChatSelectors } from '@/store/slices/aiSlice';

const defaultDDChatAssistantState = {
  inputValue: '',
  isTyping: false,
};

export function DDChatAssistant({ dealId, dealName }: { dealId?: number; dealName?: string }) {
  const dispatch = useAppDispatch();
  const stateKey = `dd-chat-assistant:${dealId ?? dealName ?? 'default'}`;
  const conversationKey = (dealId ?? dealName ?? 'default').toString();

  // Load conversation from Redux using selectors
  const conversation = useAppSelector(ddChatSelectors.selectConversation(conversationKey));
  const loading = useAppSelector(ddChatSelectors.selectIsLoading);

  // Load conversation on mount if not already loaded
  useEffect(() => {
    if (!conversation.length && dealId) {
      dispatch(ddChatConversationRequested({ dealId }));
    }
  }, [dispatch, dealId, conversation.length]);

  const { value: ui, patch: patchUI } = useUIKey<{ inputValue: string; isTyping: boolean }>(
    stateKey,
    defaultDDChatAssistantState
  );
  const { inputValue, isTyping } = ui;
  const messages = conversation || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const preview = useDocumentPreview();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (isTyping) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    dispatch(ddChatSendRequested({ key: stateKey, query: trimmed, dealName }));
  };

  const handleSuggestedQuestion = (question: string) => {
    patchUI({ inputValue: question });
  };

  return (
    <Card padding="none" className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[var(--app-primary)]" />
          <h3 className="font-semibold">AI Due Diligence Assistant</h3>
          {dealName && (
            <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
              {dealName}
            </Badge>
          )}
        </div>
        <p className="text-xs text-[var(--app-text-muted)]">
          Ask questions about deals, analyze metrics, and get AI-powered insights
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-[var(--app-primary)]'
                : 'bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)]'
            }`}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-[var(--app-primary)] text-white'
                    : 'bg-[var(--app-surface-hover)] text-[var(--app-text)]'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Insights */}
                {message.insights && message.insights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                          insight.type === 'positive' ? 'bg-[var(--app-success-bg)]' :
                          insight.type === 'negative' ? 'bg-[var(--app-danger-bg)]' :
                          'bg-[var(--app-info-bg)]'
                        }`}
                      >
                        {insight.type === 'positive' ? <TrendingUp className="w-3 h-3 text-[var(--app-success)] mt-0.5" /> :
                         insight.type === 'negative' ? <AlertCircle className="w-3 h-3 text-[var(--app-danger)] mt-0.5" /> :
                         <Lightbulb className="w-3 h-3 text-[var(--app-info)] mt-0.5" />}
                        <span className={
                          insight.type === 'positive' ? 'text-[var(--app-success)]' :
                          insight.type === 'negative' ? 'text-[var(--app-danger)]' :
                          'text-[var(--app-info)]'
                        }>{insight.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Related Documents */}
                {message.relatedDocs && message.relatedDocs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--app-text-muted)] mb-2">📎 Related Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.relatedDocs.map((doc, idx) => (
                        <Badge
                          key={idx}
                          size="sm"
                          variant="flat"
                          className="bg-[var(--app-surface-hover)] cursor-pointer hover:bg-[var(--app-primary-bg)] hover:text-[var(--app-primary)]"
                          onClick={() => {
                            preview.openPreview({
                              id: doc.name,
                              name: doc.name,
                              type: doc.category === 'Pitch Deck' ? 'pdf' : 'pdf',
                              url: getMockDocumentUrl('pdf'),
                              category: doc.category,
                            });
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          {doc.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-[var(--app-text-muted)] mb-2">💡 Suggested questions:</p>
                    <div className="space-y-1">
                      {message.suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="block w-full text-left text-xs p-2 rounded-lg bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-[var(--app-text-subtle)] mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-secondary)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-[var(--app-surface-hover)] rounded-lg p-3 max-w-[100px]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--app-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--app-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[var(--app-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--app-border)]">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask about financials, risks, team, market sizing..."
            value={inputValue}
            onChange={(e) => patchUI({ inputValue: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            size="md"
            className="flex-1"
          />
          <Button
            color="primary"
            isIconOnly
            onPress={handleSend}
            isDisabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-[var(--app-text-subtle)] mt-2">
          AI assistant analyzes uploaded documents, financial data, and market research
        </p>
      </div>

      {/* Document Preview Modal */}
      {preview.isOpen && preview.previewDocument && (
        <DocumentPreviewModal
          document={preview.previewDocument}
          isOpen={preview.isOpen}
          onClose={preview.closePreview}
        />
      )}
    </Card>
  );
}
