// Vercel serverless function: persist inline's edits by committing them to the
// GitHub source, so "save" permanently changes the live site (commit -> redeploy).
// Adapted from emdw/elisatoworld's api/inline-save.js for this flat static site.
//
// Auth: the edit code (its sha256 must match EDIT_HASH) is passed as ?code=...
// and verified here, so only the code-holder can commit. The GitHub token lives
// server-side only (Vercel env var GITHUB_TOKEN).
//
// Required env: GITHUB_TOKEN (PAT with Contents: read & write on the repo)
// Optional env: GITHUB_REPO (default elisadiopweyer/reading), GITHUB_BRANCH (default main)

import crypto from "node:crypto";

const EDIT_HASH = "cd541da1035193d04273d5a0b17030546a2e1a6aa7693f355fc528e151421113";
const REPO = process.env.GITHUB_REPO || "elisadiopweyer/reading";
const BRANCH = process.env.GITHUB_BRANCH || "main";

// This is a single-page static app: visible copy lives in index.html, and some
// explanatory strings are generated from template literals in app.js/teacher.js.
// Search them in this order; a JS hit must clear a higher bar (see below).
const SOURCE_FILES = ["index.html", "app.js", "teacher.js"];
const MIN_JS_MATCH = 12; // never let a short prose edit clobber code

const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");

async function gh(path, init) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "inline-save",
      ...(init && init.headers),
    },
  });
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function encodeForSource(s, isJs) {
  if (isJs) {
    // inside a JS template literal: keep it literal, just neutralize the
    // characters that would change the program.
    return String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  }
  return String(s)
    .replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[a-zA-Z][a-zA-Z0-9]*;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// is [start,end) genuine element text content in HTML -- not inside a `<...>`
// tag/attribute, and not straddling markup?
function isTextSpan(content, start, end) {
  for (let i = start; i < end; i++) {
    const ch = content[i];
    if (ch === "<" || ch === ">") return false;
  }
  const lastOpen = content.lastIndexOf("<", start - 1);
  const lastClose = content.lastIndexOf(">", start - 1);
  return lastClose >= lastOpen;
}

// a JS hit must sit inside a string/template literal: either an odd number of
// unescaped backticks precede it (multi-line template literal), or a quote
// character opens earlier on the same line.
function isJsStringSpan(content, start) {
  let backticks = 0;
  for (let i = 0; i < start; i++) {
    if (content[i] === "`" && content[i - 1] !== "\\") backticks++;
  }
  if (backticks % 2 === 1) return true;
  const lineStart = content.lastIndexOf("\n", start) + 1;
  return /["'`]/.test(content.slice(lineStart, start));
}

// Locate `oldText` in `content` -- exact first, then whitespace/entity tolerant --
// accepting only hits in element text (HTML) or string literals (JS).
export function replaceTolerant(content, oldText, newText, isJs) {
  if (isJs && String(oldText).trim().length < MIN_JS_MATCH) return null;
  const repl = encodeForSource(newText, isJs);
  const accept = (s, e) => (isJs ? isJsStringSpan(content, s) : isTextSpan(content, s, e));

  let from = 0, idx;
  while ((idx = content.indexOf(oldText, from)) !== -1) {
    if (accept(idx, idx + oldText.length)) {
      return content.slice(0, idx) + repl + content.slice(idx + oldText.length);
    }
    from = idx + 1;
  }

  const trimmed = String(oldText).trim();
  if (!trimmed || trimmed.length > 4000) return null;
  let pat = escapeRe(trimmed).replace(/\s+/g, "\\s+");
  if (!isJs) {
    pat = pat
      .replace(/&/g, "(?:&amp;|&)")
      .replace(/</g, "(?:&lt;|<)")
      .replace(/>/g, "(?:&gt;|>)");
  }
  try {
    const re = new RegExp(pat, "g");
    let m;
    while ((m = re.exec(content)) !== null) {
      const s = m.index, e = s + m[0].length;
      if (accept(s, e)) {
        return content.slice(0, s) + repl + content.slice(e);
      }
      if (re.lastIndex === s) re.lastIndex++;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });

  const code = (req.query && req.query.code) || "";
  if (sha256(code) !== EDIT_HASH) return res.status(401).json({ ok: false, error: "bad code" });

  if (!process.env.GITHUB_TOKEN)
    return res.status(500).json({ ok: false, error: "server missing GITHUB_TOKEN env var" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const edits = (body && body.edits) || [];
  const valid = edits.filter((e) => e && e.old != null && e.new != null && e.old !== e.new);
  if (!valid.length) return res.status(400).json({ ok: false, error: "no edits" });

  // pull every candidate source file once
  const files = [];
  for (const name of SOURCE_FILES) {
    const r = await gh(`/repos/${REPO}/contents/${name}?ref=${BRANCH}`);
    if (r.ok) {
      const j = await r.json();
      files.push({
        name,
        sha: j.sha,
        content: Buffer.from(j.content, "base64").toString("utf8"),
        isJs: name.endsWith(".js"),
        dirty: false,
      });
    }
  }
  if (!files.length)
    return res.status(404).json({ ok: false, error: "no source files reachable in " + REPO });

  let replaced = 0;
  const committed = [];
  const misses = [];
  for (const e of valid) {
    const tag = e.key != null ? e.key : String(e.old).trim().slice(0, 60);
    let done = false;
    for (const f of files) {
      const next = replaceTolerant(f.content, e.old, e.new, f.isJs);
      if (next != null) {
        f.content = next;
        f.dirty = true;
        replaced++;
        committed.push(tag);
        done = true;
        break;
      }
    }
    if (!done) misses.push(tag);
  }
  if (!replaced)
    return res.status(422).json({ ok: false, error: "none of the edits were found in source", misses });

  const written = [];
  for (const f of files) {
    if (!f.dirty) continue;
    const put = await gh(`/repos/${REPO}/contents/${f.name}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `inline: edit ${f.name}`,
        content: Buffer.from(f.content, "utf8").toString("base64"),
        sha: f.sha,
        branch: BRANCH,
      }),
    });
    if (!put.ok) {
      const t = await put.text();
      return res
        .status(502)
        .json({ ok: false, error: "github commit failed for " + f.name, detail: t.slice(0, 300), written });
    }
    written.push(f.name);
  }
  return res.status(200).json({ ok: true, files: written, replaced, committed, misses });
}
