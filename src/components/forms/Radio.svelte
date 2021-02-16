<script>
    export let label = "Label";
    export let values = [
        {
            label: "Yes",
        },
        {
            label: "No",
        },
    ];
    export let output = "";
</script>

<div class="radio_group form-check">
    {label}:
    {#each values as value}
        <label class="form-check-label">
            <input
                type="radio"
                bind:group={output}
                value={value.label.toLocaleLowerCase()}
                class="form-check-input"
            />
            {value.label}
        </label>
    {/each}
    <br />
</div>

<style>
    .radio_group {
        display: flex;
        flex-direction: column;
    }
</style>
