// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type PocketBase, { AuthModel } from 'pocketbase';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
            errors: string;
            success: string;
            pb: PocketBase;
            user: AuthModel | null;
        }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
