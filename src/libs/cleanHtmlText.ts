const blockTags = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

const mediaTags = new Set(["audio", "canvas", "iframe", "img", "video"]);

function isBlockElement(node: Node) {
  return (
    node.nodeType === Node.ELEMENT_NODE &&
    blockTags.has((node as Element).tagName.toLowerCase())
  );
}

function childrenText(node: Node): string {
  let result = "";

  for (const child of node.childNodes) {
    if (isBlockElement(child) && result && !result.endsWith("\n")) {
      result += "\n";
    }
    result += nodeText(child);
  }

  return result;
}

function nodeText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  if (tagName === "br") return "\n";
  if (tagName === "script" || tagName === "style") return "";
  if (mediaTags.has(tagName)) return "\n";

  const content = childrenText(element);
  if (blockTags.has(tagName)) {
    return content.endsWith("\n") ? content : `${content}\n`;
  }

  return content;
}

export function cleanHtmlText(value: string | null): string {
  if (!value) return "";

  const document = new DOMParser().parseFromString(value, "text/html");
  return Array.from(document.body.childNodes, nodeText)
    .join("")
    .replace(/\r\n?/g, "\n")
    .trim();
}
