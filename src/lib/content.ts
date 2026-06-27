import { slugify } from "./utils";

export interface ContentHeading {
  id: string;
  text: string;
}

interface ParsedBlock {
  type: "heading" | "paragraph";
  text: string;
  id?: string;
}

export function parseArticleContent(content: string): ParsedBlock[] {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) {
        const text = block.replace(/^##\s+/, "");
        return { type: "heading", text, id: slugify(text) } as ParsedBlock;
      }
      return { type: "paragraph", text: block } as ParsedBlock;
    });
}

export function extractHeadings(blocks: ParsedBlock[]): ContentHeading[] {
  return blocks
    .filter((b) => b.type === "heading" && b.id)
    .map((b) => ({ id: b.id as string, text: b.text }));
}
