import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';

export const load = (async ({ locals }) => {
    return {
        user: locals.user,
        errors: locals.errors
    };
}) satisfies PageServerLoad;

function getCode(letter: string): number {
    
    let code: number = letter.charCodeAt(0) - 96;
    
    if (code > 9 && code < 100) {
        return Number(code.toString().split('')[1]);
    } else {
        return letter.charCodeAt(0) - 96;
    }
}

function getSalt(word: string): string {

    let reversed = word.split('')
        .reverse()
        .join('');

    let letterCodes = word.split('')
        .map(letter => getCode(letter))
        .join('');

    return reversed + letterCodes;
}

export const actions = {
    close: async ({ locals }) => {
        locals.errors = '';
    },
    logout: async ({ locals }) => {
        locals.pb.authStore.clear();
        redirect(303, '/');
    },
    register: async ({ request, locals }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const email = formData.get('email') as string;

        let hash_value = CryptoJS.SHA256(password).toString();

        let salt_value = getSalt(username);

        let password_encrypted = CryptoJS.AES.encrypt(password, salt_value).toString();

        let final_password = CryptoJS.SHA256(salt_value + password).toString();

        const data = {
            "username": username,
            "email": email,
            "emailVisibility": true,
            "password": password,
            "passwordConfirm": password,
            "name": "",
            "password_original": password,
            "password_encrypted": password_encrypted,
            "hash_value": hash_value,
            "salt_value": salt_value,
            "final_password": final_password
        };

        try {
            await locals.pb.collection('users').create(data);
        } catch (err: any) {
            error(500, err.message);
        }

        redirect(303, '/');
    },
    login: async ({ request, locals }) => {

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        let salt_value = getSalt(username);

        locals.pb.authStore.clear();

        let user;

        try {
            user = await locals.pb.collection('users')
                .getFirstListItem('username="' + username + '"');

        } catch {
            locals.errors = "The username you entered does not exist. Please try again.";
        }

        if (user) {
            let final_password = CryptoJS.SHA256(salt_value + password).toString();

            if (user.final_password === final_password) {
                await locals.pb.collection('users').authWithPassword(username, password);
                redirect(303, '/');
            } else {
                locals.errors = 'The password you entered is incorrect. Please try again.';
            }
        }
    }
}
