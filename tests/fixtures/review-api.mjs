import { readFileSync } from "node:fs";
const fixture = JSON.parse(readFileSync(process.env.REVIEW_FIXTURE, "utf8"));
let pullReads = 0;
globalThis.fetch = async (url) => {
  const path = new URL(url).pathname;
  let data;
  if (/\/pulls\/1$/.test(path)) {
    data = {
      state: "open",
      head: { sha: fixture.heads?.[pullReads++] || fixture.head },
    };
  } else if (path.includes("/commits/"))
    data = { sha: fixture.resolvedHead || fixture.head };
  else if (path.endsWith("/reviews")) data = fixture.reviews || [];
  else if (path.endsWith("/timeline")) data = fixture.timeline || [];
  else if (path.includes("/pulls/1/comments")) data = fixture.inline || [];
  else if (path.endsWith("/comments")) data = fixture.comments || [];
  else if (path === "/graphql")
    data = {
      data: {
        repository: {
          pullRequest: {
            reviewThreads: {
              nodes: fixture.threads || [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        },
      },
    };
  else throw new Error(`Unexpected API request: ${url}`);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
