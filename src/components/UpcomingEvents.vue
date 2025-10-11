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
            const now = this.today;
            return this.events
                .filter(event => event.jour && event.jour.toLowerCase() === this.todayName.toLowerCase())
                .map(event => {
                    const start = this.parseTime(event.heureDebut);
                    const timeDiff = Math.floor((start - now) / 60000);
                    return {
                        ...event,
                        timeUntil: timeDiff > 0 ? `${timeDiff} min` : 'En cours',
                    };
                });
        }
    },
    methods: {
        formatDate(date) {
            const mois = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
            const jour = String(date.getDate()).padStart(2, '0');
            const moisTexte = mois[date.getMonth()];
            return `${jour} ${moisTexte}`;
        },
        parseTime(timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            const date = new Date(this.today);
            date.setHours(h, m, 0, 0);
            return date;
        },
        loadEvents() {
            const horairesData = JSON.parse(localStorage.getItem('schola.horaires')) || [];
            const users = JSON.parse(localStorage.getItem('schola.users')) || [];
            const user = users.find(u => u.email === this.userEmail);

            if (!user) return;

            let filtered = [];

            horairesData.forEach(faculte => {
                faculte.horaires
                    .filter(h => h.jour.toLowerCase() === this.todayName.toLowerCase())
                    .forEach(horaire => {
                        horaire.cours.forEach(cours => {
                            if (user.role === 'etudiant') {
                                if (faculte.nomFaculte === user.faculte && cours.anneeEtude === user.annee) {
                                    filtered.push({
                                        ...cours,
                                        jour: horaire.jour
                                    });
                                }
                            } else if (user.role === 'professeur') {
                                const fullName = `${user.prenom} ${user.nom}`;
                                if (cours.enseignant === fullName) {
                                    filtered.push({
                                        ...cours,
                                        jour: horaire.jour
                                    });
                                }
                            }
                        });
                    });
            });

            this.events = filtered;
        }
    },
    mounted() {
        this.loadEvents();
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
                <p>Aucun cours prévu aujourd’hui.</p>
            </div>

            <div v-else v-for="(event, index) in filteredEvents" :key="index" class="event">
                <div class="time">
                    <h5>{{ event.heureDebut }}</h5>
                </div>
                <span class="separator"></span>
                <div class="desc">
                    <h5>{{ event.nomCours }}</h5>
                    <p>Salle: {{ event.salle }}</p>
                    <p v-if="!isProfesseur">Prof: {{ event.enseignant }}</p>
                </div>
                <div class="interval">
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
    color: var(--color-secondary);
    padding-block: .5rem;
}

.schedule-header hr {
    background: var(--color-primary);
    width: 180px;
}

.schedule-body {
    gap: .2rem;
}

.schedule-body .event {
    height: 65px;
    gap: .5rem;
}

.saparator {
    border-radius: 50px;
    width: 8px;
    height: 50%;
    background: var(--color-primary-dark);
}

.schedule-body .event .desc {
    width: 100%;
}

.schedule-body .event .desc p {
    font-size: 10px;
}

.schedule-body .event .time,
.schedule-body .event .interval {
    font-size: 12px;
    color: var(--color-muted);
}

.schedule-body .event .time {
    min-width: 45px;
}

.schedule-body .event .interval {
    min-width: 20px;
    text-align: end;
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