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

// Structured summaries are wakeup signals only, never positive evidence.
export const isCodexWakeupComment = (comment) =>
  isCodexBotComment(comment) &&
  (getBody(comment).includes("codex-review-receipt") ||
    getBody(comment).startsWith(summaryMarker) ||
    codexSummaryPrefix.test(getBody(comment)) ||
    Boolean(classifyCodexSetupReply(comment)));

export const matchesCodexSummaryComment = (comment) =>
  isCodexBotComment(comment) &&
  (codexSummaryPrefix.test(getBody(comment)) ||
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
  let body = getBody(comment);
  const receipt = body.startsWith(receiptMarker);
  const receiptMentions = body.match(/codex-review-receipt/g) || [];
  if (receiptMentions.length !== (receipt ? 1 : 0)) return pending;
  if (receipt) body = body.slice(receiptMarker.length).trim();

  // Only the known optional GitHub help footer may follow the result.
  const footer = body.indexOf("<details>");
  if (footer >= 0) {
    const help = body.slice(footer);
    if (
      !/^<details>\s*<summary>(?:[ℹ💡]\ufe0f?\s*)?About Codex in GitHub<\/summary>[\s\S]*<\/details>$/.test(
        help,
      ) ||
      (help.match(/<details>/g) || []).length !== 1
    )
      return pending;
    body = body.slice(0, footer).trim();
  }
  const lines = body.split(/\r?\n/).filter((line) => line.trim());
  if (
    !/^Codex Review: did(?:\s+not|\s*n['’]?t)\s+find\s+any\s+major\s+issues\.(?:\s*(?:Nice work!|Keep it up!|:[a-z_]+:|🚀|🎉))*$/i.test(
      lines[0] || "",
    )
  )
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

  const boundComments = [...events, ...issueComments]
    .filter((entry) => matchesCodexSummaryComment(entry))
    .filter((entry) => /\*\*Reviewed commit:\*\*/.test(getBody(entry)))
    .filter((entry) => getBody(entry).includes(headSha.slice(0, 10)));
  // Unknown envelopes and receipts without a parseable binding must not let
  // older positive evidence survive. They are candidates, never proof.
  const unknownReceipts = [...events, ...issueComments].filter((entry) => {
    const body = getBody(entry);
    return (
      isCodexBotComment(entry) &&
      body.includes("codex-review-receipt") &&
      (!body.startsWith(receiptMarker) ||
        !/^\*\*Reviewed commit:\*\* `[a-f0-9]{10,40}`$/m.test(body))
    );
  });
  const timelineComments = events
    .slice(activationIndex >= 0 ? boundaryIndex + 1 : events.length)
    .filter(
      (entry) =>
        isCodexBotComment(entry) &&
        (matchesCodexSummaryComment(entry) || classifyCodexSetupReply(entry)),
    );
  const candidates = [
    ...timelineComments,
    ...boundComments,
    ...unknownReceipts,
  ];
  const latestTimestamp = Math.max(0, ...candidates.map(codexCommentTimestamp));
  const tied = candidates.filter(
    (entry) => codexCommentTimestamp(entry) === latestTimestamp,
  );
  const position = (entry) =>
    events.findLastIndex(
      (event) => event.event === "commented" && event.id === entry.id,
    );
  const canOrder = tied.every(
    (entry) =>
      codexCommentTimestamp(entry) === Date.parse(entry.created_at) &&
      position(entry) >= 0,
  );
  // Creation order cannot prove edit order. Resolve the whole timestamp group
  // conservatively, so the result is independent of API order and duplicates.
  const latestCodexComment =
    (canOrder
      ? tied.sort((a, b) => position(a) - position(b)).at(-1)
      : tied.find(
          (entry) =>
            classifyCodexSummaryComment(entry, headSha, {
              allowUnboundLegacy: true,
            }).outcome !== "pass",
        ) || tied.at(-1)) || null;

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

  if (!matchesCodexSummaryComment(latestCodexComment)) {
    return null;
  }

  const summaryClassification = classifyCodexSummaryComment(
    latestCodexComment,
    headSha,
    { allowUnboundLegacy: true },
  );
  if (summaryClassification.outcome === "pending") {
    return null;
  }

  return {
    comment: latestCodexComment,
    classification: summaryClassification,
    reviewState: "COMMENTED_NO_FINDINGS",
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
