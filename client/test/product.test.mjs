import { client, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("PRODUCT API TEST");

    await runRequest("GET /product/list", () => client.get("/product/list", { params: { page: 1, size: 10 } }));

    const detailId = process.env.TEST_PRODUCT_ID || 1;
    await runRequest(`GET /product/detail/${detailId}`, () => client.get(`/product/detail/${detailId}`));

    const categoryId = process.env.TEST_CATEGORY_ID || 1;
    await runRequest(`GET /product/category/${categoryId}`, () => client.get(`/product/category/${categoryId}`, { params: { page: 1, size: 10 } }));
}

main();
