<script>
import PlatformCmp from '@/components/PlatformCmp.vue';
import NewNotif from "@/components/NewNotif.vue"
export default {
    name: 'NotificationsView',
    components: {
        PlatformCmp,
        NewNotif
    },

    data() {
        return {
            notifications: [],
            focusNotif: false,
            notifContenue: '',
            notifTitre: '',
            notifDate: '',
            notifLien: '',
            term: '',
            userRole: '',
            isNotif: false
        }
    },

    created() {
        const stored = localStorage.getItem('schola.notifications');
        if (stored) {
            this.notifications = JSON.parse(stored);
        } else {
            this.notifications = [];
            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));
        }

        const currentUser = localStorage.getItem('schola.currentUser');
        if (currentUser) {
            try {
                this.userRole = JSON.parse(currentUser).role;
            } catch (e) {
                console.warn('Erreur lors du parsing de schola.currentUser', e);
                this.$router.push('/')
            }
        } else {
            this.$router.push('/')
        }
    },

    computed: {
        filteredNotifications() {
            const term = this.term.trim().toLowerCase();
            return this.notifications.filter(n =>
                n.titre.toLowerCase().includes(term) ||
                n.contenue.toLowerCase().includes(term)
            );
        },

        sortedNotifications() {
            return [...this.notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        filteredByRole() {
            const role = this.userRole.toLowerCase();
            return this.sortedNotifications.filter(n =>
                n.cible.map(c => c.toLowerCase()).includes(role) ||
                n.cible.map(c => c.toLowerCase()).includes('tous')
            );
        }
    },

    methods: {
        isAdmin() {
            return this.userRole.toLowerCase() === 'admin';
        },

        viewNotif(index) {
            const notif = this.notifications[index];
            const currentUser = JSON.parse(localStorage.getItem('schola.currentUser'));
            const userId = currentUser.id;

            this.notifTitre = notif.titre;
            this.notifContenue = notif.contenue;
            this.notifDate = notif.date;
            this.notifLien = notif.lien;
            this.focusNotif = true;

            this.notifications[index].lu = true;

            if (!notif.lusPar) notif.lusPar = [];
            if (!notif.lusPar.includes(userId)) {
                notif.lusPar.push(userId);
            }

            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));
        },
        timeSince(date) {
            const now = new Date();
            const past = new Date(date);
            const seconds = Math.floor((now - past) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return this.formatJour(days);
            if (hours > 0) return this.formaHeure(hours);
            if (minutes > 0) return `${minutes} min.`;
            return `${seconds} sec.`;
        },
        formatJour(e) {
            if (!e) return '-';
            return `${e}${e === 1 ? ' jour' : ' jours'}`;
        },
        formaHeure(e) {
            if (!e) return '-';
            return `${e}${e === 1 ? ' heure' : ' heures'}`;
        },
        deleteNotif(index) {
            if (this.userRole !== 'admin') return;
            if (!confirm("Voulez-vous supprimer la notification?")) return;
            this.notifications.splice(index, 1);
            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));
        },
        getTypeClass(type) {
            switch (type) {
                case 'urgence': return 'bg-danger';
                case 'pédagogique': return 'bg-primary';
                case 'administratif': return 'bg-secondary';
                default: return 'bg-light';
            }
        },
        getNotificationsByRole() {
            return this.sortedNotifications.filter(n =>
                n.cible.includes(this.userRole) || n.cible.includes('tous')
            );
        },
        showNotifMaker() {
            this.isNotif = !this.isNotif;
        },
        addNotification(notif) {
            notif.lusPar = [];
            this.notifications.unshift(notif);
            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));
        }
    }
}
</script>

