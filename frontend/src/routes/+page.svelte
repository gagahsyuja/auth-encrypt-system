<script lang="ts">
    import Auth from '$lib/auth.svelte';
    import Dashboard from '$lib/dashboard.svelte';
    import type { LayoutData } from './$types.js';

    export let data: LayoutData;
</script>

{#if data.errors}
    <div class="absolute flex flex-col bg-blue-500 z-[150] w-[900px] h-[400px]">
        <h1>{data.errors}</h1>
        <form method="POST" action="?/close">
            <button class="bg-red-500 w-1/2">Close</button>
        </form>
    </div>
{/if}

{#if data.user}
    <Dashboard userData={data} />
{:else}
    <Auth />
{/if}
