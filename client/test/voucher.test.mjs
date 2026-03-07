import { client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("VOUCHER API TEST");

    await runRequest("GET /voucher/list", () => client.get("/voucher/list", { params: { page: 1, size: 10 } }));
    await runRequest("GET /voucher/my-available", () => client.get("/voucher/my-available", { headers: authHeader(), params: { page: 1, size: 10 } }));
    await runRequest("GET /voucher/admin/list", () => client.get("/voucher/admin/list", { headers: authHeader(), params: { page: 1, size: 10 } }));

    const voucherId = process.env.TEST_VOUCHER_ID || 1;
    await runRequest(`GET /voucher/detail/${voucherId}`, () => client.get(`/voucher/detail/${voucherId}`));
}

main();
