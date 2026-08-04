import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, normalize, resolve, sep } from "node:path";

const root = resolve("web");
const args = process.argv.slice(2);

function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const host = option("--host", "0.0.0.0");
const port = Number(option("--port", "4173"));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url ?? "/", "http://preview.local").pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const candidate = normalize(resolve(root, relativePath));

  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  const filePath = existsSync(candidate) ? candidate : resolve(root, "index.html");
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`SpeakEasy preview listening on ${host}:${port}`);
});
