export interface ApiResp<T> {
    body: T;
    message?: string;
    statusCode?: number;
    success?: boolean;
}

export interface BlogFeedOverview {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    readTime: string;
    viewsCount: number;
    commentsCount: number;
    likesCount: number;
    updatedAt: string;
    author: {
        _id: string;
        avatarUrl?: string;
        username: string;
        name: string;
    }
}

export interface BlogsFeed {
    blog: BlogFeedOverview[];
    success: boolean;
}

type BlockType =
    | { type: 'h1'; content: string }
    | { type: 'h2'; content: string }
    | { type: 'h3'; content: string }
    | { type: 'paragraph'; content: string }
    | { type: 'code'; lang: string; code: string }
    | { type: 'img'; src: string; alt?: string }
    | { type: 'list'; ordered?: boolean; items: string[] };


export interface Blog {
    blog: Omit<BlogFeedOverview, 'excerpt'> & {
        body: BlockType[];
        coverImage?: string;
    };
    success: boolean;
}