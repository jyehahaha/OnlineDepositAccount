<script>
    export let label = "Label";
    export let output = "";
    export let disabled = false;
    let name = label.toLocaleLowerCase().replace(/ /g, "_");
    let id = name + "_id";
</script>

<div class="date_group form-group">
    <label for={id}>{label}:</label>
    <input
        type="date"
        {id}
        {name}
        bind:value={output}
        {disabled}
        class="form-control"
    />
</div>

<style>
    .date_group {
        display: flex;
        flex-direction: column;
    }
</style>
