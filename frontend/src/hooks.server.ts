import PocketBase from 'pocketbase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {

    const url = 'http://127.0.0.1:8090';

    event.locals.pb = new PocketBase(url);

    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
    const model = event.locals.pb.authStore.model;

    try {
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
            event.locals.user = structuredClone(model);
        }
    } catch {
        event.locals.pb.authStore.clear();
        event.locals.user = null;
    }

    const response = await resolve(event);

    response.headers.set('set-cookie', event.locals.pb.authStore.exportToCookie({ secure: false }));

    return response;
}
