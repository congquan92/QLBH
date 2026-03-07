import { client, printSection, runRequest } from "./_shared.mjs";

async function main() {
    printSection("HELLO API TEST");
    await runRequest("GET /hello", () => client.get("/hello"));
}

main();
