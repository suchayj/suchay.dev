import type { FactConfidence } from "./career-data";

export type EngineeringEvidenceContext =
  | "HISTORICAL_IMPLEMENTATION"
  | "IDENTIFIED_LIMITATION"
  | "RETROSPECTIVE_REDESIGN";

export type DesignReviewStatus = "DESIGN_UNDER_REVIEW";

export type EngineeringEvidence = {
  id: string;
  statement: string;
  confidence: FactConfidence;
  context: EngineeringEvidenceContext;
  resumeSafe: boolean;
};

export type ArchitectureNode = {
  id: string;
  label: string;
  kind: "producer" | "topic" | "consumer" | "api" | "retry" | "scheduler";
};

export type ArchitectureEdge = {
  from: string;
  to: string;
  label?: string;
  failure?: boolean;
};

export type ArchitectureSnapshot = {
  id: string;
  title: string;
  context: EngineeringEvidenceContext;
  confidence: FactConfidence;
  nodes: readonly ArchitectureNode[];
  edges: readonly ArchitectureEdge[];
};

export type OpenEngineeringQuestion = {
  id: string;
  question: string;
  answer: null;
  confidence: "PENDING_DETAIL";
};

export type RetrospectiveDesignOption = {
  id: string;
  name: string;
  context: "RETROSPECTIVE_REDESIGN";
  confidence: "PENDING_DETAIL";
  status: DesignReviewStatus;
  implementedAtBarclays: false;
};

export type EngineeringClaimPolicy = {
  claim: string;
  allowed: boolean;
  explanation: string;
};

export type EngineeringCaseStudy = {
  id: string;
  internalTitle: string;
  potentialPublicTitle: string;
  publication: "INTERNAL_DRAFT";
  futureRoute: string;
  companyId: "barclays";
  projectIds: readonly ["barclays-identification-verification", "mastercard-vocalink"];
  evidence: readonly EngineeringEvidence[];
  architecture: readonly ArchitectureSnapshot[];
  limitation: {
    context: "IDENTIFIED_LIMITATION";
    confidence: FactConfidence;
    principle: string;
    scenario: readonly string[];
    fixedInProduction: false;
  };
  redesignOptions: readonly RetrospectiveDesignOption[];
  openQuestions: readonly OpenEngineeringQuestion[];
  interviewMode: {
    thirtySeconds: string;
    twoMinutes: readonly string[];
    tenMinutes: readonly string[];
    deepFollowUpQuestionIds: readonly string[];
  };
  resumeEvidence: readonly string[];
  claimPolicy: readonly EngineeringClaimPolicy[];
};

const historicalArchitecture: ArchitectureSnapshot = {
  id: "bidv-vocalink-historical-flow",
  title: "Historical BIDV to Vocalink feedback flow",
  context: "HISTORICAL_IMPLEMENTATION",
  confidence: "USER_RECALLED",
  nodes: [
    { id: "data-team", label: "Data Team", kind: "producer" },
    { id: "feedback-raw", label: "feedback-raw", kind: "topic" },
    { id: "account-verification-consumer", label: "BIDV Signals / Account Verification consumer", kind: "consumer" },
    { id: "vocalink-feedback-api", label: "Mastercard Vocalink Feedback API", kind: "api" },
    { id: "resilience4j", label: "Resilience4j · 3 bounded retries · exponential backoff", kind: "retry" },
    { id: "feedback-retry", label: "feedback-retry", kind: "topic" },
    { id: "recovery-scheduler", label: "Spring scheduler · Monday / Wednesday / Friday", kind: "scheduler" },
    { id: "retry-consumer", label: "Retry consumer", kind: "consumer" },
  ],
  edges: [
    { from: "data-team", to: "feedback-raw" },
    { from: "feedback-raw", to: "account-verification-consumer" },
    { from: "account-verification-consumer", to: "vocalink-feedback-api", label: "Entity ID in flow" },
    { from: "vocalink-feedback-api", to: "resilience4j", label: "Unavailable / no response", failure: true },
    { from: "resilience4j", to: "feedback-retry", label: "Immediate retries exhausted", failure: true },
    { from: "recovery-scheduler", to: "retry-consumer", label: "Starts consumer" },
    { from: "feedback-retry", to: "retry-consumer" },
    { from: "retry-consumer", to: "vocalink-feedback-api", label: "Deferred recovery attempt" },
  ],
};

