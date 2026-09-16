import assert from "node:assert/strict";
import { test } from "node:test";
import { publicCareerKnowledge, voiceInstructions } from "../lib/voice/knowledge";

test("voice knows the last employer, dates and all published Barclays projects", () => {
  const knowledge = publicCareerKnowledge();
  assert.equal(knowledge.mostRecentEmployer, "Barclays");
  const employer = knowledge.career.find(company => company.name === "Barclays")!;
  assert.equal(employer.period, "25 October 2021 — 01 May 2026");
  assert.equal(employer.relationship, "employment");
  assert.equal(employer.projects.length, 3);
  assert.deepEqual(employer.projects.map(project => project.name), ["Vocalink by Mastercard", "Barclays Identification & Verification (BIDV)", "Amazon Connect — Voice Systems"]);
  assert.ok(knowledge.career.some(company => company.relationship === "independent"));
  assert.match(voiceInstructions(), /Career history and education:/);
  assert.match(voiceInstructions(), /Project brands and clients are not separate employers/);
});

test("voice excludes private history and proposed redesigns while retaining fact confidence", () => {
  const knowledge = publicCareerKnowledge();
  const serialized = JSON.stringify(knowledge);
  assert.doesNotMatch(serialized, /Streamora|Proaxive|Signet Technologies|interviewTopics|future/);
  const barclays = knowledge.career.find(company => company.name === "Barclays")!;
  assert.equal(barclays.projects.find(project => project.name.startsWith("Amazon Connect"))?.confidence, "PENDING_DETAIL");
  assert.equal(barclays.projects.find(project => project.name === "Vocalink by Mastercard")?.confidence, "USER_RECALLED");
  assert.ok(knowledge.education.length);
});
