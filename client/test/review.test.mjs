import { client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("REVIEW API TEST");

    const reviewId = process.env.TEST_REVIEW_ID || 1;
    await runRequest(`GET /reviews/${reviewId}`, () => client.get(`/reviews/${reviewId}`));
    await runRequest("GET /reviews", () => client.get("/reviews", { headers: authHeader(), params: { page: 1, size: 10 } }));

    const productId = process.env.TEST_PRODUCT_ID || 1;
    await runRequest(`GET /reviews/me/${productId}`, () => client.get(`/reviews/me/${productId}`, { headers: authHeader() }));
}

main();