<template>
    <PlatformCmp>
        <div class="container-fluid">
            <div class="search-block">
                <i class="bi-search"></i>
                <input type="text" v-model.trim="term" placeholder="Rechercher dans les notifications...">
                <i class="bi-filter"></i>
            </div>

            <div v-if="focusNotif" class="notifications-container">
                <div class="notif-viewer">
                    <div class="notif-viewer-header">
                        <button class="return-btn bi-arrow-left-short" @click="focusNotif = false"></button>
                    </div>
                    <div class="notif-viewer-content">
                        <div class="content-header">
                            <h3 class="notif-titre">{{ notifTitre }}</h3>
                            <small class="">
                                <i class="bi-calendar"></i>
                                {{ new Date(notifDate).toLocaleDateString()
                                }}
                            </small>
                        </div>

                        <div class="content-body">
                            {{ notifContenue }}
                        </div>

                        <div class="content-footer">
                            <a v-if="notifLien" :href="notifLien" target="_blank" class="btn-outline-info">
                                <i class="bi-link-45deg"></i>
                                Voir le document</a>
                            <small class="timeSince">Publié il y a {{ timeSince(notifDate) }}</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="notifications-container" v-else>
                <div class="notifications-container-header">
                    <h2>Annonces</h2>
                </div>
                <div class="notif-item" v-for="(n, index) in filteredNotifications" :key="index"
                    @click="viewNotif(index)" :class="{ 'readed': n.lu, }">
                    <span :class="`badge ${getTypeClass(n.type)}`"></span>
                    <div class="infos">
                        <div class="main-infos">
                            <h6 v-if="n.lu">{{ n.titre }}</h6>
                            <h5 v-else>{{ n.titre }}</h5>
                            <p>{{ n.contenue }}</p>
                        </div>
                        <small class="time-since">{{ timeSince(n.date) }}</small>
                    </div>
                    <button v-if="userRole === 'admin'" class="delete-btn bi-trash"
                        @click.stop="deleteNotif(index)"></button>
                </div>
                <p class="muted-text" v-if="filteredNotifications.length === 0">
                    <i class="bi-box-open"></i> Aucune annonce pour l’instant.
                </p>
            </div>
        </div>
    </PlatformCmp>
    <button class="add-btn new-notif-btn" v-if="isNotif === false && userRole === 'admin'" @click="showNotifMaker()">
        <i class="bi-pencil"></i>
        Nouvelle annonce
    </button>
    <NewNotif v-show="isNotif" class="new-notif" @close="showNotifMaker" @add="addNotification" />
</template>

<style scoped>
.container-fluid {
    padding-block: 1rem;
    height: 100vh;
    overflow: auto;
    position: relative;
}

.notifications-container-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
}

.search-block {
    width: 60%;
    display: flex;
    align-items: center;
    gap: .5rem;
    margin-bottom: 1rem;
    background: var(--hover-lw);
    border: 2px solid var(--color-primary);
    border-radius: 5px;
    padding: .8rem;
    margin: auto;
    margin-bottom: 1rem;
}


.search-block input {
    all: unset;
    flex-grow: 1;

    font-size: 12px;
}

.notifications-container {
    width: 60%;
    display: flex;
    flex-direction: column;
    /* gap: .5rem; */
    margin-top: 2rem;
    margin: auto;
    background: var(--color-surface);
    padding: 2rem 1rem;
    border-radius: 5px;
}

.notifications-container .notif-item {
    background: var(--color-surface);
    /* color: var(--color-dark); */
    border-bottom: 1px solid var(--hover-lw);
    cursor: pointer;
    transition: all ease .5s;
    position: relative;
    display: flex;
    align-items: center;
    height: 60px;
    padding-inline-end: 1rem;
    transition: all .5s ease;
}

.muted-text {
    color: var(--color-muted);
}

.notifications-container .notif-item:hover:not(.readed) {
    background: var(--color-background);
}

.notifications-container .notif-item .badge {
    width: 4px;
    height: 30px;
    align-self: flex-end;
}

.notifications-container .notif-item .infos {
    flex-grow: 1;
    height: 100%;
    display: flex;
    align-items: center;
    padding-inline: 0.8rem;
}

.notifications-container .notif-item:hover .delete-btn {
    display: block;
    transition: all .5s ease;
}

