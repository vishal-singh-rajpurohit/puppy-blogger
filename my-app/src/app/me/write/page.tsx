'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import {
    Heading1,
    Heading2,
    Heading3,
    Pilcrow,
    List,
    ListOrdered,
    Image as ImageIcon,
    Code2,
    Trash2,
    ChevronUp,
    ChevronDown,
    type LucideIcon,
} from "lucide-react"

import { PostType, BlockType, ListBlockType, TextBlockType } from "../../../types/blog.types"

const ProgrammingLanguages = [
    "bash", "c", "c#", "cpp", "css", "docker", "go",
    "html", "ini", "java", "javascript", "js", "json", "makefile",
    "md", "php", "python", "python-repl", "ruby", "rust", "shell", "sql",
    "swift", "toml", "ts", "tsx", "typescript", "yaml", "xml",
] as const

type CodeLang = typeof ProgrammingLanguages[number]

type Block =
    | { id: string; type: "h1" | "h2" | "h3" | "paragraph"; text: string }
    | { id: string; type: "code"; text: string; lang: CodeLang }
    | { id: string; type: ListBlockType; items: string[] }
    | { id: string; type: "image"; url: string; alt: string }

function createId() {
    return Math.random().toString(36).slice(2, 9)
}

function createBlock(type: BlockType): Block {
    const id = createId()
    if (type === "unordered-list" || type === "ordered-list") {
        return { id, type, items: [""] }
    }
    if (type === "image") {
        return { id, type, url: "", alt: "" }
    }
    if (type === "code") {
        return { id, type: "code", text: "", lang: ProgrammingLanguages[0] }
    }
    return { id, type, text: "" }
}

// Converts the editor's working format into the canonical PostType shape
// used when a post is stored/rendered elsewhere.
function buildPost(title: string, blocks: Block[]): PostType {
    return {
        title,
        body: blocks.map((block): PostType["body"][number] => {
            switch (block.type) {
                case "h1":
                case "h2":
                case "h3":
                case "paragraph":
                    return { type: block.type, content: block.text }
                case "code":
                    return { type: "code", lang: block.lang, code: block.text }
                case "image":
                    return { type: "img", src: block.url, alt: block.alt }
                case "unordered-list":
                case "ordered-list":
                    return {
                        type: "list",
                        ordered: block.type === "ordered-list",
                        items: block.items,
                    }
            }
        }),
    }
}

const ELEMENT_OPTIONS: { type: BlockType; label: string; icon: LucideIcon }[] = [
    { type: "h1", label: "Heading 1", icon: Heading1 },
    { type: "h2", label: "Heading 2", icon: Heading2 },
    { type: "h3", label: "Heading 3", icon: Heading3 },
    { type: "paragraph", label: "Paragraph", icon: Pilcrow },
    { type: "unordered-list", label: "Bullet list", icon: List },
    { type: "ordered-list", label: "Numbered list", icon: ListOrdered },
    { type: "image", label: "Image", icon: ImageIcon },
    { type: "code", label: "Code snippet", icon: Code2 },
]

const HEADING_CLASS: Record<"h1" | "h2" | "h3", string> = {
    h1: "text-3xl font-semibold",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-semibold",
}

function BlockControls({
    index,
    total,
    onMoveUp,
    onMoveDown,
    onRemove,
}: {
    index: number
    total: number
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
}) {
    return (
        <div className="absolute -right-1 top-1 flex -translate-y-1/2 items-center gap-0.5 rounded-sm bg-ui-card-secondary p-0.5 opacity-0 shadow-sm transition group-hover:opacity-100">
            <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                aria-label="Move block up"
                className="rounded-sm p-1 text-ui-text-secondary transition hover:text-ui-text-secondary-hover disabled:opacity-30"
            >
                <ChevronUp size={14} />
            </button>
            <button
                type="button"
                onClick={onMoveDown}
                disabled={index === total - 1}
                aria-label="Move block down"
                className="rounded-sm p-1 text-ui-text-secondary transition hover:text-ui-text-secondary-hover disabled:opacity-30"
            >
                <ChevronDown size={14} />
            </button>
            <button
                type="button"
                onClick={onRemove}
                aria-label="Delete block"
                className="rounded-sm p-1 text-ui-text-secondary transition hover:text-red-500"
            >
                <Trash2 size={14} />
            </button>
        </div>
    )
}

