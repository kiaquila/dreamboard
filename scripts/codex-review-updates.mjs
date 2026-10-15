// REST reviews retain submitted_at after edits and dismissal. GraphQL updatedAt
// is persisted and remains observable to a later workflow_run wakeup.
export const readReviewUpdates = async (reviews, api) => {
  const updates = new Map();
  for (let offset = 0; offset < reviews.length; offset += 100) {
    const batch = reviews.slice(offset, offset + 100);
    if (batch.some((review) => !review.node_id))
      throw new Error("Native review node IDs are required.");
    const result = await api("/graphql", {
      method: "POST",
      body: {
        query:
          "query($ids:[ID!]!) { nodes(ids:$ids) { ... on PullRequestReview { id updatedAt } } }",
        variables: { ids: batch.map((review) => review.node_id) },
      },
    });
    if (
      result.errors ||
      !Array.isArray(result.data?.nodes) ||
      result.data.nodes.length !== batch.length
    ) {
      throw new Error("Could not verify native review update times.");
    }
    for (const node of result.data.nodes) {
      const timestamp = Date.parse(node?.updatedAt);
      if (!timestamp || !batch.some((review) => review.node_id === node.id))
        throw new Error("Invalid native review update time.");
      updates.set(node.id, timestamp);
    }
    if (batch.some((review) => !updates.has(review.node_id)))
      throw new Error("Missing native review update time.");
  }
  return updates;
};
