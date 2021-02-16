<script>
    export let label = "Label";
    export let values = [
        {
            label: "yes",
        },
    ];
    export let output = [];
</script>

<div class="checkbox_group form-group">
    {label}:
    {#each values as value}
        <label>
            <input
                type="checkbox"
                bind:group={output}
                value={value.label.toLocaleLowerCase()}
                class="form-control"
            />
            {value.label}
        </label>
    {/each}
    <br />
</div>

<style>
    .checkbox_group {
        display: flex;
        flex-direction: column;
    }
</style>
