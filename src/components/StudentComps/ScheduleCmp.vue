<script>
export default {
    name: 'ScheduleComp',
    data() {
        return {
            currentUser: null,
            horairesData: [],
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            creneauxHoraires: [],
            loading: false,
            error: null
        }
    },
    mounted() {
        this.loadDataFromLocalStorage();
        this.generateTimeSlots();
    },
    methods: {
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
                                faculte: userDetails.faculte,
                                annee: userDetails.annee
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
                    this.error = "Aucun horaire trouvé dans le localStorage";
                }

            } catch (error) {
                this.error = "Erreur lors du chargement des données: " + error.message;
                console.error('Erreur localStorage:', error);
            }
        },

        generateTimeSlots() {
            const timeSlots = new Set();

            this.horairesData.forEach(faculte => {
                faculte.horaires.forEach(journee => {
                    journee.cours.forEach(cours => {
                        timeSlots.add(cours.heureDebut);
                    });
                });
            });

            if (timeSlots.size === 0) {
                const heures = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00',];
                heures.forEach(h => timeSlots.add(h));
            }

            this.creneauxHoraires = Array.from(timeSlots).sort((a, b) => {
                return a.localeCompare(b);
            });
        },

        getHoraireForStudent() {
            if (!this.horairesData.length || !this.currentUser) return [];

            const faculteEtudiant = this.horairesData.find(
                faculte => faculte.nomFaculte === this.currentUser.faculte
            );

            if (!faculteEtudiant) {
                console.warn(`Aucun horaire trouvé pour la faculté: ${this.currentUser.faculte}`);
                return [];
            }
            const horairesFiltres = faculteEtudiant.horaires.map(journee => ({
                jour: journee.jour,
                cours: journee.cours.filter(cours => cours.anneeEtude === this.currentUser.annee)
            }));

            return horairesFiltres;
        },

        getCoursForSlot(jour, heureDebut) {
            if (!this.currentUser) return null;

            const horairesEtudiant = this.getHoraireForStudent();

            const journee = horairesEtudiant.find(j => j.jour === jour);
            if (!journee) return null;

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

        refreshData() {
            this.loadDataFromLocalStorage();
            this.generateTimeSlots();
        }
    },
    computed: {
        studentSchedule() {
            return this.getHoraireForStudent();
        },

        hasSchedule() {
            return this.studentSchedule.some(jour => jour.cours.length > 0);
        }
    }
}
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Emploi du temps
                <span v-if="currentUser && currentUser.faculte">
                    - {{ currentUser.faculte }} Année {{ currentUser.annee }}
                </span>
            </h3>
            <!-- <div class="header-actions">
                <button @click="refreshData" class="bi-arrow-clockwise"></button>
            </div> -->
        </div>

        <div v-if="error" class="error-message">
            <span>{{ error }}</span>
            <button @click="refreshData" class="retry-btn">Réessayer</button>
        </div>

        <div v-else-if="!currentUser" class="loading">
            Chargement des données utilisateur...
        </div>

        <div v-else-if="!horairesData.length" class="no-data">
            <p>Aucune donnée d'horaire disponible dans le localStorage</p>
            <button @click="refreshData" class="retry-btn">Actualiser</button>
        </div>

        <div v-else class="schedule-content">
            <div class="table-container">
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th v-for="jour in jours" :key="jour">{{ jour }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="heure in creneauxHoraires" :key="heure">
                            <td class="time-slot">{{ heure }}</td>
                            <td v-for="jour in jours" :key="jour">
                                <div v-if="getCoursForSlot(jour, heure)" class="course-info">
                                    <div class="course-name">{{ getCoursForSlot(jour, heure).nomCours }}</div>
                                    <div class="course-details">
                                        {{ getCoursForSlot(jour, heure).enseignant }}
                                    </div>
                                    <div class="course-details">
                                        Salle: {{ getCoursForSlot(jour, heure).salle }}
                                    </div>
                                    <div class="course-time">
                                        jusqu'à {{ getCoursForSlot(jour, heure).heureFin }}
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
    </div>
</template>