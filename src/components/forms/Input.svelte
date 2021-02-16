<script>
    export let label = "Label";
    export let pattern = "";
    export let title = "";
    export let output = "";
    export let disabled = false;
    let name = label.toLocaleLowerCase().replace(/ /g, "_");
    let id = name + "_id";
</script>

<div class="input_group form-group">
    <label for={id}>{label}:</label>
    {#if pattern != ""}
        <input
            type="text"
            {id}
            {name}
            bind:value={output}
            {pattern}
            {title}
            {disabled}
            class="form-control"
        />
    {:else}
        <input
            type="text"
            {id}
            {name}
            bind:value={output}
            {disabled}
            class="form-control"
        />
    {/if}
</div>

<style>
    .input_group {
        display: flex;
        flex-direction: column;
    }
</style>
