<script>
import NavBar from "./NavBar.vue";
export default {
    name: 'PlatformCmp',
    components: {
        NavBar,
    },
}
</script>

<template>
    <div class="platform-container-fluid">
        <div class="left-side">
            <NavBar />
        </div>
        <div class="main-container">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.platform-container-fluid {
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: 60px auto;
    height: 100vh;
    user-select: none;
}

/*--------------- left side */
.platform-container-fluid .left-side {
    justify-content: center;
    /* sizing */
    grid-column-start: 1;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: 3;
    /* --d--- */
    padding: 1rem .5rem;
    gap: .5rem;
    position: relative;
}

/*--------------- main container */
.platform-container-fluid .main-container {
    grid-column-start: 2;
    grid-column-end: 3;
    grid-row-start: 1;
    grid-row-end: 3;
    width: 100%;
}

@media (max-width :468px) {
    .platform-container-fluid {
        grid-template-columns: 0% 1fr;
        grid-template-rows: 60px 1fr;
        padding: 0;
    }

    .platform-container-fluid .left-side {
        grid-column-start: 3;
        grid-row-start: 3;
        grid-row-end: 4;
        padding: 1rem;
        background: unset;
        z-index: 110;
        border-top: 1px solid var(--color-muted);
    }

    .platform-container-fluid .main-container {
        overflow: auto;
    }
}
</style>