declare module "ironpass" {
    export function hash(
        password: string,
        options?: unknown
    ): Promise<string>;

    export function verifyPassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean>;
}