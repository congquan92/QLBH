import { client, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("CATEGORY/NAVBAR API TEST");

    await runRequest("GET /category/all", () => client.get("/category/all", { params: { page: 1, size: 20 } }));

    const categoryId = process.env.TEST_CATEGORY_ID || 1;
    await runRequest(`GET /category/${categoryId}`, () => client.get(`/category/${categoryId}`));
}

main();
