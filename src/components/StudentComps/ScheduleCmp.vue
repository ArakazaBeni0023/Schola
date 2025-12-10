<script>
export default {
    name: 'ScheduleComp',
    data() {
        return {
            currentUser: null,
            horairesData: [],
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
            creneauxHoraires: [],
            loading: false,
            error: null,
            isMobileView: false,
            selectedDay: 'Lun'
        };
    },
    mounted() {
        this.checkViewport();
        window.addEventListener('resize', this.checkViewport);
        this.loadDataFromLocalStorage();
        this.generateTimeSlots();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.checkViewport);
    },
    methods: {
        checkViewport() {
            this.isMobileView = window.innerWidth < 768;
        },

        loadDataFromLocalStorage() {
            try {
                const currentUserStr = localStorage.getItem('schola.currentUser');

                if (currentUserStr) {
                    this.currentUser = JSON.parse(currentUserStr);

                    const usersStr = localStorage.getItem('schola.users');
                    if (usersStr) {
                        const users = JSON.parse(usersStr);

                        const userDetails = users.find(u => u.id === this.currentUser.id);

                        if (userDetails) {
                            this.currentUser = {
                                ...this.currentUser,
                                ...userDetails
                            };
                        }
                    }
                } else {
                    this.error = "Aucun utilisateur connecté";
                    return;
                }

                const horairesStr = localStorage.getItem('schola.horaires');

                if (horairesStr) {
                    this.horairesData = JSON.parse(horairesStr);
                } else {
                    this.error = "Aucun horaire trouvé pour l'instant!";
                }

            } catch (error) {
                this.error = "Erreur lors du chargement des données: " + error.message;
            }
        },

        generateTimeSlots() {
            // Heures de début et fin de la journée
            const debutJournee = 8;  // 8h00
            const finJournee = 18;   // 18h00
            //const dureeCreneau = 60; 1 heure par créneau

            const creneaux = [];

            // Générer des créneaux de 8h à 18h
            for (let heure = debutJournee; heure < finJournee; heure++) {
                const heureFormattee = heure.toString().padStart(2, '0') + ':00';
                creneaux.push(heureFormattee);
            }

            this.creneauxHoraires = creneaux;
        },

        getHoraireForStudent() {
            if (!this.horairesData || this.horairesData.length === 0 || !this.currentUser) {
                return [];
            }

            const faculteEtudiant = this.horairesData.find(
                faculte => {
                    const match = faculte.nomFaculte === this.currentUser.faculte;
                    return match;
                }
            );

            if (!faculteEtudiant) {
                console.warn(`Aucun horaire trouvé pour la faculté: ${this.currentUser.faculte}`);
                return [];
            }

            const horairesFiltres = [];

            if (faculteEtudiant.horaires && Array.isArray(faculteEtudiant.horaires)) {
                faculteEtudiant.horaires.forEach(journee => {
                    if (this.jours.includes(journee.jour)) {
                        const coursFiltres = journee.cours ? journee.cours.filter(cours => {
                            const matchAnnee = cours.anneeEtude === this.currentUser.annee;
                            console.log(`Cours ${cours.nomCours}: année ${cours.anneeEtude} vs étudiant ${this.currentUser.annee}`);
                            return matchAnnee;
                        }) : [];

                        if (coursFiltres.length > 0) {
                            horairesFiltres.push({
                                jour: journee.jour,
                                cours: coursFiltres
                            });
                        }
                    }
                });
            }

            return horairesFiltres;
        },

        getCoursForSlot(jour, heureDebut) {
            if (!this.currentUser) {
                return null;
            }

            const horairesEtudiant = this.getHoraireForStudent();

            const journee = horairesEtudiant.find(j => j.jour === jour);
            if (!journee) {
                return null;
            }

            const cours = journee.cours.find(c => c.heureDebut === heureDebut);
            return cours || null;
        },

        getAllCoursForSlot(jour, heureDebut) {
            if (!this.currentUser) return [];

            const horairesEtudiant = this.getHoraireForStudent();
            const journee = horairesEtudiant.find(j => j.jour === jour);
            if (!journee) return [];

            return journee.cours.filter(c => c.heureDebut === heureDebut);
        },

        getCoursForDay(jour) {
            if (!this.currentUser) return [];
            const horairesEtudiant = this.getHoraireForStudent();
            const journee = horairesEtudiant.find(j => j.jour === jour);
            return journee ? journee.cours : [];
        },

        refreshData() {
            this.loadDataFromLocalStorage();
            this.generateTimeSlots();
        },

        formatHeure(heure) {
            return heure ? heure.replace(':', 'h') : '';
        }
    },
    computed: {
        studentSchedule() {
            return this.getHoraireForStudent();
        },

        hasSchedule() {
            return this.studentSchedule.some(jour => jour.cours.length > 0);
        },

        joursAbreges() {
            return this.jours.map(jour => jour.substring(0, 3));
        }
    }
};
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Emploi du temps
                <span v-if="currentUser && currentUser.faculte">
                    {{ currentUser.faculte }} - {{ currentUser.annee }} Année
                </span>
            </h3>
            <div class="header-actions">
                <button @click="refreshData" class="refresh-btn" title="Actualiser">
                    <i class="bi-arrow-clockwise"></i>
                </button>
            </div>
        </div>

        <div v-if="error" class="error-message">
            <span>{{ error }}</span>
            <button @click="refreshData" class="retry-btn">Réessayer</button>
        </div>

        <div v-else-if="!currentUser" class="loading">
            Chargement des données utilisateur...
        </div>

        <div v-else-if="!horairesData.length" class="no-data">
            <p>Aucune donnée d'horaire disponible pour l'instant</p>
        </div>

        <div v-else class="schedule-content">
            <!-- Vue Desktop -->
            <div v-if="!isMobileView" class="desktop-view">
                <div class="table-container">
                    <div v-if="creneauxHoraires.length === 0" class="no-data">
                        Aucun créneau horaire disponible
                    </div>
                    <table v-else class="schedule-table">
                        <thead>
                            <tr>
                                <th class="time-header">Heure</th>
                                <th v-for="jour in jours" :key="jour">{{ jour }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="heure in creneauxHoraires" :key="heure">
                                <td class="time-slot">{{ formatHeure(heure) }}</td>
                                <td v-for="jour in jours" :key="jour">
                                    <div v-if="getCoursForSlot(jour, heure)" class="course-info">
                                        <div class="course-name">{{ getCoursForSlot(jour, heure).nomCours }}</div>
                                        <div class="course-details">
                                            <span class="professor">{{ getCoursForSlot(jour, heure).enseignant }}</span>
                                            <span class="room">{{ getCoursForSlot(jour, heure).salle }}</span>
                                        </div>
                                        <div class="course-time">
                                            {{ formatHeure(getCoursForSlot(jour, heure).heureDebut) }} -
                                            {{ formatHeure(getCoursForSlot(jour, heure).heureFin) }}
                                        </div>
                                    </div>
                                    <div v-else class="empty-slot">
                                        -
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Vue Mobile -->
            <div v-else class="mobile-view">
                <div class="days-navigation">
                    <button v-for="(jour, index) in jours" :key="jour" class="day-tab"
                        @click="selectedDay = joursAbreges[index]"
                        :class="{ active: selectedDay === joursAbreges[index] }">
                        {{ joursAbreges[index] }}
                    </button>
                </div>

                <div class="mobile-schedule">
                    <div v-for="(jour, index) in jours" :key="jour" class="day-schedule"
                        :class="{ active: selectedDay === joursAbreges[index] }">
                        <h4 class="day-title">{{ jour }}</h4>
                        <div v-if="getCoursForDay(jour).length === 0" class="no-courses">
                            Aucun cours aujourd'hui
                        </div>
                        <div v-else class="courses-list">
                            <div v-for="cours in getCoursForDay(jour)" :key="cours.heureDebut"
                                class="mobile-course-card">
                                <div class="course-time">
                                    {{ formatHeure(cours.heureDebut) }}
                                    <span v-if="cours.heureFin"> - {{ formatHeure(cours.heureFin) }}</span>
                                </div>
                                <div class="course-content">
                                    <div class="course-name">{{ cours.nomCours }}</div>
                                    <div class="course-meta">
                                        <div class="professor">
                                            <i class="bi-person"></i>
                                            {{ cours.enseignant }}
                                        </div>
                                        <div class="room">
                                            <i class="bi-geo-alt"></i>
                                            {{ cours.salle }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-container-fluid {
    background: var(--color-surface);
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    padding: 1rem;
}

/* En-tête */
.table-container-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    margin: 0;
}

.title span {
    font-size: 0.9rem;
    color: var(--color-primary);
    font-weight: 500;
    display: block;
    margin-top: 0.25rem;
}

.refresh-btn {
    background: var(--color-primary);
    color: var(--color-text-light);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.refresh-btn:hover {
    background: var(--color-primary-dark);
}

/* Messages d'état */
.error-message {
    background: #fee2e2;
    border: 1px solid var(--error);
    color: #991b1b;
    padding: 0.75rem;
    border-radius: 5px;
    text-align: center;
    margin-bottom: 1rem;
}

.retry-btn {
    background: var(--error);
    color: var(--color-text-light);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
}

.loading,
.no-data {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
}

/* Vue Desktop */
.desktop-view {
    overflow-x: auto;
}

.schedule-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-text-light);
    border-radius: 5px;
    min-width: 700px;
}


