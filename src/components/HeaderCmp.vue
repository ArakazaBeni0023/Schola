<script>
export default {
    data() {
        return {
            currentUser: null,
            currentUserNom: "",
            currentUserPrenom: "",
        };
    },

    methods: {
        logout() {
            if (!confirm("Voulez-vous vous déconnecter ?")) return;
            this.currentUser = null;
            localStorage.removeItem('schola.currentUser');
            window.location.reload()
        },
    },

    mounted() {
        const rememberedUser = localStorage.getItem('schola.currentUser')
        if (rememberedUser) {
            this.currentUser = JSON.parse(rememberedUser);
            this.currentUserNom = this.currentUser.nom;
            this.currentUserPrenom = this.currentUser.prenom;
        }
    },
}
</script>

<template>
    <header class="header-main-container">
        <div class="brand-container">
            <div class="brand">
                <div class="brand-logo"></div>
                <h1 class="header-title">
                    Schola
                </h1>
            </div>
            <button @click="logout()" class="logout-btn bi-box-arrow-right"></button>
        </div>
        <div class="user-block">
            <span class="user-infos">
                Bonjour, <br>
                <b>{{ currentUserNom }} {{ currentUserPrenom }}</b>
            </span>
        </div>
    </header>
</template>

<style scoped>
.header-main-container {
    gap: 2rem;
    padding-block-end: 1rem;
}

.header-main-container .brand-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-main-container .brand-container .brand {
    gap: 1rem;
}

.header-main-container .brand-container .brand .brand-logo {
    width: 60px;
    height: 60px;
    background: var(--hover-lw);
    border-radius: 50px;
    display: none;
}

.header-main-container .user-block {
    align-items: center;
}

.header-main-container .user-block .user-infos {
    font-size: 16px;
}

.header-main-container .brand-container .logout-btn {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    width: 40px;
    height: 40px;
    border-radius: 8px;
    text-align: center;
    transition: all .5s ease;
    display: none;
    justify-items: flex-end;
}

.header-main-container .brand-container .logout-btn:hover {
    background: var(--color-primary-dark);
}

@media (max-width:468px) {
    .header-main-container .brand-container .brand .brand-logo {
        display: block;
    }

    .header-main-container .brand-container .logout-btn {
        display: block;
    }
}
</style>