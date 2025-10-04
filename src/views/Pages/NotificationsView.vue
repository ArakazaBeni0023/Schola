<script>
import PlatformCmp from '@/components/PlatformCmp.vue';
import NewNotif from "@/components/NewNotif.vue";

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
            userId: '',
            isNotif: false,
            users: []
        }
    },

    created() {
        const stored = localStorage.getItem('schola.notifications');
        this.notifications = stored ? JSON.parse(stored) : [];
        localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));

        const currentUserRaw = localStorage.getItem('schola.currentUser');
        const allUsersRaw = localStorage.getItem('schola.users');

        if (currentUserRaw && allUsersRaw) {
            try {
                const currentUser = JSON.parse(currentUserRaw);
                this.userRole = currentUser.role;
                this.userId = currentUser.id;
                this.users = JSON.parse(allUsersRaw);

                const userIndex = this.users.findIndex(u => u.id === this.userId);
                if (userIndex !== -1) {
                    const user = this.users[userIndex];
                    if (!user.annonces) {
                        const targetedNotifIds = this.notifications
                            .filter(n => n.cible.includes(user.role) || n.cible.includes('tous'))
                            .map(n => n.id);
                        this.users[userIndex].annonces = targetedNotifIds;
                        localStorage.setItem('schola.users', JSON.stringify(this.users));
                    }
                }
            } catch (e) {
                console.warn('Erreur lors du parsing de schola.currentUser ou schola.users', e);
                this.$router.push('/');
            }
        } else {
            this.$router.push('/');
        }
    },

    computed: {
        userNotifications() {
            const user = this.users.find(u => u.id === this.userId);
            if (!user || !user.annonces) return [];
            return this.sortedNotifications.filter(n => user.annonces.includes(n.id));
        },

        filteredNotifications() {
            const term = this.term.trim().toLowerCase();
            return this.userNotifications.filter(n =>
                n.titre.toLowerCase().includes(term) ||
                n.contenue.toLowerCase().includes(term)
            );
        },

        sortedNotifications() {
            return [...this.notifications].sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },

    methods: {
        isAdmin() {
            return this.userRole.toLowerCase() === 'admin';
        },

        viewNotif(index) {
            const notif = this.filteredNotifications[index];
            const notifIndex = this.notifications.findIndex(n => n.id === notif.id);
            const currentUser = JSON.parse(localStorage.getItem('schola.currentUser'));
            const userId = currentUser.id;

            this.notifTitre = notif.titre;
            this.notifContenue = notif.contenue;
            this.notifDate = notif.date;
            this.focusNotif = true;

            this.notifications[notifIndex].lu = true;

            if (!this.notifications[notifIndex].lusPar) this.notifications[notifIndex].lusPar = [];
            if (!this.notifications[notifIndex].lusPar.includes(userId)) {
                this.notifications[notifIndex].lusPar.push(userId);
            }

            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));

            this.notifFichiers = notif.fichiers || [];
        },

        deleteNotif(index) {
            const notifId = this.filteredNotifications[index].id;
            const userIndex = this.users.findIndex(u => u.id === this.userId);
            if (userIndex === -1) return;

            if (this.isAdmin()) {
                this.notifications = this.notifications.filter(n => n.id !== notifId);
                localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));
            } else {
                this.users[userIndex].annonces = this.users[userIndex].annonces.filter(id => id !== notifId);
                localStorage.setItem('schola.users', JSON.stringify(this.users));
            }
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
            return `${e} ${e === 1 ? ' jour' : ' jours'}`;
        },

        formaHeure(e) {
            if (!e) return '-';
            return `${e}  ${e === 1 ? ' heure' : ' heures'}`;
        },

        getTypeClass(type) {
            switch (type) {
                case 'urgence': return 'bg-danger';
                case 'pédagogique': return 'bg-primary';
                case 'administratif': return 'bg-secondary';
                default: return 'bg-light';
            }
        },

        showNotifMaker() {
            this.isNotif = !this.isNotif;
        },

        addNotification(notif) {
            notif.id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            notif.lusPar = [];
            this.notifications.unshift(notif);
            localStorage.setItem('schola.notifications', JSON.stringify(this.notifications));

            this.users.forEach(user => {
                if (notif.cible.includes(user.role) || notif.cible.includes('tous')) {
                    if (!user.annonces) user.annonces = [];
                    user.annonces.push(notif.id);
                }
            });
            localStorage.setItem('schola.users', JSON.stringify(this.users));
        },
        downloadFile(file) {
            const link = document.createElement('a');
            link.href = file.base64;
            link.download = file.name;
            link.click();
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
                            <div v-if="notifFichiers.length" class="attached-docs">
                                <div class="file" v-for="(file, index) in notifFichiers" :key="index">
                                    <div @click="downloadFile(file)">
                                        <i class="bi-download"></i> {{ file.name }}
                                    </div>
                                </div>
                            </div>
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
                        <small v-if="isAdmin() && n.lusPar" class="notif-read-count">
                            {{ n.lusPar.length }} <i class="bi-eye"> vues</i>
                        </small>

                    </div>
                    <button class="delete-btn bi-trash" @click.stop="deleteNotif(index)"></button>
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
    padding-block-start: .5rem;
    gap: 1rem;
}

/* attach file */
.attached-docs {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: .5rem;
}

.attached-docs .file {
    background: var(--hover-lw);
    border: 1px solid var(--color-primary);
    padding: .6em 1rem;
    border-radius: 50px;
    font-size: 12px;
    transition: all .5s ease;
    cursor: pointer;
}

.attached-docs .file .bi-x {
    margin-left: .5rem;
    cursor: pointer;
}

.attached-docs.file .bi-x:hover {
    transform: scale(1.1);
}

.attached-docs .file:hover {
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


/* preview */
.preview-img {
    max-width: 100%;
    height: auto;
    margin-bottom: 10px;
}

.file-preview {
    margin-bottom: 20px;
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