.schedule-table th {
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: 0.75rem;
    text-align: center;
    font-weight: 600;
    font-size: 0.875rem;
    position: sticky;
    top: 0;
    border: 1px solid var(--color-primary-dark);
}

.schedule-table .time-header {
    background: var(--color-primary-dark);
}

.schedule-table td {
    padding: 0.75rem;
    border: 1px solid var(--color-primary);
    text-align: center;
    vertical-align: top;
}

.time-slot {
    background: #f8f9fa;
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0.5rem;
}

.course-info {
    background: var(--color-background);
    border-left: 3px solid var(--color-primary);
    padding: 0.5rem;
    border-radius: 4px;
    text-align: left;
    font-size: 0.75rem;
    height: 100%;
}

.course-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
}

.course-details {
    color: var(--color-text);
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
}

.course-time {
    font-size: 0.65rem;
    color: var(--color-primary);
    font-weight: 500;
}

.empty-slot {
    color: var(--color-text);
    opacity: 0.5;
}

/* Vue Mobile */
.mobile-view {
    margin-top: 1rem;
}

.days-navigation {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    overflow-x: auto;
    padding: 0.25rem;
}

.day-tab {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-primary);
    background: var(--color-text-light);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap;
}

.day-tab.active {
    background: var(--color-primary);
    color: var(--color-text-light);
    border-color: var(--color-primary);
}

.day-schedule {
    display: none;
}

.day-schedule.active {
    display: block;
}

.day-title {
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: 0.75rem;
    border-radius: 5px;
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.mobile-course-card {
    background: var(--hover-lw);
    border: 1px solid var(--color-primary);
    border-radius: 10px;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
}

.course-time {
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.course-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.course-meta {
    font-size: 0.8rem;
    color: var(--color-text);
}

.course-meta div {
    margin-bottom: 0.25rem;
}

.no-data,
.no-courses {
    border: 2px dashed var(--color-muted);
    padding: 3rem;
    text-align: center;
    border-radius: 10px;
    color: var(--color-muted);
}

/* Responsive */
@media (max-width: 767px) {
    .table-container-fluid {
        padding: 0.75rem;
    }

    .title {
        font-size: 1.1rem;
    }

    .desktop-view {
        display: none;
    }
}

@media (min-width: 768px) {
    .mobile-view {
        display: none;
    }
}
</style>