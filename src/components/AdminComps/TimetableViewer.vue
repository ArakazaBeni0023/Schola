<script>
export default {
    name: 'TimetableViewer',
    data() {
        return {
            facultes: [],
            faculteId: '',
            annees: [],
            anneeEtude: '',
            horaires: [],
            grille: {},
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
            heures: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            error: null,
            success: null
        };
    },
    computed: {
        hasData() {
            return this.faculteId && this.anneeEtude;
        },
        faculteSelectionnee() {
            return this.facultes.find(f => f.id === this.faculteId);
        },
        heuresAffichees() {
            const heuresUtilisees = new Set();

            if (this.grille) {
                Object.keys(this.grille).forEach(heure => {
                    this.jours.forEach(jour => {
                        if (this.grille[heure] && this.grille[heure][jour]) {
                            heuresUtilisees.add(heure);
                        }
                    });
                });
            }

            if (heuresUtilisees.size === 0) {
                return this.heures;
            }

            return Array.from(heuresUtilisees).sort();
        }
    },
    mounted() {
        this.chargerDonnees();
    },
    methods: {
        chargerDonnees() {
            try {
                const facData = localStorage.getItem('schola.facultes');
                if (facData) this.facultes = JSON.parse(facData);

                const horairesData = localStorage.getItem('schola.horaires');
                if (horairesData) this.horaires = JSON.parse(horairesData);
            } catch (error) {
                this.showError('Erreur lors du chargement des données');
            }
        },

        chargerAnnees() {
            this.error = null;
            const fac = this.facultes.find(f => f.id === this.faculteId);
            this.annees = fac ? Array.from({ length: fac.duree }, (_, i) => i + 1) : [];
            this.anneeEtude = '';
            this.grille = {};
        },

        afficherEmploiDuTemps() {
            this.error = null;

            if (!this.hasData) {
                this.showError('Veuillez sélectionner une faculté et une année');
                return;
            }

            const fac = this.horaires.find(f => f.faculteId === this.faculteId);
            if (!fac || !fac.horaires) {
                this.grille = {};
                this.showError('Aucun emploi du temps trouvé pour cette faculté');
                return;
            }

            try {
                const grilleTemp = {};

                this.heures.forEach(h => {
                    grilleTemp[h] = {};
                    this.jours.forEach(jour => {
                        grilleTemp[h][jour] = [];
                    });
                });

                fac.horaires.forEach(jourBloc => {
                    if (jourBloc.cours) {
                        jourBloc.cours.forEach(cours => {
                            if (cours.anneeEtude === parseInt(this.anneeEtude)) {
                                const heuresCours = this.getHeuresCours(cours.heureDebut, cours.heureFin);

                                heuresCours.forEach(heure => {
                                    if (grilleTemp[heure] && grilleTemp[heure][jourBloc.jour]) {
                                        const existeDeja = grilleTemp[heure][jourBloc.jour].some(
                                            c => c.coursId === cours.coursId
                                        );

                                        if (!existeDeja) {
                                            grilleTemp[heure][jourBloc.jour].push({
                                                coursId: cours.coursId,
                                                nomCours: cours.nomCours,
                                                enseignant: cours.enseignant || '—',
                                                salle: cours.salle || '—',
                                                heureDebut: cours.heureDebut,
                                                heureFin: cours.heureFin,
                                                duree: this.calculerDuree(cours.heureDebut, cours.heureFin)
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

                this.grille = grilleTemp;

                if (Object.keys(this.grille).length === 0) {
                    this.showError('Aucun cours trouvé pour cette année d\'étude');
                } else {
                    this.showSuccess('Emploi du temps chargé avec succès');
                }
            } catch (error) {
                this.showError('Erreur lors du chargement de l\'emploi du temps');
            }
        },

        getHeuresCours(heureDebut, heureFin) {
            const heures = [];
            let heureActuelle = heureDebut;

            while (heureActuelle && heureActuelle !== heureFin) {
                heures.push(heureActuelle);
                const index = this.heures.indexOf(heureActuelle);
                if (index === -1 || index >= this.heures.length - 1) break;
                heureActuelle = this.heures[index + 1];
            }

            return heures;
        },

        calculerDuree(heureDebut, heureFin) {
            if (!heureDebut || !heureFin) return '';

            const toMinutes = (time) => {
                const [heures, minutes] = time.split(':').map(Number);
                return heures * 60 + minutes;
            };

            const dureeMinutes = toMinutes(heureFin) - toMinutes(heureDebut);
            const heures = Math.floor(dureeMinutes / 60);
            const minutes = dureeMinutes % 60;

            if (heures > 0 && minutes > 0) {
                return `${heures}h${minutes.toString().padStart(2, '0')}`;
            } else if (heures > 0) {
                return `${heures}h`;
            } else {
                return `${minutes}min`;
            }
        },

        getCoursPourCellule(heure, jour) {
            return this.grille[heure] && this.grille[heure][jour] ? this.grille[heure][jour] : [];
        },

        // FONCTION MANQUANTE - CORRECTION DE L'ERREUR
        getCoursPourJour(jour) {
            const coursDuJour = [];

            this.heuresAffichees.forEach(heure => {
                const coursPourHeure = this.getCoursPourCellule(heure, jour);
                coursPourHeure.forEach(cours => {
                    // Ne prendre que la première occurrence de chaque cours (heure de début)
                    if (cours.heureDebut === heure) {
                        coursDuJour.push(cours);
                    }
                });
            });

            return coursDuJour.sort((a, b) => this.heures.indexOf(a.heureDebut) - this.heures.indexOf(b.heureDebut));
        },

        exporterPDF() {
            if (!this.hasData || Object.keys(this.grille).length === 0) {
                this.showError('Aucun emploi du temps à exporter');
                return;
            }

            // Implémentation basique - à améliorer avec une librairie PDF
            const printContent = document.querySelector('.timetable-container').innerHTML;
            const originalContent = document.body.innerHTML;

            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;

            this.showSuccess('Export PDF généré avec succès');
        },

        estPremiereHeure(heure, cours) {
            return heure === cours.heureDebut;
        },

        // Gestion des notifications
        showError(message) {
            this.error = message;
            this.success = null;
            setTimeout(() => {
                this.error = null;
            }, 5000);
        },

        showSuccess(message) {
            this.success = message;
            this.error = null;
            setTimeout(() => {
                this.success = null;
            }, 3000);
        },

        // Nouvelle méthode pour vider la sélection
        reinitialiser() {
            this.faculteId = '';
            this.anneeEtude = '';
            this.annees = [];
            this.grille = {};
            this.error = null;
            this.success = null;
        }
    }
};
</script>

<template>
    <div class="horaire-viewer">
        <!-- Notifications -->
        <transition name="alert-fade">
            <div v-if="error" class="alert alert-error">
                {{ error }}
            </div>
        </transition>

        <transition name="alert-fade">
            <div v-if="success" class="alert alert-success">
                {{ success }}
            </div>
        </transition>


        <div class="form">
            <div class="form-group">
                <label>Faculté:</label>
                <select v-model="faculteId" @change="chargerAnnees" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="fac in facultes" :key="fac.id" :value="fac.id">{{ fac.nom }}</option>
                </select>
            </div>

            <div class="form-group" v-if="annees.length">
                <label>Année d'étude:</label>
                <select v-model="anneeEtude" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="n in annees" :key="n" :value="n">{{ n }}ère année</option>
                </select>
            </div>

            <div class="actions">
                <button @click="afficherEmploiDuTemps" :disabled="!hasData" class="btn-primary">
                    Afficher l'emploi du temps
                </button>
                <button @click="exporterPDF" :disabled="!hasData || Object.keys(grille).length === 0"
                    class="btn-secondary">
                    Exporter PDF
                </button>
                <button v-show="hasData" @click="reinitialiser" class="btn-tertiary">
                    Réinitialiser
                </button>
            </div>
        </div>

        <div v-if="Object.keys(grille).length > 0" class="timetable-container">
            <div class="header-info">
                <h4>Emploi du temps - {{ faculteSelectionnee?.nom }} - {{ anneeEtude }}ère année</h4>
                <small>Semaine du lundi au vendredi</small>
                <div class="stats">
                    <small>{{ countTotalCours() }} cours programmés</small>
                </div>
            </div>

            <!-- Version Desktop -->
            <div class="table-wrapper">
                <table class="desktop-view table-container">
                    <thead>
                        <tr>
                            <th class="time-header"><i class="bi-clock"></i> Heure</th>
                            <th v-for="jour in jours" :key="jour" class="day-header">{{ jour }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="heure in heuresAffichees" :key="heure">
                            <td class="time-cell">{{ heure }}</td>
                            <td v-for="jour in jours" :key="jour" class="course-cell">
                                <div v-for="(cours, index) in getCoursPourCellule(heure, jour)" :key="index"
                                    class="course-item" :class="{
                                        'course-start': estPremiereHeure(heure, cours),
                                        'course-continuation': !estPremiereHeure(heure, cours)
                                    }">

                                    <div v-if="estPremiereHeure(heure, cours)" class="course-full-info">
                                        <strong class="course-name">
                                            {{ cours.nomCours }}
                                        </strong>
                                        <div class="course-details">
                                            <span class="professor">{{ cours.enseignant }}</span>
                                            <span class="room">Salle: {{ cours.salle }}</span>
                                            <span class="time-range">{{ cours.heureDebut }} - {{ cours.heureFin
                                            }}</span>
                                            <span class="duration">({{ cours.duree }})</span>
                                        </div>
                                    </div>

                                    <div v-else class="course-continuation-marker">
                                        ↳ {{ cours.nomCours }}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Version Mobile -->
            <div class="mobile-view">
                <div v-for="jour in jours" :key="jour" class="mobile-day">
                    <h4 class="mobile-day-title">{{ jour }}</h4>
                    <div v-for="cours in getCoursPourJour(jour)" :key="cours.coursId + cours.heureDebut"
                        class="mobile-course">
                        <div class="mobile-course-header">
                            <strong class="mobile-course-name">{{ cours.nomCours }}</strong>
                            <span class="mobile-duration">{{ cours.duree }}</span>
                        </div>
                        <div class="mobile-time">{{ cours.heureDebut }} - {{ cours.heureFin }}</div>
                        <div class="mobile-details">
                            <div class="professor">{{ cours.enseignant }}</div>
                            <div class="room">Salle: {{ cours.salle }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="hasData" class="no-data">
            <p>Aucun cours programmé pour cette année.</p>
        </div>
    </div>
</template>

<style scoped>
.horaire-viewer {
    gap: .5rem;
}

.form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1rem;
    margin-block: 1rem 2rem;
    align-items: end;
    font-size: 14px;
}

.actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-tertiary {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 12px;
    font-family: "Poppins", sans-serif;
    transition: all .5s ease;
}

.btn-primary {
    background-color: var(--color-secondary);
    color: var(--color-text-light);
}

.btn-primary:disabled {
    background-color: #c0c0c0;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: var(--color-secondary);
    color: var(--color-text-light);
}

.btn-secondary:disabled {
    background-color: #c0c0c0;
    cursor: not-allowed;
}

.btn-tertiary {
    background-color: var(--color-secondary);
    color: var(--color-text-light);
}

.btn-primary:hover:not(:disabled),
.btn-secondary:hover:not(:disabled),
.btn-tertiary:hover {
    background-color: var(--color-primary-dark);
}

.timetable-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.header-info {
    background: #f8f9fa;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    text-align: center;
}

.header-info h4 {
    margin: 0 0 0.5rem 0;
    color: #495057;
}

.stats {
    margin-top: 0.5rem;
}

.table-wrapper {
    overflow-x: auto;
}

.table-container {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.time-header,
.day-header {
    background: #343a40;
    color: white;
    padding: 1rem;
    text-align: center;
    font-weight: bold;
    position: sticky;
    top: 0;
}

.time-cell {
    background: #f8f9fa;
    padding: 0.75rem;
    text-align: center;
    font-weight: bold;
    border: 1px solid #dee2e6;
    position: sticky;
    left: 0;
}

.course-cell {
    border: 1px solid #dee2e6;
    padding: 0.25rem;
    vertical-align: top;
    min-width: 180px;
}

.course-item {
    min-height: 60px;
    padding: 0.5rem;
}

.course-start {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border-left: 4px solid #2196F3;
    border-radius: 4px;
}

.course-continuation {
    background: linear-gradient(135deg, #f3e5f5, #e1bee7);
    border-left: 4px solid #9C27B0;
}

.course-full-info {
    font-size: 0.85rem;
}

.course-name {
    color: #1976d2;
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
}

.course-details {
    font-size: 0.75rem;
    color: #546e7a;
}

.course-details span {
    display: block;
    line-height: 1.3;
}

.course-continuation-marker {
    font-size: 0.8rem;
    color: #7b1fa2;
    font-style: italic;
    text-align: center;
    padding: 0.5rem;
}

/* Version Mobile */
.mobile-view {
    display: none;
}

.mobile-day {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    overflow: hidden;
}

.mobile-day-title {
    background: #343a40;
    color: white;
    padding: 1rem;
    margin: 0;
    text-align: center;
}

.mobile-course {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
}

.mobile-course:last-child {
    border-bottom: none;
}

.mobile-course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.mobile-course-name {
    color: #1976d2;
    font-size: 1rem;
    flex: 1;
}

.mobile-duration {
    background: #2196F3;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
}

.mobile-time {
    font-weight: bold;
    color: #495057;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.mobile-details {
    font-size: 0.85rem;
    color: #546e7a;
}

.mobile-details div {
    margin-bottom: 0.25rem;
}

.no-data {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px dashed #dee2e6;
}

/* Responsive */
@media (max-width: 768px) {
    .form {
        grid-template-columns: 1fr;
    }

    .actions {
        justify-content: stretch;
    }

    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
        flex: 1;
        min-width: 120px;
    }

    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }
}

@media (min-width: 769px) {
    .mobile-view {
        display: none;
    }

    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
        padding: 0.75rem 1rem;
    }
}
</style>