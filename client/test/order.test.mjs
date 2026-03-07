import { client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("ORDER API TEST");

    await runRequest("GET /order/list", () => client.get("/order/list", { headers: authHeader(), params: { page: 1, size: 10 } }));
    await runRequest("GET /order/admin/list", () => client.get("/order/admin/list", { headers: authHeader(), params: { page: 1, size: 10 } }));

    const orderId = process.env.TEST_ORDER_ID || 1;
    await runRequest(`GET /order/${orderId}`, () => client.get(`/order/${orderId}`, { headers: authHeader() }));
    await runRequest(`GET /order/admin/${orderId}`, () => client.get(`/order/admin/${orderId}`, { headers: authHeader() }));

    await runRequest(`DELETE /order/cancel/${orderId}`, () => client.delete(`/order/cancel/${orderId}`, { headers: authHeader() }));
}

main();
