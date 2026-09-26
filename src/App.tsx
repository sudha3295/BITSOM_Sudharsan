/**
 * Entro Cowork Application
 * AI-powered workplace action and reconciliation assistant connecting
 * Gmail, Google Drive, Google Chat, and Connected ERP.
 *
 * CRITICAL RULE: Real User Data Only. Never mock Google services.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { type User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessTokenInMemory,
} from './firebase';
import { fetchGmailMessages, sendGmailMessage, GmailEmail } from './services/gmailService';
import { fetchDriveFiles, DriveFileItem } from './services/driveService';
import {
  fetchChatSpaces,
  fetchChatMessages,
  sendChatMessage,
  ChatSpace,
  ChatMessage,
} from './services/chatService';
import {
  fetchERPData,
  fetchActions,
  fetchAuditLogs,
  createAction,
  updateActionStatus,
  recordAuditLog,
  extractActionFromEmail,
  extractActionFromChat,
  updateERPInvoiceStatus,
  ActionItem,
  AuditLogEntry,
  ERPDataState,
} from './services/apiService';

import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SourcesModal, SourceReference } from './components/SourcesModal';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ActionCenterView } from './views/ActionCenterView';
import { InboxView } from './views/InboxView';
import { ChatView } from './views/ChatView';
import { DriveView } from './views/DriveView';
import { ReconciliationView } from './views/ReconciliationView';
import { ErpView } from './views/ErpView';
import { ActivityView } from './views/ActivityView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Real data collections
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState<boolean>(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveLoading, setDriveLoading] = useState<boolean>(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedChatSpace, setSelectedChatSpace] = useState<ChatSpace | null>(null);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatUnavailable, setChatUnavailable] = useState<boolean>(false);
  const [chatUnavailableReason, setChatUnavailableReason] = useState<string | undefined>();

  const [erpData, setErpData] = useState<ERPDataState | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Scanning & AI loading states
  const [scanningEmailId, setScanningEmailId] = useState<string | null>(null);
  const [scanningChatMessageId, setScanningChatMessageId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState<boolean>(false);

  // Confirmation Modal state for write operations
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    actionType: string;
    recipientOrTarget?: string;
    subjectOrReference?: string;
    bodyPreview?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: 'Entro Cowork is ready to perform this action.',
    actionType: '',
    onConfirm: async () => {},
  });
  const [isExecutingWrite, setIsExecutingWrite] = useState<boolean>(false);

  // Sources Modal state
  const [sourcesModalState, setSourcesModalState] = useState<{
    isOpen: boolean;
    title: string;
    sources: SourceReference[];
  }>({
    isOpen: false,
    title: '',
    sources: [],
  });

  // Reconcile view pre-selection
  const [reconcileEmail, setReconcileEmail] = useState<GmailEmail | null>(null);

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Fetch ERP & Action Store (runs even before Google Auth)
  const loadErpAndActions = useCallback(async () => {
    try {
      const [erp, act, logs] = await Promise.all([
        fetchERPData(),
        fetchActions(),
        fetchAuditLogs(),
      ]);
      setErpData(erp);
      setActions(act);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load ERP data:', err);
    }
  }, []);

  useEffect(() => {
    loadErpAndActions();
  }, [loadErpAndActions]);

  // 3. Fetch Real Google Workspace Data once token is available
  const loadGoogleWorkspaceData = useCallback(async (token: string) => {
    setIsRefreshingAll(true);

    // Fetch Gmail
    setEmailsLoading(true);
    setEmailsError(null);
    fetchGmailMessages(token)
      .then((res) => {
        setEmails(res.messages);
      })
      .catch((err) => {
        console.error('Gmail fetch error:', err);
        setEmailsError(err.message || 'Failed to connect to Gmail API');
      })
      .finally(() => setEmailsLoading(false));

    // Fetch Drive
    setDriveLoading(true);
    setDriveError(null);
    fetchDriveFiles(token)
      .then((res) => {
        setDriveFiles(res.files);
      })
      .catch((err) => {
        console.error('Drive fetch error:', err);
        setDriveError(err.message || 'Failed to connect to Drive API');
      })
      .finally(() => setDriveLoading(false));

    // Fetch Chat
    setChatLoading(true);
    fetchChatSpaces(token)
      .then((res) => {
        if (res.unavailable) {
          setChatUnavailable(true);
          setChatUnavailableReason(res.unavailableReason);
        } else {
          setChatUnavailable(false);
          setChatSpaces(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedChatSpace(res.data[0]);
            // load messages for first space
            fetchChatMessages(token, res.data[0].name).then((msgRes) => {
              if (msgRes.data) setChatMessages(msgRes.data);
            });
          }
        }
      })
      .catch((err) => {
        setChatUnavailable(true);
        setChatUnavailableReason(err.message);
      })
      .finally(() => {
        setChatLoading(false);
        setIsRefreshingAll(false);
      });
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadGoogleWorkspaceData(accessToken);
    }
  }, [accessToken, loadGoogleWorkspaceData]);

  // Handle Login
  const handleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setAccessTokenInMemory(res.accessToken);
        await loadGoogleWorkspaceData(res.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Google Account');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setEmails([]);
    setDriveFiles([]);
    setChatSpaces([]);
    setChatMessages([]);
  };

  // AI Extraction for Real Email
  const handleScanEmail = async (email: GmailEmail) => {
    setScanningEmailId(email.id);
    try {
      const res = await extractActionFromEmail(email);
      if (res.actionItem) {
        setActions((prev) => [res.actionItem!, ...prev]);
        setCurrentTab('actions');
      } else {
        alert('This email does not appear to contain pending action items or invoice discrepancies.');
      }
    } catch (err: any) {
      alert(`Error extracting actions: ${err.message}`);
    } finally {
      setScanningEmailId(null);
    }
  };

  // AI Extraction for Real Chat Message
  const handleScanChatMessage = async (msg: ChatMessage, spaceName: string) => {
    setScanningChatMessageId(msg.name);
    try {
      const res = await extractActionFromChat({
        id: msg.name,
        spaceName,
        senderName: msg.sender?.displayName || 'Teammate',
        createTime: msg.createTime,
        text: msg.text || '',
      });
      if (res.actionItem) {
        setActions((prev) => [res.actionItem!, ...prev]);
        setCurrentTab('actions');
      } else {
        alert('No pending workplace task identified in this message.');
      }
    } catch (err: any) {
      alert(`Error extracting chat action: ${err.message}`);
    } finally {
      setScanningChatMessageId(null);
    }
  };

  // Prepare and Execute Action with User Authorization
  const handleExecuteAction = (action: ActionItem) => {
    const isEmail = action.proposedPayload?.actionType === 'SEND_EMAIL';
    const isChat = action.proposedPayload?.actionType === 'SEND_CHAT';

    setConfirmationState({
      isOpen: true,
      title: 'Entro Cowork is ready to perform this action.',
      actionType: action.actionType,
      recipientOrTarget:
        action.proposedPayload?.to ||
        action.proposedPayload?.spaceName ||
        action.relatedEntity,
      subjectOrReference:
        action.proposedPayload?.subject || `Action Ref: ${action.source.id}`,
      bodyPreview: action.proposedPayload?.body || action.recommendedNextStep,
      onConfirm: async () => {
        setIsExecutingWrite(true);
        try {
          let executionResult = 'Executed successfully';
          let externalId = `ext-${Date.now()}`;

          if (isEmail && accessToken && action.proposedPayload?.to) {
            const sendRes = await sendGmailMessage(
              accessToken,
              action.proposedPayload.to,
              action.proposedPayload.subject || 'Re: Follow up',
              action.proposedPayload.body || action.recommendedNextStep,
              action.source.threadId
            );
            externalId = sendRes.id;
            executionResult = `Sent Gmail message ID: ${sendRes.id}`;
          } else if (isChat && accessToken && action.proposedPayload?.spaceName) {
            const chatRes = await sendChatMessage(
              accessToken,
              action.proposedPayload.spaceName,
              action.proposedPayload.body || action.recommendedNextStep
            );
            externalId = chatRes.name;
            executionResult = `Sent Chat message: ${chatRes.name}`;
          }

          // Record to immutable audit trail
          const log = await recordAuditLog({
            actionId: action.id,
            action: action.title,
            user: user?.email || 'authenticated-user',
            source: action.source.type,
            result: 'SUCCESS',
            externalId,
            details: {
              target: action.proposedPayload?.to || action.proposedPayload?.spaceName,
              actionType: action.actionType,
            },
          });

          // Update action status to EXECUTED
          const updated = await updateActionStatus(action.id, 'EXECUTED', {
            executionResult,
            auditLogId: log.id,
          });

          setActions((prev) => prev.map((a) => (a.id === action.id ? updated : a)));
          setAuditLogs((prev) => [log, ...prev]);

          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(`Execution failed: ${err.message}`);
        } finally {
          setIsExecutingWrite(false);
        }
      },
    });
  };

  // Authorized email reply flow
  const handlePrepareSendReply = (
    email: GmailEmail,
    suggested?: { to: string; subject: string; body: string }
  ) => {
    const to = suggested?.to || email.from;
    const subject = suggested?.subject || `Re: ${email.subject}`;
    const body = suggested?.body || `Hello,\n\nI have reviewed your message regarding "${email.subject}" and will follow up shortly.\n\nBest regards,`;

    setConfirmationState({
      isOpen: true,
      title: 'Entro Cowork is ready to perform this action.',
      actionType: 'SEND_GMAIL_REPLY',
      recipientOrTarget: to,
      subjectOrReference: subject,
      bodyPreview: body,
      onConfirm: async () => {
        setIsExecutingWrite(true);
        try {
          if (!accessToken) throw new Error('Missing OAuth token');
          const sendRes = await sendGmailMessage(accessToken, to, subject, body, email.threadId);

          const log = await recordAuditLog({
            action: `Reply to ${email.subject}`,
            user: user?.email || 'authenticated-user',
            source: 'GMAIL',
            result: 'SUCCESS',
            externalId: sendRes.id,
            details: { to, subject },
          });

          setAuditLogs((prev) => [log, ...prev]);
          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(`Send failed: ${err.message}`);
        } finally {
          setIsExecutingWrite(false);
        }
      },
    });
  };

  // Inspect Sources
  const handleViewSources = (action: ActionItem) => {
    setSourcesModalState({
      isOpen: true,
      title: action.title,
      sources: [
        {
          type: action.source.type,
          id: action.source.id,
          reference: action.source.label || action.relatedEntity,
          details: {
            threadId: action.source.threadId,
            relatedEntity: action.relatedEntity,
            priority: action.priority,
          },
        },
      ],
    });
  };

  // Show login screen if not authenticated
  if (!user && !isAuthLoading) {
    return (
      <LoginView
        onLogin={handleLogin}
        isLoading={isAuthLoading}
        errorMessage={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Enterprise Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        erpConnected={erpData !== null}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          pendingActionsCount={actions.filter((a) => a.status === 'PENDING').length}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/40">
          {currentTab === 'dashboard' && (
            <DashboardView
              actions={actions}
              auditLogs={auditLogs}
              emails={emails}
              chatSpaces={chatSpaces}
              chatUnavailable={chatUnavailable}
              driveFiles={driveFiles}
              erpData={erpData}
              onNavigate={setCurrentTab}
              onExecuteAction={handleExecuteAction}
              onViewSources={handleViewSources}
              onRefreshAll={() => accessToken && loadGoogleWorkspaceData(accessToken)}
              isRefreshing={isRefreshingAll}
            />
          )}

          {currentTab === 'actions' && (
            <ActionCenterView
              actions={actions}
              onExecuteAction={handleExecuteAction}
              onViewSources={handleViewSources}
              onUpdateStatus={async (id, status) => {
                const updated = await updateActionStatus(id, status);
                setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
              }}
            />
          )}

          {currentTab === 'inbox' && (
            <InboxView
              emails={emails}
              isLoading={emailsLoading}
              error={emailsError}
              onRefresh={() => accessToken && loadGoogleWorkspaceData(accessToken)}
              onScanEmail={handleScanEmail}
              onPrepareSendReply={handlePrepareSendReply}
              onSendToReconciliation={(em) => {
                setReconcileEmail(em);
                setCurrentTab('reconciliation');
              }}
              scanningId={scanningEmailId}
            />
          )}

          {currentTab === 'chat' && (
            <ChatView
              spaces={chatSpaces}
              messages={chatMessages}
              selectedSpace={selectedChatSpace}
              onSelectSpace={(sp) => {
                setSelectedChatSpace(sp);
                if (accessToken) {
                  fetchChatMessages(accessToken, sp.name).then((res) => {
                    if (res.data) setChatMessages(res.data);
                  });
                }
              }}
              isLoading={chatLoading}
              unavailable={chatUnavailable}
              unavailableReason={chatUnavailableReason}
              onRefresh={() => accessToken && loadGoogleWorkspaceData(accessToken)}
              onScanChatMessage={handleScanChatMessage}
              onPrepareSendChatMessage={(spaceName, text) => {
                setConfirmationState({
                  isOpen: true,
                  title: 'Entro Cowork is ready to perform this action.',
                  actionType: 'SEND_GOOGLE_CHAT_MESSAGE',
                  recipientOrTarget: spaceName,
                  bodyPreview: text,
                  onConfirm: async () => {
                    setIsExecutingWrite(true);
                    try {
                      if (!accessToken) throw new Error('Missing token');
                      const chatRes = await sendChatMessage(accessToken, spaceName, text || '');
                      const log = await recordAuditLog({
                        action: `Send message to Chat space: ${spaceName}`,
                        user: user?.email || 'authenticated-user',
                        source: 'CHAT',
                        result: 'SUCCESS',
                        externalId: chatRes.name,
                      });
                      setAuditLogs((prev) => [log, ...prev]);
                      setConfirmationState((prev) => ({ ...prev, isOpen: false }));
                    } catch (err: any) {
                      alert(`Failed to send chat: ${err.message}`);
                    } finally {
                      setIsExecutingWrite(false);
                    }
                  },
                });
              }}
              scanningMessageId={scanningChatMessageId}
            />
          )}

          {currentTab === 'drive' && (
            <DriveView
              files={driveFiles}
              isLoading={driveLoading}
              error={driveError}
              onRefresh={() => accessToken && loadGoogleWorkspaceData(accessToken)}
              onSearch={(query) => {
                if (accessToken) {
                  setDriveLoading(true);
                  fetchDriveFiles(accessToken, { query })
                    .then((res) => setDriveFiles(res.files))
                    .finally(() => setDriveLoading(false));
                }
              }}
              onReconcileDriveFile={(file) => {
                setCurrentTab('reconciliation');
              }}
            />
          )}

          {currentTab === 'reconciliation' && (
            <ReconciliationView
              erpData={erpData}
              emails={emails}
              driveFiles={driveFiles}
              preselectedEmail={reconcileEmail}
              onSendApprovedEmail={(payload) => {
                setConfirmationState({
                  isOpen: true,
                  title: 'Entro Cowork is ready to perform this action.',
                  actionType: 'SEND_VENDOR_DISCREPANCY_NOTICE',
                  recipientOrTarget: payload.recipient,
                  subjectOrReference: payload.subject,
                  bodyPreview: payload.body,
                  onConfirm: async () => {
                    setIsExecutingWrite(true);
                    try {
                      if (!accessToken) throw new Error('Missing token');
                      const sendRes = await sendGmailMessage(
                        accessToken,
                        payload.recipient,
                        payload.subject,
                        payload.body
                      );
                      const log = await recordAuditLog({
                        action: `Send Vendor Discrepancy Notice (${payload.subject})`,
                        user: user?.email || 'authenticated-user',
                        source: 'GMAIL',
                        result: 'SUCCESS',
                        externalId: sendRes.id,
                        details: payload,
                      });
                      setAuditLogs((prev) => [log, ...prev]);
                      setConfirmationState((prev) => ({ ...prev, isOpen: false }));
                    } catch (err: any) {
                      alert(`Send failed: ${err.message}`);
                    } finally {
                      setIsExecutingWrite(false);
                    }
                  },
                });
              }}
              onCreateTask={async (title, reason, entity) => {
                const act = await createAction({
                  title,
                  actionType: 'FOLLOW_UP_VENDOR',
                  source: {
                    type: 'ERP',
                    id: 'PO-10452',
                    label: 'Discrepancy Investigation',
                  },
                  relatedEntity: entity,
                  priority: 'HIGH',
                  reason,
                  recommendedNextStep: 'Verify physical warehouse receiving dock logs.',
                  status: 'PENDING',
                });
                setActions((prev) => [act, ...prev]);
                setCurrentTab('actions');
              }}
              onMarkResolved={async (invoiceId) => {
                await updateERPInvoiceStatus(invoiceId, 'APPROVED', 'Resolved by accounts payable.');
                await loadErpAndActions();
                alert(`ERP Invoice ${invoiceId} marked as APPROVED.`);
              }}
            />
          )}

          {currentTab === 'erp' && <ErpView erpData={erpData} />}

          {currentTab === 'activity' && <ActivityView auditLogs={auditLogs} />}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              gmailConnected={!emailsError && emails.length >= 0}
              driveConnected={!driveError && driveFiles.length >= 0}
              chatConnected={!chatUnavailable && chatSpaces.length >= 0}
              chatUnavailable={chatUnavailable}
              chatUnavailableReason={chatUnavailableReason}
              erpConnected={erpData !== null}
              onReconnect={handleLogin}
              onDisconnect={handleLogout}
              onRefreshChecks={() => accessToken && loadGoogleWorkspaceData(accessToken)}
              isChecking={isRefreshingAll}
            />
          )}
        </main>
      </div>

      {/* Confirmation Modal for Write Actions */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={() => setConfirmationState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        actionType={confirmationState.actionType}
        recipientOrTarget={confirmationState.recipientOrTarget}
        subjectOrReference={confirmationState.subjectOrReference}
        bodyPreview={confirmationState.bodyPreview}
        isExecuting={isExecutingWrite}
      />

      {/* Sources Verification Modal */}
      <SourcesModal
        isOpen={sourcesModalState.isOpen}
        onClose={() => setSourcesModalState((prev) => ({ ...prev, isOpen: false }))}
        title={sourcesModalState.title}
        sources={sourcesModalState.sources}
      />
    </div>
  );
}
