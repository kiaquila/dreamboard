import {
  hasCleanCodexState,
  codexNegativeCompletionTime,
  isCodexStateBody,
  codexCodeReviewCompletionTime,
  codexStateCompletionTimesAreValid,
  isCompletedCodexLifecycle,
} from "./codex-review-state.mjs";
import { isKnownCodexHelpFooter } from "./codex-review-help.mjs";

const reviewerBotLogins = new Set([
  "chatgpt-codex-connector[bot]",
  "gemini-code-assist[bot]",
  "claude[bot]",
]);

export const codexReviewerLogins = new Set(["chatgpt-codex-connector[bot]"]);

const receiptMarker = "<!-- codex-review-receipt:v1 -->";
const summaryMarker = "<!-- codex-pull-request-review-summary -->";
const codexSummaryPrefix = /^Codex Review:/i;
const codexEnvironmentPattern = /create an environment for this repo/i;
const codexAccountPattern = /create a codex account and connect to github/i;
const codexTriggerPattern = /@codex review\b/i;

const getBody = (entry) => (entry?.body || "").trim();
const getLogin = (entry) => entry?.user?.login || "";

const isCommentEvent = (entry) => !entry?.event || entry.event === "commented";

const isCodexBotComment = (entry) =>
  isCommentEvent(entry) && codexReviewerLogins.has(getLogin(entry));

const isHumanCodexTriggerComment = (entry) =>
  isCommentEvent(entry) &&
  codexTriggerPattern.test(getBody(entry)) &&
  !reviewerBotLogins.has(getLogin(entry));

const isCurrentHeadActivationEvent = (entry, headSha) =>
  (entry?.event === "committed" && entry?.sha === headSha) ||
  ((entry?.event === "head_ref_force_pushed" ||
    entry?.event === "head_ref_restored") &&
    entry?.commit_id === headSha);

export const matchesCodexReview = (review, headSha) =>
  review?.commit_id === headSha &&
  codexReviewerLogins.has(review?.user?.login || "") &&
  (review?.body || "").includes("Codex Review");

// Wakeup routing recognizes state; only the strict classifier can grant proof.
export const isCodexWakeupComment = (comment) =>
  isCodexBotComment(comment) &&
  (getBody(comment).includes("codex-review-receipt") ||
    getBody(comment).startsWith(summaryMarker) ||
    codexSummaryPrefix.test(getBody(comment)) ||
    Boolean(classifyCodexSetupReply(comment)));

export const matchesCodexSummaryComment = (comment) =>
  isCodexBotComment(comment) &&
  (codexSummaryPrefix.test(getBody(comment)) ||
    isCodexStateBody(getBody(comment)) ||
    getBody(comment).includes("codex-review-receipt"));

export const classifyCodexSetupReply = (comment) => {
  const body = getBody(comment);

  if (codexEnvironmentPattern.test(body)) {
    return {
      outcome: "fail",
      reason:
        "Codex could not start the selected review because no Codex cloud environment is configured for this repository.",
      details: [comment.html_url],
    };
  }

  if (codexAccountPattern.test(body)) {
    return {
      outcome: "fail",
      reason:
        "Codex could not start the selected review because the trigger did not come from a connected human Codex account.",
      details: [comment.html_url],
    };
  }

  return null;
};

// Native presentation variants observed across the owner's repositories. This
// closed catalog is separate from verdict/SHA parsing; arbitrary prose cannot
// become approval. Public provenance lives in the native-response corpus.
const codexCleanClosings = new Set(
  [
    "",
    ":+1:",
    ":rocket:",
    ":tada:",
    "🚀",
    "🎉",
    "Already looking forward to the next diff.",
    "Another round soon, please!",
    "Bravo.",
    "Breezy!",
    "Can't wait for the next one!",
    "Chef's kiss.",
    "Delightful!",
    "Hooray!",
    "Keep it up!",
    "Keep them coming!",
    "More of your lovely PRs please.",
    "Nice work!",
    "Swish!",
    "What shall we delve into next?",
    "You're on a roll.",
  ].map((text) => text.toLowerCase()),
);