function ListBlockEditor({
    type,
    items,
    onChange,
}: {
    type: ListBlockType
    items: string[]
    onChange: (items: string[]) => void
}) {
    const itemRefs = useRef<(HTMLInputElement | null)[]>([])
    const focusIndex = useRef<number | null>(null)

    useEffect(() => {
        if (focusIndex.current !== null) {
            itemRefs.current[focusIndex.current]?.focus()
            focusIndex.current = null
        }
    }, [items])

    function updateItem(index: number, value: string) {
        const next = [...items]
        next[index] = value
        onChange(next)
    }

    function addItemAfter(index: number) {
        const next = [...items]
        next.splice(index + 1, 0, "")
        focusIndex.current = index + 1
        onChange(next)
    }

    function removeItem(index: number) {
        if (items.length === 1) {
            onChange([""])
            return
        }
        const next = items.filter((_, i) => i !== index)
        onChange(next)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
        if (event.key === "Enter") {
            event.preventDefault()
            addItemAfter(index)
        }
        if (event.key === "Backspace" && items[index] === "" && items.length > 1) {
            event.preventDefault()
            removeItem(index)
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            {items.map((item, index) => (
                <div key={index} className="group/item flex items-center gap-2">
                    <span className="w-4 shrink-0 text-sm text-ui-text-secondary">
                        {type === "ordered-list" ? `${index + 1}.` : "•"}
                    </span>
                    <input
                        ref={(el) => {
                            itemRefs.current[index] = el
                        }}
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="List item"
                        className="w-full bg-transparent text-sm text-ui-text-primary outline-none placeholder:text-ui-text-secondary"
                    />
                    <button
                        type="button"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                        className="text-ui-text-secondary opacity-0 transition hover:text-red-500 group-hover/item:opacity-100"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            ))}
        </div>
    )
}

function BlockEditor({
    block,
    index,
    total,
    onUpdate,
    onRemove,
    onMove,
}: {
    block: Block
    index: number
    total: number
    onUpdate: (block: Block) => void
    onRemove: () => void
    onMove: (direction: -1 | 1) => void
}) {
    return (
        <div className="group relative rounded-sm px-3 py-2 transition hover:bg-ui-card-secondary/60">
            <BlockControls
                index={index}
                total={total}
                onMoveUp={() => onMove(-1)}
                onMoveDown={() => onMove(1)}
                onRemove={onRemove}
            />

            {(block.type === "h1" || block.type === "h2" || block.type === "h3") && (
                <input
                    value={block.text}
                    onChange={(e) => onUpdate({ ...block, text: e.target.value })}
                    placeholder={block.type === "h1" ? "Heading 1" : block.type === "h2" ? "Heading 2" : "Heading 3"}
                    className={`w-full bg-transparent text-ui-text-primary outline-none placeholder:text-ui-text-secondary ${HEADING_CLASS[block.type]}`}
                />
            )}

            {block.type === "paragraph" && (
                <textarea
                    value={block.text}
                    onChange={(e) => onUpdate({ ...block, text: e.target.value })}
                    placeholder="Write a paragraph..."
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm leading-relaxed text-ui-text-primary outline-none placeholder:text-ui-text-secondary"
                />
            )}

            {block.type === "code" && (
                <div className="flex flex-col gap-2">
                    <select
                        value={block.lang}
                        onChange={(e) => onUpdate({ ...block, lang: e.target.value as CodeLang })}
                        className="w-fit rounded-sm bg-ui-bg-secondary px-2 py-1 text-xs text-ui-text-primary outline-none"
                    >
                        {ProgrammingLanguages.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                    <textarea
                        value={block.text}
                        onChange={(e) => onUpdate({ ...block, text: e.target.value })}
                        placeholder="// code snippet"
                        rows={5}
                        spellCheck={false}
                        className="w-full resize-none rounded-sm bg-ui-bg-secondary p-3 font-mono text-sm text-ui-text-primary outline-none placeholder:text-ui-text-secondary"
                    />
                </div>
            )}

            {(block.type === "unordered-list" || block.type === "ordered-list") && (
                <ListBlockEditor
                    type={block.type}
                    items={block.items}
                    onChange={(items) => onUpdate({ ...block, items })}
                />
            )}

            {block.type === "image" && (
                <div className="flex flex-col gap-2">
                    <input
                        value={block.url}
                        onChange={(e) => onUpdate({ ...block, url: e.target.value })}
                        placeholder="Image URL"
                        className="w-full rounded-sm bg-ui-bg-secondary px-3 py-2 text-sm text-ui-text-primary outline-none placeholder:text-ui-text-secondary"
                    />
                    <input
                        value={block.alt}
                        onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
                        placeholder="Alt text (for accessibility & SEO)"
                        className="w-full rounded-sm bg-ui-bg-secondary px-3 py-2 text-sm text-ui-text-primary outline-none placeholder:text-ui-text-secondary"
                    />
                    {block.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={block.url}
                            alt={block.alt}
                            className="mt-1 max-h-80 w-full rounded-sm object-cover"
                        />
                    )}
                </div>
            )}
        </div>
    )
}

function ElementsBlock({ addBlock }: { addBlock: (type: BlockType) => void }) {
    return (
        <aside className="w-full shrink-0 lg:w-56">
            <div className="rounded-sm bg-ui-card-primary p-3 lg:sticky lg:top-10">
                <h2 className="px-2 text-xs font-semibold uppercase tracking-wide text-ui-text-secondary">
                    Add block
                </h2>
                <div className="mt-2 flex flex-row flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
                    {ELEMENT_OPTIONS.map(({ type, label, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(type)}
                            className="flex items-center gap-2.5 rounded-sm px-2 py-2 text-left text-sm text-ui-text-primary transition hover:bg-ui-card-secondary"
                        >
                            <Icon size={16} className="shrink-0 text-ui-text-secondary" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default function WritePage() {
    const [title, setTitle] = useState("")
    const [blocks, setBlocks] = useState<Block[]>([])

    function updateBlock(id: string, next: Block) {
        setBlocks((prev) => prev.map((b) => (b.id === id ? next : b)))
    }

    function removeBlock(id: string) {
        setBlocks((prev) => prev.filter((b) => b.id !== id))
    }

    function moveBlock(id: string, direction: -1 | 1) {
        setBlocks((prev) => {
            const index = prev.findIndex((b) => b.id === id)
            const nextIndex = index + direction
            if (nextIndex < 0 || nextIndex >= prev.length) return prev
            const next = [...prev]
                ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
            return next
        })
    }

    function addBlock(type: BlockType) {
        setBlocks((prev) => [...prev, createBlock(type)])
    }

    function handlePublish() {
        const post = buildPost(title, blocks)
        // Replace with a real API call, e.g.:
        // await fetch("/api/posts", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(post),
        // })
        console.log(post)
    }

    return (
        <div className="min-h-screen bg-ui-bg-primary">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:px-10">
                <ElementsBlock addBlock={addBlock} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-ui-text-primary outline-none placeholder:text-ui-text-secondary sm:text-4xl"
                        />
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                className="rounded-sm bg-ui-btn-bg-secondary px-4 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-secondary-hover"
                            >
                                Save draft
                            </button>
                            <button
                                type="button"
                                onClick={handlePublish}
                                className="rounded-sm bg-ui-btn-bg-primary px-4 py-2 text-sm font-medium text-ui-btn-text-primary transition hover:bg-ui-btn-bg-primary-hover"
                            >
                                Publish
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-1">
                        {blocks.length === 0 && (
                            <p className="px-3 text-sm text-ui-text-secondary">
                                Start writing, or add a block from the panel.
                            </p>
                        )}

                        {blocks.map((block, index) => (
                            <BlockEditor
                                key={block.id}
                                block={block}
                                index={index}
                                total={blocks.length}
                                onUpdate={(next) => updateBlock(block.id, next)}
                                onRemove={() => removeBlock(block.id)}
                                onMove={(direction) => moveBlock(block.id, direction)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}