.notifications-container .notif-item .delete-btn {
    all: unset;
    display: none;
    color: var(--color-danger);
    padding: 4px 8px;
    border-radius: 5px;
}

.notifications-container .notif-item .delete-btn:hover {
    background: var(--color-danger-bg);
}

.notifications-container .notif-item .infos p {
    font-size: 12px;
    /* color: var(--color-muted); */
}

.notifications-container .notif-item .infos .time-since {
    align-self: flex-end;
    font-size: 12px;
}

.notifications-container .readed {
    font-weight: lighter;
    background: var(--color-background);
}

.notifications-container .readed p {
    font-weight: lighter;
}

.notifications-container .notif-item .infos .main-infos {
    flex-grow: 1;
    font-weight: bold;
}

.notifications-container .notif-item .infos .main-infos p {
    font-weight: lighter;
}

/* ------------------------------- viewer */

.notif-viewer {
    display: flex;
    flex-direction: column;
}

.notif-viewer-header {
    display: flex;
    justify-content: space-between;
}

.return-btn {
    all: unset;
    background: var(--hover-lw);
    color: var(--color-text);
    width: 40px;
    height: 40px;
    border-radius: 50px;
    text-align: center;
    cursor: pointer;
    transition: all .5s ease;
}

.return-btn:hover {
    background: var(--color-accent);
}

.notif-viewer-content {
    padding-block: 1rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.notif-viewer-content .content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notif-viewer-content .content-body {
    font-size: 12px;
}

.content-footer {
    border-top: 1px solid var(--hover-lw);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block-start: .5rem;
}

.content-footer .btn-outline-info {
    background: var(--hover-lw);
    border: 1px solid var(--color-primary);
    padding: .6em 1rem;
    border-radius: 50px;
    font-size: 12px;
    transition: all .5s ease;
    cursor: pointer;
}

.content-footer .btn-outline-info:hover {
    background: var(--color-accent);
}

.timeSince {
    color: var(--color-muted);
    font-size: 12px;
}

/* new-notif */
.new-notif-btn,
.new-notif {
    position: absolute;
    bottom: 3%;
    right: 3%;
    z-index: 1000;
    box-shadow: var(--shadow);
}

.new-notif-btn {
    /* background-color: var(--color-surface); */
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    border-radius: 50px;
    padding: .8rem 1rem;
    border: none;
}

.new-notif-btn:hover {
    background-color: var(--color-primary);
}

@media (max-width:768px) {
    .container-fluid {
        padding-inline-end: .5rem;
    }

    .search-block {
        width: 100%;
    }

    .notifications-container {
        width: 100%;
    }

    .new-notif {
        width: 100%;
        height: 100%;
        top: 0%;
        right: 0%;
        border-radius: 0px;
        border: none;
    }
}

@media (max-width:468px) {
    .container-fluid {
        padding-inline: 1rem;
    }

    .new-notif-btn {
        bottom: 15%;
    }
}
</style>

<!--

admin niwe yemerewe kwandika gusa amatangazo 'Annonces' no kuyafuta
mugihe umuntu yi konegse, app ica iraba ama annonce mashasha id yayo igaca yiyongera muri 
table yama annonce [] y'umwumwe wese kugira nogufuta umuntu afute ibibitse muri notif yiwe,
bituma kijanye no kumenya niba itangazo wararisomye, biba kuma tangazo yumwumwe wese.
mukwafisha ama annonce batora muri table yiwe bwite.

(umuntu yogira kuburyo admin abona igitigiri cabamaze kuyisoma) 

c'est seulement l'admin qui est autorisé à ecrire les annoces et de supprimer
l'utilisateur qui est connecté, l'app prend l'id les nouvelles annonces et les ajout dans la table "annonces" de l'utilisateur connecté
pour que l'utilisateur puisse supprimer les annonces qui contient dans sa table des annonces
savoir si l'annonce a été lu, ça se passe sur chaque utilisateur individuellement.

dit moi comment je pourrais faire pour que l'admin puisse savoir le nombre des utilisateur qui ont lu l'annonce
-->