const identifiedLoop: ArchitectureSnapshot = {
  id: "same-window-reprocessing-loop",
  title: "Retrospectively identified same-window reprocessing loop",
  context: "IDENTIFIED_LIMITATION",
  confidence: "USER_RECALLED",
  nodes: [
    { id: "running-retry-consumer", label: "Running retry consumer", kind: "consumer" },
    { id: "failed-vocalink", label: "Vocalink failure", kind: "api" },
    { id: "exhausted-immediate-retries", label: "Immediate retries exhausted", kind: "retry" },
    { id: "same-feedback-retry", label: "feedback-retry", kind: "topic" },
  ],
  edges: [
    { from: "running-retry-consumer", to: "failed-vocalink", failure: true },
    { from: "failed-vocalink", to: "exhausted-immediate-retries", failure: true },
    { from: "exhausted-immediate-retries", to: "same-feedback-retry", label: "Republish", failure: true },
    { from: "same-feedback-retry", to: "running-retry-consumer", label: "Same recovery window", failure: true },
  ],
};

const openQuestionTexts = [
  "What happens when Vocalink processes a request but the response times out?",
  "How are duplicate deliveries handled?",
  "Is Entity ID sufficient for idempotency?",
  "Does Vocalink provide idempotency semantics?",
  "When is the consumed Kafka offset committed?",
  "What happens if publishing to feedback-retry fails?",
  "Could an event be lost between consuming and republishing?",
  "What delivery guarantee existed: at-most-once, at-least-once, or effectively-once?",
  "What happens if the application crashes mid-retry?",
  "What happens with multiple consumer instances?",
  "How were partitions configured?",
  "Was ordering important?",
  "How was consumer lag monitored?",
  "What qualified as a poison message?",
  "When should a retry event become terminal or dead-letter?",
  "Was the scheduler active on one pod or multiple pods?",
  "How was duplicate scheduler execution prevented?",
] as const;

const openQuestions = openQuestionTexts.map((question, index) => ({
  id: `vocalink-resilience-question-${index + 1}`,
  question,
  answer: null,
  confidence: "PENDING_DETAIL" as const,
}));

