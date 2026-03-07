import { client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("CART API TEST");

    await runRequest("GET /carts", () => client.get("/carts", { headers: authHeader(), params: { page: 1, size: 10 } }));

    const cartId = process.env.TEST_CART_ID || 1;
    await runRequest(`PUT /carts/${cartId}`, () => client.put(`/carts/${cartId}`, { quantity: 2 }, { headers: authHeader() }));
    await runRequest(`DELETE /carts/${cartId}`, () => client.delete(`/carts/${cartId}`, { headers: authHeader() }));
}

main();
