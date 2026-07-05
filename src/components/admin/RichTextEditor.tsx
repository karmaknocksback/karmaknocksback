"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Image, AlignLeft, AlignCenter,
  Minus, RotateCcw, RotateCw,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TOOLBAR_GROUPS = [
  [
    { icon: "H2", title: "Heading 2 (##)", tag: "h2" },
    { icon: "H3", title: "Heading 3 (###)", tag: "h3" },
  ],
  [
    { icon: "bold", title: "Bold", cmd: "bold" },
    { icon: "italic", title: "Italic", cmd: "italic" },
    { icon: "underline", title: "Underline", cmd: "underline" },
    { icon: "strike", title: "Strikethrough", cmd: "strikeThrough" },
  ],
  [
    { icon: "ul", title: "Bullet List", cmd: "insertUnorderedList" },
    { icon: "ol", title: "Numbered List", cmd: "insertOrderedList" },
    { icon: "quote", title: "Blockquote", tag: "blockquote" },
    { icon: "hr", title: "Divider", cmd: "insertHorizontalRule" },
  ],
  [
    { icon: "alignLeft", title: "Align Left", cmd: "justifyLeft" },
    { icon: "alignCenter", title: "Align Center", cmd: "justifyCenter" },
  ],
  [
    { icon: "link", title: "Insert Link" },
    { icon: "image", title: "Insert Image" },
  ],
  [
    { icon: "undo", title: "Undo", cmd: "undo" },
    { icon: "redo", title: "Redo", cmd: "redo" },
  ],
];

function ToolbarBtn({ icon, title, onClick }: { icon: string; title: string; onClick: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    bold: <Bold size={14}/>,
    italic: <Italic size={14}/>,
    underline: <Underline size={14}/>,
    strike: <Strikethrough size={14}/>,
    H2: <Heading2 size={14}/>,
    H3: <Heading3 size={14}/>,
    ul: <List size={14}/>,
    ol: <ListOrdered size={14}/>,
    quote: <Quote size={14}/>,
    hr: <Minus size={14}/>,
    alignLeft: <AlignLeft size={14}/>,
    alignCenter: <AlignCenter size={14}/>,
    link: <Link2 size={14}/>,
    image: <Image size={14}/>,
    undo: <RotateCcw size={14}/>,
    redo: <RotateCw size={14}/>,
  };
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-charcoal/60 hover:bg-charcoal/8 hover:text-charcoal transition-colors"
    >
      {icons[icon] ?? <span className="text-xs font-bold">{icon}</span>}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = "यहाँ लिखें...", minHeight = 320 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);

  // Sync value → editor (only on mount or external change)
  useEffect(() => {
    if (!editorRef.current || isUpdating.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    triggerChange();
  }, []);

  const wrapTag = useCallback((tag: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const el = document.createElement(tag);
    try {
      range.surroundContents(el);
    } catch {
      el.appendChild(range.extractContents());
      range.insertNode(el);
    }
    sel.removeAllRanges();
    triggerChange();
  }, []);

  function triggerChange() {
    if (!editorRef.current) return;
    isUpdating.current = true;
    onChange(editorRef.current.innerHTML);
    setTimeout(() => { isUpdating.current = false; }, 50);
  }

  function handleLink() {
    const url = window.prompt("लिंक URL दर्ज करें:", "https://");
    if (url) exec("createLink", url);
  }

  function handleImage() {
    const url = window.prompt("Image URL दर्ज करें:", "https://");
    if (url) exec("insertImage", url);
  }

  function handleBtn(item: { icon: string; cmd?: string; tag?: string }) {
    if (item.cmd === "insertUnorderedList" || item.cmd === "insertOrderedList") {
      exec(item.cmd);
    } else if (item.cmd) {
      exec(item.cmd);
    } else if (item.tag === "blockquote") {
      exec("formatBlock", "blockquote");
    } else if (item.tag === "h2") {
      exec("formatBlock", "h2");
    } else if (item.tag === "h3") {
      exec("formatBlock", "h3");
    } else if (item.icon === "link") {
      handleLink();
    } else if (item.icon === "image") {
      handleImage();
    }
  }

  return (
    <div className="rounded-2xl border border-charcoal/10 overflow-hidden" style={{ fontFamily: "inherit" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-charcoal/[0.03] border-b border-charcoal/8">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-charcoal/10 mx-1" />}
            {group.map((item) => (
              <ToolbarBtn
                key={item.icon}
                icon={item.icon}
                title={item.title}
                onClick={() => handleBtn(item)}
              />
            ))}
          </div>
        ))}

        {/* Color picker */}
        <div className="w-px h-5 bg-charcoal/10 mx-1" />
        <div className="flex items-center gap-1">
          {["#c89b3c", "#E53935", "#1565C0", "#2E7D32", "#7B1FA2"].map((color) => (
            <button
              key={color}
              type="button"
              title={`Text color: ${color}`}
              onMouseDown={(e) => { e.preventDefault(); exec("foreColor", color); }}
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ background: color }}
            />
          ))}
          <button
            type="button"
            title="Remove formatting"
            onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
            className="ml-1 font-sans text-xs text-charcoal/40 hover:text-charcoal px-2 py-1 rounded border border-charcoal/10"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        onKeyDown={(e) => {
          // Tab to indent
          if (e.key === "Tab") {
            e.preventDefault();
            exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
          }
        }}
        data-placeholder={placeholder}
        className="p-5 outline-none font-hindi text-sm text-charcoal leading-relaxed"
        style={{
          minHeight,
          overflowY: "auto",
        }}
      />

      {/* Markdown hint */}
      <div className="px-4 py-2 bg-charcoal/[0.02] border-t border-charcoal/6 flex justify-between items-center">
        <span className="font-sans text-[10px] text-charcoal/35">
          💡 Tip: Use toolbar buttons above for formatting
        </span>
        <span className="font-sans text-[10px] text-charcoal/35">
          Ctrl+B Bold · Ctrl+I Italic · Ctrl+Z Undo
        </span>
      </div>

      <style>{`
        [contenteditable]:empty::before { content: attr(data-placeholder); color: rgba(44,24,16,0.3); pointer-events: none; }
        [contenteditable] h2 { font-size: 1.4em; font-weight: 700; margin: 12px 0 6px; color: #1a0800; }
        [contenteditable] h3 { font-size: 1.15em; font-weight: 700; margin: 10px 0 4px; color: #1a0800; }
        [contenteditable] blockquote { border-left: 3px solid #c89b3c; padding: 6px 14px; margin: 8px 0; color: #5a3e1b; background: rgba(200,155,60,0.08); border-radius: 0 8px 8px 0; }
        [contenteditable] ul { list-style: disc; padding-left: 22px; margin: 6px 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 22px; margin: 6px 0; }
        [contenteditable] a { color: #c89b3c; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        [contenteditable] hr { border: none; border-top: 1px solid #e0d0b0; margin: 14px 0; }
      `}</style>
    </div>
  );
}