export const classifyCodexSummaryComment = (
  comment,
  headSha,
  { allowUnboundLegacy = false } = {},
) => {
  const pending = {
    outcome: "pending",
    reason:
      "Codex comment lacks unambiguous current-head no-findings evidence.",
    details: [comment?.html_url],
  };
  if (!matchesCodexSummaryComment(comment)) return pending;
  if (isCodexStateBody(getBody(comment))) {
    return hasCleanCodexState(getBody(comment), headSha)
      ? {
          outcome: "pass",
          reason:
            "Codex completed current-head structured review with no findings.",
          details: [comment.html_url],
        }
      : pending;
  }
  let body = getBody(comment);
  const receipt = body.startsWith(receiptMarker);
  const receiptMentions = body.match(/codex-review-receipt/g) || [];
  if (receiptMentions.length !== (receipt ? 1 : 0)) return pending;
  if (receipt) body = body.slice(receiptMarker.length).trim();

  // Ordinary native tasks append this service-owned link after their reply.
  // Remove only one exact trailing link, never arbitrary prose or link text.
  body = body
    .replace(
      /\n\s*\[View task →\]\(https:\/\/chatgpt\.com\/s\/cd_[a-f0-9]{32}\)\s*$/,
      "",
    )
    .trim();

  // Only the known optional GitHub help footer may follow the result.
  const footer = body.indexOf("<details>");
  if (footer >= 0) {
    const help = body.slice(footer);
    if (!isKnownCodexHelpFooter(help)) return pending;
    body = body.slice(0, footer).trim();
  }
  const lines = body.split(/\r?\n/).filter((line) => line.trim());
  const verdict = (lines[0] || "").match(
    /^Codex Review: did(?:\s+not|\s*n['’]?t)\s+find\s+any\s+major\s+issues\.(.*)$/i,
  );
  if (!verdict || !codexCleanClosings.has(verdict[1].trim().toLowerCase()))
    return pending;

  const shaLine = lines[1]?.match(
    /^\*\*Reviewed commit:\*\* `([a-f0-9]{10,40})`$/,
  );
  if (lines.length > (shaLine ? 2 : 1)) return pending;
  if (shaLine) {
    if (
      !/^[a-f0-9]{40}$/.test(headSha || "") ||
      !headSha.startsWith(shaLine[1])
    )
      return pending;
  } else if (receipt || !allowUnboundLegacy) {
    return pending;
  }
  return {
    outcome: "pass",
    reason: "Codex completed review with no major issues.",
    details: [comment.html_url],
  };
};

export const codexCommentTimestamp = (comment) =>
  Date.parse(comment.updated_at || comment.created_at || "") || 0;

export const findLatestHeadActivationIndex = (timelineEvents, headSha) => {
  if (!Array.isArray(timelineEvents) || !headSha) {
    return -1;
  }

  for (let index = timelineEvents.length - 1; index >= 0; index -= 1) {
    if (isCurrentHeadActivationEvent(timelineEvents[index], headSha)) {
      return index;
    }
  }

  return -1;
};

export const pickAuthoritativeCodexSkipModeComment = ({
  timelineEvents,
  headSha,
  issueComments = [],
}) => {
  if (!headSha) return null;
  const events = Array.isArray(timelineEvents) ? timelineEvents : [];
  const activationIndex = findLatestHeadActivationIndex(events, headSha);

  let boundaryIndex = activationIndex;
  for (let index = activationIndex + 1; index < events.length; index += 1) {
    if (isHumanCodexTriggerComment(events[index])) {
      boundaryIndex = index;
    }
  }

  const allComments = [...events, ...issueComments];
  const statePosition = (entry) =>
    events.findLastIndex(
      (event) =>
        isCommentEvent(event) && entry.id != null && event.id === entry.id,
    );
  const stateBoundaryTime = Date.parse(events[boundaryIndex]?.created_at || "");
  const eligibleState = (entry) => {
    if (activationIndex < 0) return false;
    const completedAt = codexCodeReviewCompletionTime(getBody(entry));
    const activationTime = Date.parse(
      events[activationIndex]?.created_at || "",
    );
    if (
      !codexStateCompletionTimesAreValid(entry, headSha) ||
      !Number.isFinite(completedAt) ||
      !Number.isFinite(Date.parse(entry.created_at || "")) ||
      Math.floor(completedAt / 1000) <
        Math.floor(Date.parse(entry.created_at || "") / 1000) ||
      completedAt >= codexCommentTimestamp(entry) + 1000 ||
      (Number.isFinite(stateBoundaryTime) &&
        Math.floor(completedAt / 1000) <=
          Math.floor(stateBoundaryTime / 1000)) ||
      (Number.isFinite(activationTime) &&
        Math.floor(completedAt / 1000) <= Math.floor(activationTime / 1000))
    )
      return false;
    const time = codexCommentTimestamp(entry);
    if (Number.isFinite(stateBoundaryTime)) {
      return (
        time > stateBoundaryTime ||
        (time === stateBoundaryTime &&
          time === Date.parse(entry.created_at) &&
          statePosition(entry) > boundaryIndex)
      );
    }
    return (
      statePosition(entry) > boundaryIndex &&
      time === Date.parse(entry.created_at)
    );
  };
  const evidenceTime = (entry) =>
    Number.isFinite(codexNegativeCompletionTime(entry, headSha))
      ? codexNegativeCompletionTime(entry, headSha)
      : isCodexStateBody(getBody(entry)) &&
          eligibleState(entry) &&
          hasCleanCodexState(getBody(entry), headSha)
        ? Math.floor(codexCodeReviewCompletionTime(getBody(entry)) / 1000) *
          1000
        : !isCodexStateBody(getBody(entry)) &&
            classifyCodexSummaryComment(entry, headSha, {
              allowUnboundLegacy: true,
            }).outcome === "pass"
          ? Date.parse(entry.created_at || "") || 0
          : codexCommentTimestamp(entry);
  const eligibleStaticApproval = (entry) => {
    const createdAt = Date.parse(entry.created_at || "");
    const entryIndex = events.findLastIndex(
      (event) => event === entry || (entry.id != null && event.id === entry.id),
    );
    return (
      Number.isFinite(createdAt) &&
      [activationIndex, boundaryIndex].every((index) => {
        const time = Date.parse(events[index]?.created_at || "");
        return (
          !Number.isFinite(time) ||
          createdAt > time ||
          (createdAt === time &&
            codexCommentTimestamp(entry) === createdAt &&
            entryIndex > index)
        );
      })
    );
  };
  const stateComments = allComments.filter(
    (entry) =>
      isCodexBotComment(entry) &&
      isCodexStateBody(getBody(entry)) &&
      eligibleState(entry),
  );

  const boundComments = [...events, ...issueComments]
    .filter((entry) => matchesCodexSummaryComment(entry))
    .filter((entry) => /\*\*Reviewed commit:\*\*/.test(getBody(entry)))
    .filter((entry) => getBody(entry).includes(headSha.slice(0, 10)));
  // Binding is required to pass, never to supersede old evidence. Include all
  // receipt-like responses, including supported receipts for another commit.
  const receiptComments = [...events, ...issueComments].filter(
    (entry) =>
      isCodexBotComment(entry) &&
      getBody(entry).includes("codex-review-receipt"),
  );
  const timelineComments = events
    .slice(activationIndex >= 0 ? boundaryIndex + 1 : events.length)
    .filter(
      (entry) =>
        isCodexBotComment(entry) &&
        (matchesCodexSummaryComment(entry) || classifyCodexSetupReply(entry)),
    );
  const position = (entry) =>
    events.findLastIndex(
      (event) =>
        isCommentEvent(event) && entry.id != null && event.id === entry.id,
    );
  // Persisted replies can invalidate proof even when timeline retrieval fails.
  // Ignore unedited replies known to precede the current request/activation;
  // edits and replies with no observable position remain conservative signals.
  const persistedReplies = issueComments.filter((entry) => {
    if (!isCodexBotComment(entry)) return false;
    if (
      getBody(entry).startsWith(summaryMarker) &&
      !matchesCodexSummaryComment(entry) &&
      !classifyCodexSetupReply(entry)
    )
      return false;
    return (
      activationIndex < 0 ||
      position(entry) < 0 ||
      position(entry) > boundaryIndex ||
      codexCommentTimestamp(entry) > Date.parse(entry.created_at)
    );
  });
  const candidates = [
    ...timelineComments,
    ...boundComments,
    ...receiptComments,
    ...persistedReplies,
    ...stateComments,
  ];
  const classify = (entry) =>
    (isCodexStateBody(getBody(entry)) && !eligibleState(entry)
      ? {
          outcome: "pending",
          reason:
            "Structured review predates the current request or head activation.",
          details: [entry.html_url],
        }
      : null) ||
    classifyCodexSetupReply(entry) ||
    classifyCodexSummaryComment(entry, headSha, {
      allowUnboundLegacy: timelineComments.some(
        (candidate) =>
          candidate === entry ||
          (entry.id != null && candidate.id === entry.id),
      ),
    });
  // A canonical completed null/null snapshot describes lifecycle, not a
  // verdict or withdrawal. The connector publishes the independent receipt
  // before this final summary edit. Pair only a fresh immutable SHA-bound
  // receipt with the same code completion; null alone never grants approval.
  // Other states (including running/security/unknown text) keep their veto.
  const authoritativeCandidates = candidates.filter((entry) => {
    if (
      !eligibleState(entry) ||
      !isCompletedCodexLifecycle(getBody(entry), headSha)
    )
      return true;
    const created = Date.parse(entry.created_at || "");
    const completed = codexCodeReviewCompletionTime(getBody(entry));
    return !candidates.some((receipt) => {
      const published = Date.parse(receipt.created_at || "");
      return (
        !isCodexStateBody(getBody(receipt)) &&
        /\*\*Reviewed commit:\*\*/.test(getBody(receipt)) &&
        classifyCodexSummaryComment(receipt, headSha).outcome === "pass" &&
        eligibleStaticApproval(receipt) &&
        codexCommentTimestamp(receipt) === published &&
        published >= created &&
        published <= completed
      );
    });
  });
  // A later static response cannot repair a missing lifecycle correlation.
  // Keep an unpaired canonical completion pending until a genuinely newer
  // canonical own-section clean completion supplies independent authority.
  const unpairedLifecycle = authoritativeCandidates
    .filter(
      (entry) =>
        eligibleState(entry) &&
        isCompletedCodexLifecycle(getBody(entry), headSha) &&
        !stateComments.some(
          (clear) =>
            hasCleanCodexState(getBody(clear), headSha) &&
            Math.floor(codexCodeReviewCompletionTime(getBody(clear)) / 1000) >
              Math.floor(codexCommentTimestamp(entry) / 1000),
        ),
    )
    .sort((a, b) => codexCommentTimestamp(b) - codexCommentTimestamp(a))[0];
  const latestTimestamp = Math.max(
    0,
    ...authoritativeCandidates.map(evidenceTime),
  );
  const tied = authoritativeCandidates.filter(
    (entry) => evidenceTime(entry) === latestTimestamp,
  );
  const canOrder = tied.every(
    (entry) =>
      codexCommentTimestamp(entry) === Date.parse(entry.created_at) &&
      position(entry) >= 0,
  );
  // Creation order cannot prove edit order. Resolve the whole timestamp group
  // conservatively, so the result is independent of API order and duplicates.
  const latestCodexComment =
    unpairedLifecycle ||
    (tied.some((entry) => isCodexStateBody(getBody(entry)))
      ? tied.find((entry) => classify(entry).outcome !== "pass") || tied.at(-1)
      : canOrder
        ? tied.sort((a, b) => position(a) - position(b)).at(-1)
        : tied.find((entry) => classify(entry).outcome !== "pass") ||
          tied.at(-1)) ||
    null;

  if (!latestCodexComment) {
    return null;
  }

  const setupClassification = classifyCodexSetupReply(latestCodexComment);
  if (setupClassification) {
    return {
      comment: latestCodexComment,
      classification: setupClassification,
      reviewState: "SETUP_REQUIRED",
      boundaryType:
        boundaryIndex === activationIndex ? "head-activation" : "human-trigger",
    };
  }

  const summaryClassification = classify(latestCodexComment);
  if (
    summaryClassification.outcome === "pass" &&
    !isCodexStateBody(getBody(latestCodexComment)) &&
    !eligibleStaticApproval(latestCodexComment)
  ) {
    summaryClassification.outcome = "pending";
    summaryClassification.reason =
      "Static review predates the current request or head activation.";
  }
  if (unpairedLifecycle) {
    summaryClassification.outcome = "pending";
    summaryClassification.reason =
      "Completed native lifecycle has no matching immutable clean receipt.";
    summaryClassification.unpairedLifecycle = true;
  }
  summaryClassification.evidenceTimestamp = evidenceTime(latestCodexComment);

  return {
    comment: latestCodexComment,
    classification: summaryClassification,
    reviewState:
      summaryClassification.outcome === "pass"
        ? "COMMENTED_NO_FINDINGS"
        : "COMMENTED_UNVERIFIED",
    boundaryType:
      boundaryIndex === activationIndex ? "head-activation" : "human-trigger",
  };
};

export const isAfterCodexDismissal = (
  entry,
  { timelineEvents, dismissalTime, reviewId },
) => {
  const timestamp = codexCommentTimestamp(entry);
  if (timestamp !== dismissalTime) return timestamp > dismissalTime;
  // GitHub truncates these timestamps to seconds. For a fresh comment in the
  // same second, timeline order distinguishes a replacement from old evidence.
  // An older comment's creation position cannot order a later edit. If its
  // update timestamp ties the dismissal, the gate requires fresh evidence.
  const dismissalIndex = timelineEvents.findLastIndex(
    (event) =>
      event.event === "review_dismissed" &&
      event.dismissed_review?.review_id === reviewId,
  );
  const commentIndex = timelineEvents.findLastIndex(
    (event) => event.event === "commented" && event.id === entry.id,
  );
  return dismissalIndex >= 0 && commentIndex > dismissalIndex;
};
