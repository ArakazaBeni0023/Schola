<script>
export default {
    name: 'UpcomingEvents',

    props: {
        isProfesseur: {
            type: Boolean,
            default: false
        },
        userEmail: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            events: [],
            today: new Date(),
        };
    },

    computed: {
        formattedDate() {
            return this.formatDate(this.today);
        },
        todayName() {
            return this.today.toLocaleDateString('fr-FR', { weekday: 'long' });
        },
        filteredEvents() {
            const now = new Date();
            const todayDay = this.todayName.toLowerCase();

            return this.events
                .filter(event => {
                    const eventDay = event.jour?.toLowerCase().trim();
                    return eventDay === todayDay;
                })
                .map(event => {
                    const start = this.parseTime(event.heureDebut);
                    const timeDiff = Math.floor((start - now) / 60000);

                    let status;
                    if (timeDiff > 60) {
                        const hours = Math.floor(timeDiff / 60);
                        const minutes = timeDiff % 60;
                        status = `${hours}h${minutes.toString().padStart(2, '0')}`;
                    } else if (timeDiff > 0) {
                        status = `${timeDiff} min`;
                    } else {
                        const end = this.parseTime(event.heureFin);
                        const timeDiffEnd = Math.floor((end - now) / 60000);
                        status = timeDiffEnd > 0 ? 'En cours' : 'Terminé';
                    }

                    return {
                        ...event,
                        timeUntil: status,
                        isCurrent: timeDiff <= 0 && this.parseTime(event.heureFin) > now
                    };
                })
                .sort((a, b) => {
                    const timeA = this.parseTime(a.heureDebut);
                    const timeB = this.parseTime(b.heureDebut);
                    return timeA - timeB;
                });
        }
    },

    methods: {
        formatDate(date) {
            const mois = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
            const jour = String(date.getDate()).padStart(2, '0');
            const moisTexte = mois[date.getMonth()];
            const annee = date.getFullYear();
            return `${jour} ${moisTexte} ${annee}`;
        },

        parseTime(timeStr) {
            if (!timeStr) return new Date();
            const [h, m] = timeStr.split(':').map(Number);
            const date = new Date(this.today);
            date.setHours(h, m || 0, 0, 0);
            return date;
        },

        loadEvents() {
            try {
                const horairesData = JSON.parse(localStorage.getItem('schola.horaires') || '[]');
                const users = JSON.parse(localStorage.getItem('schola.users') || '[]');
                const user = users.find(u => u.email === this.userEmail);

                if (!user) {
                    console.warn('Utilisateur non trouvé:', this.userEmail);
                    return;
                }

                let filtered = [];

                horairesData.forEach(faculte => {
                    if (!faculte.horaires) return;

                    faculte.horaires.forEach(horaire => {
                        if (!horaire.cours) return;

                        horaire.cours.forEach(cours => {
                            if (user.role === 'etudiant') {
                                if (faculte.nomFaculte === user.faculte && cours.anneeEtude === user.annee) {
                                    filtered.push({
                                        ...cours,
                                        jour: horaire.jour,
                                        faculte: faculte.nomFaculte
                                    });
                                }
                            } else if (user.role === 'professeur') {
                                const fullName = `${user.prenom} ${user.nom}`;

                                if (cours.enseignant?.trim() === fullName) {
                                    filtered.push({
                                        ...cours,
                                        jour: horaire.jour,
                                        faculte: faculte.nomFaculte
                                    });
                                }
                            }
                        });
                    });
                });

                this.events = filtered;

            } catch (error) {
                console.error('Erreur lors du chargement des événements:', error);
                this.events = [];
            }
        }
    },

    mounted() {
        this.loadEvents();
    },

    watch: {
        userEmail() {
            this.loadEvents();
        },
        isProfesseur() {
            this.loadEvents();
        }
    }
};
</script>

<template>
    <div class="schedule">
        <h3 class="title">Cours du {{ formattedDate }} ({{ todayName }})</h3>
        <div class="schedule-header">
            <hr />
        </div>

        <div class="schedule-body">
            <div v-if="filteredEvents.length === 0" class="no-events">
                <p>Aucun cours prévu aujourd'hui.</p>
            </div>

            <div v-else v-for="(event, index) in filteredEvents" :key="index" class="event"
                :class="{ 'current-event': event.isCurrent }">
                <div class="time">
                    <h5>{{ event.heureDebut }}</h5>
                    <small>{{ event.heureFin }}</small>
                </div>
                <div class="separator" :class="{ 'current': event.isCurrent }"></div>
                <div class="desc">
                    <h5>{{ event.nomCours }}</h5>
                    <p>
                        <span class="info-item">
                            <i class="bi-geo-alt"></i> {{ event.salle }}
                        </span>
                        <span v-if="!isProfesseur" class="info-item">
                            <i class="bi-person"></i> {{ event.enseignant }}
                        </span>
                        <span v-if="isProfesseur" class="info-item">
                            <i class="bi-mortarboard"></i> {{ event.anneeEtude }}ère année
                        </span>
                    </p>
                </div>
                <div class="interval" :class="{ 'current': event.isCurrent }">
                    <h5>{{ event.timeUntil }}</h5>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.schedule {
    gap: 1rem;
}

.schedule-header h4 {
    text-align: center;
    color: var(--color-muted);
    padding-block: .5rem;
}

.schedule-header hr {
    background: var(--color-primary);
    width: 180px;
    height: 2px;
    border: none;
}

.schedule-body {
    gap: .5rem;
}

.schedule-body .event {
    height: 65px;
    gap: .5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: var(--color-background);
    border: 1px solid #e9ecef;
}

.event.current-event {
    background: var(--hover-lw);
    border: 1px solid var(--color-primary);
}

.separator {
    border-radius: 50px;
    width: 8px;
    height: 50%;
    background: var(--color-muted);
}

.separator.current {
    background: var(--color-primary);
}

.schedule-body .event .desc {
    width: 100%;
    flex: 1;
}

.schedule-body .event .desc h5 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: var(--color-primary);
}

.schedule-body .event .desc p {
    font-size: 10px;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #6c757d;
}

.info-item i {
    font-size: 0.8rem;
}

.schedule-body .event .time {
    min-width: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.schedule-body .event .time h5 {
    font-size: 12px;
    color: var(--color-muted);
    margin: 0;
    font-weight: 600;
}

.schedule-body .event .time small {
    font-size: 9px;
    color: #adb5bd;
}

.schedule-body .event .interval {
    min-width: 50px;
    text-align: end;
}

.schedule-body .event .interval h5 {
    font-size: 11px;
    margin: 0;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    background: #e9ecef;
    color: var(--color-muted);
}

.schedule-body .event .interval.current h5 {
    background: var(--color-primary);
    color: var(--color-text-light);
}

.no-events {
    text-align: center;
    padding: 1rem;
    color: #6c757d;
}

.no-events p {
    margin: 0;
    font-size: 0.9rem;
}

@media (max-width:768px) {
    .schedule {
        gap: 2rem;
        padding: 1rem;
        border-radius: 15px;
        border: 1px solid var(--hover-lw);
    }
}
</style>