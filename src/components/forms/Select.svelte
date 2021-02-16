<script>
    export let label = "Label";
    export let output = "";
    export let disabled = false;
    let name = label.toLocaleLowerCase().replace(/ /g, "_");
    let id = name + "_id";

    export let values = [];
</script>

<div class="select_group form-group ">
    <label for={id}>{label}:</label>

    <select {name} {id} bind:value={output} {disabled} class="form-control">
        {#each values as value}
            <option value={value.label.toLocaleLowerCase()}>
                {value.label}
            </option>
        {/each}
    </select>

</div>

<style>
    .select_group {
        display: flex;
        flex-direction: column;
    }
</style>
