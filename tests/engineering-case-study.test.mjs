import assert from "node:assert/strict";
import { test } from "node:test";
import { bidvVocalinkResilienceCaseStudy as caseStudy, getEngineeringClaimPolicy } from "../app/engineering-case-studies.ts";
import { companies, formatCareerDuration, getCareerDuration, getCareerProject } from "../app/career-data.ts";

test("keeps the Barclays case study linked to canonical projects", () => {
  const barclays = companies.find((company) => company.id === "barclays");
  assert.equal(barclays?.name, "Barclays");
  assert.equal(barclays?.period, "25 October 2021 — 01 May 2026");
  assert.deepEqual(getCareerDuration(barclays), { years: 4, months: 6, days: 6 });
  assert.equal(formatCareerDuration(getCareerDuration(barclays)), "4 years 6 months");
  assert.deepEqual(caseStudy.projectIds, ["barclays-identification-verification", "mastercard-vocalink"]);
  assert.equal(getCareerProject("BIDV")?.id, "barclays-identification-verification");
  assert.equal(getCareerProject("Identification & Verification")?.id, "barclays-identification-verification");
  const vocalink = getCareerProject("mastercard-vocalink");
  assert.ok(vocalink?.technologies.includes("Resilience4j"));
  assert.doesNotMatch([...(vocalink?.technologies ?? []), ...(vocalink?.engineeringAreas ?? [])].join(" "), /\bDL[QT]\b|dead.?letter/i);
});

test("calculates career durations from canonical date precision", () => {
  const durationFor = (id) => getCareerDuration(companies.find((company) => company.id === id));
  assert.deepEqual(durationFor("sysnik"), { years: 2, months: 10 });
  assert.deepEqual(durationFor("rebelute"), { years: 0, months: 11 });
  assert.deepEqual(durationFor("cygnet"), { years: 1, months: 6 });
  assert.deepEqual(getCareerDuration(companies.find((company) => company.id === "independent"), new Date(Date.UTC(2026, 7, 27))), { years: 0, months: 3 });
});

test("separates historical evidence, limitations and retrospective redesigns", () => {
  assert.ok(caseStudy.evidence.some((item) => item.context === "HISTORICAL_IMPLEMENTATION"));
  assert.ok(caseStudy.evidence.some((item) => item.context === "IDENTIFIED_LIMITATION"));
  assert.equal(caseStudy.limitation.fixedInProduction, false);
  assert.ok(caseStudy.redesignOptions.length >= 6);
  for (const option of caseStudy.redesignOptions) {
    assert.equal(option.context, "RETROSPECTIVE_REDESIGN");
    assert.equal(option.status, "DESIGN_UNDER_REVIEW");
    assert.equal(option.implementedAtBarclays, false);
  }
});

test("records historical retry semantics without inventing deferred state", () => {
  const feedbackCount = caseStudy.evidence.find((item) => item.id === "feedback-count");
  assert.match(feedbackCount?.statement ?? "", /immediate API\/Resilience4j/);
  assert.match(feedbackCount?.statement ?? "", /not the deferred/);
  assert.ok(caseStudy.evidence.some((item) => item.id === "retry-topic" && item.statement.includes("feedback-retry")));
  assert.ok(caseStudy.evidence.some((item) => item.id === "recovery-schedule" && item.statement.includes("Monday, Wednesday and Friday")));
  assert.match(caseStudy.limitation.principle, /Consumer scheduling is not the same as message scheduling/);
});

test("keeps all distributed-systems questions explicitly unanswered", () => {
  assert.equal(caseStudy.openQuestions.length, 17);
  for (const question of caseStudy.openQuestions) {
    assert.equal(question.answer, null);
    assert.equal(question.confidence, "PENDING_DETAIL");
  }
});

test("enforces resume and interview claim boundaries", () => {
  assert.equal(getEngineeringClaimPolicy("Kafka retry experience")?.allowed, true);
  assert.equal(getEngineeringClaimPolicy("Resilience4j experience")?.allowed, true);
  assert.equal(getEngineeringClaimPolicy("DLT implementation")?.allowed, false);
  assert.equal(getEngineeringClaimPolicy("Solved the Monday/Wednesday/Friday retry flaw")?.allowed, false);
  assert.equal(getEngineeringClaimPolicy("Implemented exactly-once processing")?.allowed, false);
  assert.equal(getEngineeringClaimPolicy("Discuss the retry flaw in an interview")?.allowed, true);
});
