export type UserRole = "admin" | "finance" | "case_manager";
export type DecisionStatus = "approved" | "declined" | "pending_approval";
export type ApprovalStatus = "pending" | "approved" | "declined";
export type CardholderType = "staff" | "client";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  initials: string;
  avatarInitials?: string;
};

export type Grant = {
  id: string;
  name: string;
  funder: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
};

export type Policy = {
  id: string;
  name: string;
  grantId: string;
  mccAllow: string[];
  mccBlock: string[];
  merchantAllow: string[];
  perTxnLimit: number;
  totalLimit: number;
  approvalThreshold: number | null;
  approverUserId: string | null;
  singleUse: boolean;
  windowDays: number;
  status: "active" | "archived";
  createdAt: string;
};

export type Cardholder = {
  id: string;
  type: CardholderType;
  name: string;
  notes?: string;
  stripeCardholderId?: string;
};

export type Card = {
  id: string;
  policyId: string;
  cardholderId: string;
  issuedByUserId: string;
  status: "active" | "inactive" | "canceled";
  issuedAt: string;
  last4: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  notes?: string;
  stripeCardId?: string;
};

export type Authorization = {
  id: string;
  cardId: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
  decision: DecisionStatus;
  reason: string;
  ruleFired: string;
  approvalId: string | null;
  decidedAt: string;
  stripeAuthId?: string | null;
};

export type Approval = {
  id: string;
  authorizationId: string | null;
  cardId: string;
  approverUserId: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt: string | null;
  consumedAt: string | null;
  amount?: number;
  merchantName?: string;
};

export type SwipeRequest = {
  cardId: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
};

export type CardSummary = {
  id: string;
  cardholderName: string;
  policyName: string;
  last4: string;
  status: "active" | "inactive";
  issuedAt: string;
  spentAmount: number;
  limitAmount: number;
  approvalThreshold: number | null;
};

export type TransactionView = {
  id: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
  decision: DecisionStatus;
  reason: string;
  ruleFired: string;
  cardId: string;
  cardLast4: string;
  cardholderName: string;
  cardholderType: CardholderType;
  policyId: string;
  policyName: string;
  grantName: string;
  decidedAt: string;
  approvalId: string | null;
  approverName: string | null;
};

export type ApprovalView = {
  id: string;
  authorizationId: string;
  amount: number;
  merchantName: string;
  cardId: string;
  cardLast4: string;
  cardholderName: string;
  policyName: string;
  grantName: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt: string | null;
  approverName: string;
  reason: string;
  consumedAt: string | null;
};

export type PolicyView = {
  id: string;
  name: string;
  grantId: string;
  grantName: string;
  funder: string;
  mccAllow: string[];
  mccBlock: string[];
  merchantAllow: string[];
  perTxnLimit: number;
  totalLimit: number;
  approvalThreshold: number | null;
  approverName: string | null;
  singleUse: boolean;
  windowDays: number;
  spentAmount: number;
  remainingAmount: number;
  activeCards: number;
  status: Policy["status"];
  createdAt: string;
};

export type MccOption = {
  code: string;
  label: string;
};

export type MerchantReference = {
  name: string;
  mcc: string;
  label: string;
};

export type AppSummary = {
  totalSwipes: number;
  approvedToday: number;
  pendingApprovals: number;
  activeCards: number;
};

export type SwipeScenario = {
  id: string;
  title: string;
  description: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
};

export type TransactionsPayload = {
  summary: AppSummary;
  cards: CardSummary[];
  selectedCardId: string | null;
  scenarios: SwipeScenario[];
  transactions: TransactionView[];
  lastSwipe: SwipeRequest | null;
};

export type ApprovalsPayload = {
  approvals: ApprovalView[];
  pendingCount: number;
};

export type IssueCardPayload = {
  policies: PolicyView[];
  cardholders: Cardholder[];
  cards: CardSummary[];
};

export type PolicyStudioPayload = {
  policies: PolicyView[];
  grants: Grant[];
  approvers: User[];
  mccOptions: MccOption[];
  merchantOptions: MerchantReference[];
};
