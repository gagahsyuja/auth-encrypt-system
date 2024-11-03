<script lang="ts">
    import Auth from '$lib/auth.svelte';
    import Dashboard from '$lib/dashboard.svelte';
    import Error from '$lib/error.svelte';
    import Success from '$lib/success.svelte';
    import type { LayoutData } from './$types.js';

    export let data: LayoutData;
</script>
    
{#if data.errors}
    <Error userData={data} />
{/if}

{#if data.success}
    <Success userData={data} />
{/if}

{#if data.user}
    <Dashboard userData={data} />
{:else}
    <Auth />
{/if}
