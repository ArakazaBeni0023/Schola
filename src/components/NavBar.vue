<script>
import { useRouter } from 'vue-router';
export default {
    setup() {
        const router = useRouter();
        var currentPath = router.currentRoute.value.path
        return { currentPath }
    },

    name: 'NavBar',
    data() {
        return {
            links: [
                {
                    link: '/',
                    icon: 'bi-grid',
                    iconFill: 'bi-grid-fill',
                    title: 'Accueil'
                },
                /*{
                    link: '/etudiant',
                    icon: 'bi-mortarboard',
                    iconFill: 'bi-chat-square-text-fill',
                    title: 'Étudiant'
                },
                {
                    link: '/professeur',
                    icon: 'bi-people',
                    iconFill: 'bi-people-fill',
                    title: 'Students'
                },*/
                {
                    link: '/notifications',
                    icon: 'bi-bell',
                    iconFill: 'bi-bell-fill',
                    title: 'Annonces'
                },
                /* {
                    link: '/settings',
                    icon: 'bi-gear',
                    iconFill: 'bi-gear-fill',
                    title: 'Paramètres'
                }, */
            ],
            currentUser: null
        }
    },

    methods: {
        logout() {
            if (!confirm("Voulez-vous vous déconnecter ?")) return;
            this.currentUser = null;
            localStorage.removeItem('schola.currentUser');
            window.location.reload()
            this.$router.push("/");
        },
    },

    mounted() {
        const rememberedUser = localStorage.getItem('rememberedUser')
        if (rememberedUser) {
            this.currentUser = JSON.parse(rememberedUser)
        }
    },
}
</script>

<template>
    <div class="links">
        <div class="brand-logo">
            <img src="" alt="">
        </div>

        <div class="router-links">
            <router-link class="link" v-for="link in links" :key="link.link" :to="link.link" :data-title="link.title">
                <i class="bi" :class="[currentPath === link.link ? link.iconFill : link.icon]"></i>
            </router-link>
        </div>
        <button class="logout-btn bi-box-arrow-right" @click="logout()"></button>
    </div>
</template>

<style scoped>
.links {
    background: var(--color-primary-dark);
    /* height: 50%; */
    width: 90%;
    gap: .5rem;
    border-radius: 50px;
    padding-block: 1.5rem;
    padding-inline: .5rem;
    justify-content: space-between;
    /* border: 1px solid #000; */
}

.links .brand-logo {
    background: var(--hover-lw);
    width: 40px;
    height: 40px;
    border-radius: 50px;
    margin-top: -.8rem;
    display: block;
}

.links .router-links {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.links .router-links .link,
.logout-btn {
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    transition: background .5s ease;
    position: relative;
    animation: fadeUp .5s;
    color: var(--color-text-light);
}

.links .router-links .link.router-link-exact-active {
    background: var(--color-secondary);
}

.links .router-links .link.router-link-exact-active p,
.links .router-links .link.router-link-exact-active .bi {
    color: var(--color-text-light);
}

.links .router-links .link .bi,
.logout-btn .bi {
    padding-inline: .5rem;
}

.links .router-links .link p {
    font-size: 14px;
    /* display: none; */
}

.links .router-links .link::after {
    content: attr(data-title);
    position: absolute;
    right: -78px;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
    background-color: var(--color-primary);
    color: var(--color-accent);
    padding: .5rem .3rem;
    border-radius: 4px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    font-size: 12px;
    z-index: 10;
    width: 70px;
    text-align: center;
}

.links .router-links .link:hover::after {
    opacity: 1;
    visibility: visible;
}

.links .router-links .link::before {
    content: "";
    position: absolute;
    right: -8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-accent);
    border-width: 6px;
    border-style: solid;
    border-color: transparent var(--color-primary) transparent transparent;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
}

.links .router-links .link:hover::before {
    opacity: 1;
    visibility: visible;
}

.logout-btn:hover,
.links .router-links .link:hover:not(.router-link-exact-active) {
    background: var(--color-primary);
    color: var(--color-accent);
}

.logout-btn {
    border: none;
    background: none;
}

@media (max-width :768px) {
    .links .router-links .link {
        justify-content: center;
    }

    .links .router-links .link p {
        display: none;
    }

    .links .router-links .link::after {
        right: -78px;
        top: 50%;
    }

    .links .router-links .link:hover::after {
        opacity: 1;
        visibility: visible;
    }

    .links .router-links .link::before {
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
    }

    .links .router-links .link:hover::before {
        opacity: 1;
        visibility: visible;
    }
}

@media (max-width :480px) {
    .links {
        width: 100%;
        height: 100%;
        justify-content: space-between;
        flex-direction: unset;
        padding-block: .8rem;
        padding-inline: 1.5rem;
    }

    .links .brand-logo {
        display: none;
    }

    .links .router-links {
        flex-direction: initial;
        width: 100%;
        justify-content: space-between;
        padding: 0;
    }

    .links .router-links .link {
        width: 40px;
    }

    .links .router-links .link::after {
        right: -15px;
        top: -65%;
    }

    .links .router-links .link::before {
        right: 15px;
        top: -23%;
        transform: rotate(-90deg);
    }

    .logout-btn {
        display: none;
    }
}
</style>