import { client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("USER API TEST");

    await runRequest("GET /user/me", () => client.get("/user/me", { headers: authHeader() }));
    await runRequest("GET /user/list", () => client.get("/user/list", { headers: authHeader(), params: { page: 1, size: 10 } }));
    await runRequest("GET /user/address/list", () => client.get("/user/address/list", { headers: authHeader(), params: { page: 1, size: 10 } }));

    const userId = process.env.TEST_USER_ID || 1;
    await runRequest(`GET /user/${userId}`, () => client.get(`/user/${userId}`, { headers: authHeader() }));
}

main();
