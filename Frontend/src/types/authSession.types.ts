export interface AuthSessionUnion {
    access_token?: string;
    refresh_token?: string;
    incomplete?: boolean;
}