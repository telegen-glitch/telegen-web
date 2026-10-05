import type { Block, Section } from "@/content/types";
import { renderRichText } from "@/lib/rich-text";

export function BlockView({ block, sourceOrder }: { block: Block; sourceOrder: string[] }) {
  switch (block.type) {
    case "p":
      return <p>{renderRichText(block.text, sourceOrder)}</p>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "list": {
      const items = block.items.map((item) => <li key={item}>{renderRichText(item, sourceOrder)}</li>);
      return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "callout":
      return (
        <aside
          className={`rounded-xl border-l-4 p-5 ${block.tone === "caution" ? "border-amber-800/60 bg-amber-100/50" : "border-blue-600 bg-blue-50"}`}
        >
          {block.title && <p className="font-semibold text-navy-950">{block.title}</p>}
          <p className={block.title ? "mt-1.5" : ""}>{renderRichText(block.text, sourceOrder)}</p>
        </aside>
      );
  }
}

export function SectionView({ section, sourceOrder }: { section: Section; sourceOrder: string[] }) {
  return (
    <section aria-labelledby={section.id} className="scroll-mt-28">
      <h2 id={section.id}>{section.heading}</h2>
      {section.blocks.map((b, i) => (
        <div key={i} className="mt-[1.1em]">
          <BlockView block={b} sourceOrder={sourceOrder} />
        </div>
      ))}
    </section>
  );
}
