type Lang =
    | "bash" | "c" | "c#" | "cpp" | "css" | "docker" | "go"
    | "html" | "ini" | "java" | "javascript" | "js" | "json" | "makefile"
    | "md" | "php" | "python" | "python-repl" | "ruby" | "rust" | "shell" | "sql"
    | "swift" | "toml" | "ts" | "tsx" | "typescript" | "yaml" | "xml";

export type TextBlockType = "h1" | "h2" | "h3" | "paragraph" | "code";
export type ListBlockType = "unordered-list" | "ordered-list";
export type BlockType = TextBlockType | ListBlockType | "image" | "code";

type CodeBody = {
    type: "code",
    lang: Lang,
    code: string
}

type NormalBody = {
    type: TextBlockType,
    content: string
}

type ImgBody = {
    type: "img",
    src: string,
    alt: string
}

type ListBody = {
    type: "list",
    ordered: boolean,
    items: string[]
}

export interface PostType {
    title: string,
    body: (NormalBody | CodeBody | ImgBody | ListBody)[]
}