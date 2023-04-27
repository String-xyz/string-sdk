import { version } from '$app/environment'
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = (async ({ event, resolve }) => {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%APP_VER%', `v${version}`)
	});
});
