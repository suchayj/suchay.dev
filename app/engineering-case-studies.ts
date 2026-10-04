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
    { id: "resilience4j", label: "Resilience4j · 3 retries · waits 10s / 20s / 40s", kind: "retry" },
    { id: "feedback-retry", label: "feedback-retry", kind: "topic" },
    { id: "recovery-scheduler", label: "Daily recovery · next day 22:00 UTC", kind: "scheduler" },
    { id: "retry-consumer", label: "Separate recovery consumer · feedbackCallCount in payload", kind: "consumer" },
    { id: "feedback-status-raw", label: "feedback-status-raw · returned feedback ID", kind: "topic" },
  ],
  edges: [
    { from: "data-team", to: "feedback-raw" },
    { from: "feedback-raw", to: "account-verification-consumer" },
    { from: "account-verification-consumer", to: "vocalink-feedback-api", label: "Entity ID in flow" },
    { from: "vocalink-feedback-api", to: "resilience4j", label: "Unavailable / no response", failure: true },
    { from: "resilience4j", to: "feedback-retry", label: "Immediate retries exhausted", failure: true },
    { from: "recovery-scheduler", to: "retry-consumer", label: "Starts consumer" },
    { from: "feedback-retry", to: "retry-consumer" },
    { from: "retry-consumer", to: "feedback-raw", label: "Requeue original flow; at most 3 failed daily cycles" },
    { from: "vocalink-feedback-api", to: "feedback-status-raw", label: "Successful response · feedback ID" },
  ],
};

const identifiedLoop: ArchitectureSnapshot = {
  id: "same-window-reprocessing-loop",
  title: "Unverified recovery-window eligibility risk",
  context: "IDENTIFIED_LIMITATION",
  confidence: "PENDING_DETAIL",
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
    { from: "same-feedback-retry", to: "running-retry-consumer", label: "Could a newly failed event be eligible in the same window?", failure: true },
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
    { id: "immediate-retries", statement: "Resilience4j performed three immediate API retries with exponential waits of 10, 20 and 40 seconds.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "feedback-count", statement: "The payload carried an integer feedbackCallCount which increased once per failed daily recovery cycle, separately from the three immediate Resilience4j retries. Scheduled recovery stopped after three failed daily cycles; the initial counter value and terminal handling were not specified.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "feedback-status", statement: "A successful Vocalink API response returned a feedback ID which was published to feedback-status-raw.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "retry-topic", statement: "After immediate API retries were exhausted, the event was published to the dedicated Kafka retry/recovery topic feedback-retry.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: true },
    { id: "recovery-schedule", statement: "A separate scheduled Kafka consumer ran the next day at 22:00 UTC and moved retry-topic events back to feedback-raw, the original processing entry point. Events still failing returned to the retry topic for the next day, subject to the three failed daily-cycle limit.", confidence: "USER_RECALLED", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "unconfirmed-message-eligibility", statement: "The payload contained feedbackCallCount. Per-message timestamps, next-day eligibility enforcement and durable duplicate guards have not been confirmed; their absence must not be asserted.", confidence: "PENDING_DETAIL", context: "HISTORICAL_IMPLEMENTATION", resumeSafe: false },
    { id: "scheduler-limitation", statement: "Consumer scheduling and message eligibility are distinct concepts; an actual same-window loop has not been confirmed in the clarified implementation.", confidence: "PENDING_DETAIL", context: "IDENTIFIED_LIMITATION", resumeSafe: false },
  ],
  architecture: [historicalArchitecture, identifiedLoop],
  limitation: {
    context: "IDENTIFIED_LIMITATION",
    confidence: "PENDING_DETAIL",
    principle: "Consumer scheduling is not the same as message scheduling or eligibility. The payload counter confirms a cycle limit, not the unspecified eligibility implementation.",
    scenario: [
      "The confirmed recovery consumer runs the next day at 22:00 UTC and republishes eligible events to feedback-raw.",
      "Vocalink failure triggers three immediate retries with 10, 20 and 40-second waits.",
      "A failed daily recovery cycle increases feedbackCallCount in the payload and returns the event to the retry topic if below the cutoff.",
      "Recovery stops after three failed daily cycles; the terminal destination is unspecified.",
      "How next-day eligibility, duplicate execution and consumed-offset boundaries are enforced remains an open question.",
      "A same-window reprocessing loop is a hypothetical risk to examine, not a confirmed production defect or a claimed fix.",
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
    thirtySeconds: "Account Verification consumed feedback-raw and called Vocalink. Failed API calls retried after 10, 20 and 40 seconds. Exhausted events went to the retry topic; next-day 22:00 UTC recovery returned them to feedback-raw. Payload feedbackCallCount limited failed daily recovery to three cycles. Successful feedback IDs went to feedback-status-raw.",
    twoMinutes: ["Explain the historical feedback-raw to Account Verification to Vocalink flow.", "Separate the three immediate API retries from feedbackCallCount and the three failed daily recovery cycles.", "Describe feedback-retry as a dedicated retry/recovery topic, not as a confirmed DLT."],
    tenMinutes: ["Discuss unconfirmed eligibility risks as questions, not as demonstrated historical defects.", "Explain why consumer start scheduling does not establish per-message eligibility.", "Compare redesign candidates without claiming any was implemented at Barclays."],
    deepFollowUpQuestionIds: openQuestions.map((question) => question.id),
  },
  resumeEvidence: ["Worked with Kafka-based event processing and resilient Vocalink feedback delivery using bounded API retries, exponential backoff and a dedicated retry/recovery topic."],
  claimPolicy: [
    { claim: "Kafka retry experience", allowed: true, explanation: "Supported by user-recalled historical project evidence." },
    { claim: "Resilience4j experience", allowed: true, explanation: "Supported by the user-recalled three-retry immediate API mechanism." },
    { claim: "DLT implementation", allowed: false, explanation: "feedback-retry is historically named and currently classified only as a dedicated retry/recovery topic." },
    { claim: "Solved the recovery-eligibility flaw", allowed: false, explanation: "A recovery-eligibility flaw has not been confirmed, and no production fix is claimed." },
    { claim: "Implemented durable retry state/table", allowed: false, explanation: "A payload feedbackCallCount is confirmed; a separate durable state table is only a redesign candidate under review." },
    { claim: "Implemented bounded end-offset recovery", allowed: false, explanation: "Bounded end-offset recovery is only a redesign candidate under review." },
    { claim: "Implemented exactly-once processing", allowed: false, explanation: "The historical delivery guarantee is an unanswered engineering question." },
    { claim: "Discuss recovery eligibility risks in an interview", allowed: true, explanation: "Allowed as a hypothetical design discussion, explicitly separated from confirmed implementation." },
    { claim: "Generate a system-design interview story", allowed: true, explanation: "Historical facts, limitations and redesign options are explicitly separated." },
  ],
};

export const engineeringCaseStudies = [bidvVocalinkResilienceCaseStudy] as const;
export const getEngineeringCaseStudy = (id: string) => engineeringCaseStudies.find((caseStudy) => caseStudy.id === id);
export const getEngineeringClaimPolicy = (claim: string) => bidvVocalinkResilienceCaseStudy.claimPolicy.find((item) => item.claim === claim);
