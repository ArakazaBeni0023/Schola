<script>
import LogoutModal from './LogoutModal.vue';
export default {
    components: { LogoutModal },
    data() {
        return {
            currentUser: null,
            currentUserNom: "",
            currentUserPrenom: "",
            showLogout: false
        };
    },

    methods: {
        logout() {
            this.currentUser = null;
            localStorage.removeItem('schola.currentUser');
            window.location.reload()
            this.$router.push("/");
        },
        clsModal() {
            this.showLogout = false;
        }
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
            <button @click="showLogout = true" class="logout-btn bi-box-arrow-right"></button>
            <!-- <button class="bi-calendar"></button> -->
        </div>
        <div class="user-block">
            <span class="user-infos">
                Bonjour, <br>
                <b>{{ currentUserNom }} {{ currentUserPrenom }}</b>
            </span>
        </div>
    </header>
    <LogoutModal v-show="showLogout" @clsModal="clsModal" @logout="logout" />
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
    border: 1px solid var(--color-primary);
}

.header-main-container .user-block {
    align-items: center;
}

.header-main-container .brand-container .bi-calendar {
    all: unset;
    background-color: var(--color-primary);
    color: var(--color-text-light);
    width: 40px;
    height: 40px;
    text-align: center;
    border-radius: 8px;
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