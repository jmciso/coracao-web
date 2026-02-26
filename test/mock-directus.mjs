/**
 * Mock Directus API server for build testing.
 * Zero dependencies — uses Node.js built-in http module.
 *
 * Usage: node test/mock-directus.mjs
 * Serves on http://localhost:8055
 */
import { createServer } from "node:http";

const ARTICLES = [
  {
    id: 1,
    status: "published",
    title: "Artigo de Teste",
    abstract: "Resumo do artigo de teste.",
    content: "<p>Conteúdo do artigo de teste.</p>",
    publish_date: "2024-09-15T10:00:00Z",
    front_img: "test-img-001",
    topics: "terapias",
    user_created: {
      avatar: null,
      first_name: "Hugo",
      last_name: "Mendes",
    },
  },
  {
    id: 2,
    status: "published",
    title: "Segundo Artigo",
    abstract: "Resumo do segundo artigo.",
    content: "<p>Conteúdo do segundo artigo.</p>",
    publish_date: "2024-10-01T10:00:00Z",
    front_img: "test-img-002",
    topics: "workshops",
    user_created: {
      avatar: null,
      first_name: "Hugo",
      last_name: "Mendes",
    },
  },
];

const EVENTS = [
  {
    id: 1,
    status: "published",
    title: "Evento de Teste",
    description: "<p>Descrição do evento de teste.</p>",
    start: "2024-11-01T18:00:00Z",
    end: "2024-11-03T12:00:00Z",
    front_img: "test-img-003",
    user_created: {
      avatar: null,
      first_name: "Hugo",
      last_name: "Mendes",
    },
    user_updated: {
      avatar: null,
    },
  },
  {
    id: 2,
    status: "published",
    title: "Segundo Evento",
    description: "<p>Descrição do segundo evento.</p>",
    start: "2024-12-10T09:00:00Z",
    end: "2024-12-12T17:00:00Z",
    front_img: "test-img-004",
    user_created: {
      avatar: null,
      first_name: "Hugo",
      last_name: "Mendes",
    },
    user_updated: {
      avatar: null,
    },
  },
];

const COLLECTIONS = { articles: ARTICLES, events: EVENTS };

function applyFilter(items, filter) {
  if (!filter) return items;
  return items.filter((item) => {
    if (filter.status?._eq && item.status !== filter.status._eq) return false;
    if (filter._and) {
      return filter._and.every((cond) => {
        if (cond.status?._eq) return item.status === cond.status._eq;
        if (cond.id?._neq) return item.id !== cond.id._neq;
        return true;
      });
    }
    return true;
  });
}

function handleItemsRequest(url) {
  const match = url.pathname.match(/^\/items\/(\w+)$/);
  if (!match) return null;

  const collection = match[1];
  const items = COLLECTIONS[collection];
  if (!items) return { data: [] };

  const params = url.searchParams;
  let filtered = [...items];

  const filterParam = params.get("filter");
  if (filterParam) {
    try {
      filtered = applyFilter(filtered, JSON.parse(filterParam));
    } catch {}
  }

  const sortParam = params.get("sort");
  if (sortParam) {
    const desc = sortParam.startsWith("-");
    const field = sortParam.replace(/^-/, "");
    filtered.sort((a, b) => {
      const va = a[field] ?? "";
      const vb = b[field] ?? "";
      return desc ? (vb > va ? 1 : -1) : va > vb ? 1 : -1;
    });
  }

  const limitParam = params.get("limit");
  if (limitParam && Number(limitParam) > 0) {
    filtered = filtered.slice(0, Number(limitParam));
  }

  return { data: filtered };
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost:8055");

  // Health check
  if (url.pathname === "/server/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Assets — return a 1x1 transparent PNG
  if (url.pathname.startsWith("/assets/")) {
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(pixel);
    return;
  }

  // Items endpoint
  if (url.pathname.startsWith("/items/")) {
    const result = handleItemsRequest(url);
    if (result) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ errors: [{ message: "Not Found" }] }));
});

const PORT = process.env.PORT || 8055;
server.listen(PORT, () => {
  console.log(`Mock Directus server running on http://localhost:${PORT}`);
});
