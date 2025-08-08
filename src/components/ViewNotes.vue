<script>
export default {
    props: ["index", "titre", "content"],
    methods: {
        close() {
            this.$emit("close");
        },
    }
}
</script>

<template>
    <div class="container">
        <div class="cont-head">
            <h5>Voir</h5>
            <button class="bi bi-x" @click="close"></button>
        </div>
        <div class="notebook">
            <div class="title">
                <p>{{ titre }}</p>
            </div>
            <p class="paper">{{ content }}</p>
        </div>
    </div>
</template>

<style scoped>
.container {
    gap: .5rem;
}

.notebook .title p {
    padding: 0.5rem 1rem;
}

.notebook .title p,
.notebook .paper {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.paper {
    min-height: 150px;
    animation: fadeDown .5s;
    padding: 0.5rem 1rem;
    transition: background .5s ease;
}

.notebook .title input:hover,
.notebook .paper:hover {
    background: none;
}
</style>