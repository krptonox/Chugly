declare module "ironpass" {
    export function hash(
        password: string
    ): Promise<string>;

    export function verifyPassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean>;
}