export const bidvVocalinkResilienceCaseStudy: EngineeringCaseStudy = {
  id: "barclays-vocalink-resilience",
  internalTitle: "Resilient Event Delivery from BIDV to Vocalink",
  potentialPublicTitle: "Designing Resilient Event Delivery in an Enterprise Banking Workflow",
  publication: "INTERNAL_DRAFT",
  futureRoute: "/engineering/barclays-vocalink-resilience",
  companyId: "barclays",
  projectIds: ["barclays-identification-verification", "mastercard-vocalink"],
  evidence: [
    { id: "raw-topic", statement: "The Data Team published events to feedback-raw for the Account Verification consumer.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "entity-id", statement: "An Entity ID was used as a unique identifier in the feedback flow.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "vocalink-api", statement: "The consumer attempted delivery to the Mastercard Vocalink Feedback API.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "immediate-retries", statement: "Resilience4j performed three bounded immediate API retries with exponential retry/backoff behaviour.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "feedback-count", statement: "feedbackCount belonged to the immediate API/Resilience4j retry mechanism, not the deferred Monday/Wednesday/Friday recovery cycle.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "retry-topic", statement: "After immediate API retries were exhausted, the event was published to the dedicated Kafka retry/recovery topic feedback-retry.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "recovery-schedule", statement: "A Spring Boot scheduled mechanism started the retry consumer on Monday, Wednesday and Friday.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "missing-message-eligibility", statement: "The payload had no next-attempt timestamp, deferred retry count, scheduled-attempt marker or weekday recovery state, and no known durable per-entity guard prevented same-window reprocessing.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "scheduler-limitation", statement: "Starting the retry consumer on a schedule did not independently make each message eligible only in a later recovery window.", confidence: "USER_RECALLED", context: "IDENTIFIED_LIMITATION", resumeSafe: false },
  ],
  architecture: [historicalArchitecture, identifiedLoop],
  limitation: {
    context: "IDENTIFIED_LIMITATION",
    confidence: "USER_RECALLED",
    principle: "Consumer scheduling is not the same as message scheduling or message eligibility.",
    scenario: [
      "The Monday scheduler starts the retry consumer.",
      "Event A is consumed from feedback-retry while Vocalink remains unavailable.",
      "The immediate Resilience4j retry cycle runs and is exhausted.",
      "Event A is republished to feedback-retry.",
      "Because the retry consumer remains active and no known durable eligibility state prevents it, Event A can be consumed again in the same Monday run.",
      "The cycle can repeat instead of preserving Monday-to-Wednesday-to-Friday separation.",
    ],
    fixedInProduction: false,
  },
  redesignOptions: [
    "Bounded Kafka offset/end-offset recovery",
    "Retry-stage topics",
    "Durable retry state/table",
    "Scheduler-controlled bounded consumers",
    "Modern Spring Kafka retry/DLT mechanisms",
    "Pause/resume strategies",
  ].map((name, index) => ({ id: `redesign-option-${index + 1}`, name, context: "RETROSPECTIVE_REDESIGN", confidence: "PENDING_DETAIL", status: "DESIGN_UNDER_REVIEW", implementedAtBarclays: false })),
  openQuestions,
  interviewMode: {
    thirtySeconds: "In the historical flow, BIDV Account Verification consumed Kafka events and delivered feedback to Vocalink. Resilience4j handled three bounded immediate retries with exponential backoff; exhausted events went to feedback-retry for a consumer started on Monday, Wednesday and Friday.",
    twoMinutes: ["Explain the historical feedback-raw to Account Verification to Vocalink flow.", "Separate feedbackCount and immediate Resilience4j retries from scheduled recovery windows.", "Describe feedback-retry as a dedicated retry/recovery topic, not as a confirmed DLT."],
    tenMinutes: ["Walk through the same-window reprocessing scenario as a retrospectively identified limitation.", "Explain why consumer start scheduling does not establish per-message eligibility.", "Compare redesign candidates without claiming any was implemented at Barclays."],
    deepFollowUpQuestionIds: openQuestions.map((question) => question.id),
  },
  resumeEvidence: ["Worked with Kafka-based event processing and resilient Vocalink feedback delivery using bounded API retries, exponential backoff and a dedicated retry/recovery topic."],
  claimPolicy: [
    { claim: "Kafka retry experience", allowed: true, explanation: "Supported by user-recalled historical project evidence." },
    { claim: "Resilience4j experience", allowed: true, explanation: "Supported by the user-recalled three-retry immediate API mechanism." },
    { claim: "DLT implementation", allowed: false, explanation: "feedback-retry is historically named and currently classified only as a dedicated retry/recovery topic." },
    { claim: "Solved the Monday/Wednesday/Friday retry flaw", allowed: false, explanation: "The flaw is retrospective analysis and is not confirmed as fixed in production." },
    { claim: "Implemented durable retry state", allowed: false, explanation: "Durable retry state is only a redesign candidate under review." },
    { claim: "Implemented bounded end-offset recovery", allowed: false, explanation: "Bounded end-offset recovery is only a redesign candidate under review." },
    { claim: "Implemented exactly-once processing", allowed: false, explanation: "The historical delivery guarantee is an unanswered engineering question." },
    { claim: "Discuss the retry flaw in an interview", allowed: true, explanation: "Allowed when clearly framed as retrospective analysis." },
    { claim: "Generate a system-design interview story", allowed: true, explanation: "Historical facts, limitations and redesign options are explicitly separated." },
  ],
};

export const engineeringCaseStudies = [bidvVocalinkResilienceCaseStudy] as const;
export const getEngineeringCaseStudy = (id: string) => engineeringCaseStudies.find((caseStudy) => caseStudy.id === id);
export const getEngineeringClaimPolicy = (claim: string) => bidvVocalinkResilienceCaseStudy.claimPolicy.find((item) => item.claim === claim);
