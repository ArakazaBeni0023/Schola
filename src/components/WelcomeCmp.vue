<script>
export default {
    name: 'WelcomeCmp',
};
</script>


<template>
    <div class="welcome-screen">
        <div class="brand-photo">
            <i class="bi-building"></i>
        </div>
        <h1></h1>
        <button class="start-btn" @click="$emit('start')"> <i class="bi-arrow-right-short"></i></button>
    </div>
</template>

<style scoped>
.welcome-screen {
    width: 100%;
    height: 100vh;
    gap: 1rem;
    transition: all .5s ease;
}

.welcome-screen .brand-photo {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: var(--hover-lw);
}


.welcome-screen .brand-photo i {
    font-size: 64px;
    color: var(--color-primary);
}

/* .welcome-screen .brand-photo img {
    width: 100%;
    object-fit: cover;
    object-position: center
}
*/

.welcome-screen .brand-name {
    width: 17%;
}

.start-btn {
    /* width: 80%; */
    padding: 1rem;
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    cursor: pointer;
}

.start-btn:hover {
    background: var(--color-primary-dark);
}

@media (max-width :768px) {
    .welcome-screen .brand-name {
        width: 27%;
    }
}

@media (max-width :468px) {
    .welcome-screen .brand-name {
        width: 37%;
    }
}
</style>