import { API_TOKEN, client, authHeader, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("AUTH API TEST");

    await runRequest("POST /auth/login", () =>
        client.post("/auth/login", {
            username: process.env.TEST_USERNAME || "admin",
            password: process.env.TEST_PASSWORD || "123456",
        }),
    );

    await runRequest("GET /auth/introspect", () => client.get("/auth/introspect", { headers: authHeader() }));
    await runRequest("POST /auth/refresh", () => client.post("/auth/refresh", {}, { headers: authHeader() }));

    if (API_TOKEN) {
        await runRequest("POST /auth/logout", () => client.post("/auth/logout", {}, { headers: authHeader() }));
    } else {
        console.log("\n[SKIP] /auth/logout because API_TOKEN is empty");
    }
}

main();
