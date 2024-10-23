import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import CryptoJS from 'crypto-js';

export const load = (async ({ locals }) => {
    return {
        user: locals.user
    };
}) satisfies PageServerLoad;

function getCode(letter: string): number {
    
    let code: number = letter.charCodeAt(0) - 96;
    
    if (code > 9) {
        return Number(code.toString().split('')[1]);
    } else {
        return letter.charCodeAt(0) - 96;
    }
}

export const actions = {
    logout: async ({ request, locals }) => {
        locals.pb.authStore.clear();
    },
    register: async ({ request, locals }) => {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const email = formData.get('email') as string;

        let password_encrypted = CryptoJS.AES.encrypt(password, username).toString();
        let hash_value = CryptoJS.SHA256(password).toString();

        let reversed = username.split('').reverse().join('');
        let letterCodes = username.split('').map(w => getCode(w)).join('');

        let salt_value = reversed + letterCodes;

        // salt_value = CryptoJS.SHA256(salt_value).toString();
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

        try {

            locals.pb.authStore.clear();

            let hash_value = CryptoJS.SHA256(password).toString();
            let salt_value = username.split('').reverse().join('');
            let final_password = CryptoJS.SHA256(salt_value + password).toString();

            try {

                let user = await locals.pb.collection('users')
                    .getFirstListItem('username="' + username + '"');

                try {

                    if (user.final_password === final_password) {
                        await locals.pb.collection('users').authWithPassword(username, password);
                    }

                } catch (err: any) {

                    locals.pb.authStore.clear();
                    // console.log('wrong password');
                    error(500, "Wrong password");
                }

            } catch (err: any) {

                locals.pb.authStore.clear();
                // console.log('username not found');
                error(500, "Username not found");
            }

            // console.log(record.items[0]);
            // console.log(locals.pb.authStore.isValid);
            // console.log(locals.pb.authStore.token);
            // console.log(locals.pb.authStore.model.id);

            // console.log(record);

            await locals.pb.collection('users').authWithPassword(username, password);

            console.log(locals.pb.authStore.isValid);
            console.log(locals.pb.authStore.token);
            console.log(locals.pb.authStore.model);

            // if (!locals.pb?.authStore?.model?.verified) {
            //     locals.pb.authStore.clear();
            //     console.log('not verified');
            //
            //     return {
            //         notVerified: true
            //     };
            // }

        } catch (err: any) {
            error(500, err.message);
        }

        redirect(303, '/');
    }
}
