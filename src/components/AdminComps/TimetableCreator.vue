<script>
export default {
    name: 'TimetableCreator',
    data() {
        return {
            users: [],
            enseignantAuto: '',
            facultes: [],
            faculteId: '',
            annees: [],
            anneeEtude: '',
            coursDisponibles: [],
            coursId: '',
            jour: '',
            heureDebut: '',
            heureFin: '',
            enseignant: '',
            salle: '',
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
            heures: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
            error: null,
            success: null
        };
    },
    computed: {
        formulaireComplet() {
            return this.faculteId && this.anneeEtude && this.jour && this.heureDebut && this.heureFin && this.coursId && this.enseignant && this.salle;
        },
        heuresFinDisponibles() {
            if (!this.heureDebut) return [];

            const debutIndex = this.heures.indexOf(this.heureDebut);
            if (debutIndex === -1) return [];

            return this.heures.slice(debutIndex + 1);
        }
    },
    mounted() {
        const today = new Date();
        const isSunday = today.getDay() === 0;

        if (isSunday && localStorage.getItem('schola.horaires')) {
            if (confirm('Voulez-vous réinitialiser les emplois du temps pour la nouvelle semaine ?')) {
                localStorage.removeItem('schola.horaires');
            }
        }

        const facData = localStorage.getItem('schola.facultes');
        if (facData) this.facultes = JSON.parse(facData);

        const usersData = localStorage.getItem('schola.users');
        if (usersData) this.users = JSON.parse(usersData);
    },
    methods: {
        chargerAnneesEtCours() {
            const fac = this.facultes.find(f => f.id === this.faculteId);
            this.annees = fac ? Array.from({ length: fac.duree }, (_, i) => i + 1) : [];
            this.coursDisponibles = fac ? fac.courses : [];
            this.anneeEtude = '';
            this.coursId = '';
            this.enseignantAuto = '';
            this.enseignant = '';
        },

        verifierConflit(faculte, jour, heureDebut, heureFin, anneeEtude) {
            const jourBloc = faculte.horaires.find(h => h.jour === jour);
            if (!jourBloc) return false;

            return jourBloc.cours.some(cours => {
                const conflit = this.plagesSeChevauchent(
                    heureDebut, heureFin,
                    cours.heureDebut, cours.heureFin
                );

                return conflit && cours.anneeEtude === anneeEtude;
            });
        },

        plagesSeChevauchent(debut1, fin1, debut2, fin2) {
            const toMinutes = (time) => {
                const [heures, minutes] = time.split(':').map(Number);
                return heures * 60 + minutes;
            };

            const d1 = toMinutes(debut1);
            const f1 = toMinutes(fin1);
            const d2 = toMinutes(debut2);
            const f2 = toMinutes(fin2);

            return d1 < f2 && f1 > d2;
        },

        calculerDuree() {
            if (!this.heureDebut || !this.heureFin) return '';

            const toMinutes = (time) => {
                const [heures, minutes] = time.split(':').map(Number);
                return heures * 60 + minutes;
            };

            const dureeMinutes = toMinutes(this.heureFin) - toMinutes(this.heureDebut);
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

        enregistrerHoraire() {
            const cours = this.coursDisponibles.find(c => c.id === this.coursId);

            if (!this.heureFin) {
                this.error = 'Veuillez sélectionner une heure de fin';
                return;
            }

            if (this.heures.indexOf(this.heureFin) <= this.heures.indexOf(this.heureDebut)) {
                this.error = 'L\'heure de fin doit être après l\'heure de début';
                return;
            }

            let horaires = JSON.parse(localStorage.getItem('schola.horaires') || '[]');

            let faculte = horaires.find(f => f.faculteId === this.faculteId);
            if (!faculte) {
                faculte = {
                    faculteId: this.faculteId,
                    nomFaculte: this.facultes.find(f => f.id === this.faculteId)?.nom || '',
                    horaires: []
                };
                horaires.push(faculte);
            }

            const conflit = this.verifierConflit(
                faculte,
                this.jour,
                this.heureDebut,
                this.heureFin,
                parseInt(this.anneeEtude)
            );

            if (conflit) {
                this.error = 'Ce créneau horaire existe déjà pour cette année !';
                return;
            }

            const nouveauCours = {
                coursId: this.coursId,
                nomCours: cours.nom,
                heureDebut: this.heureDebut,
                heureFin: this.heureFin,
                enseignant: this.enseignant,
                salle: this.salle,
                anneeEtude: parseInt(this.anneeEtude)
            };

            let jourBloc = faculte.horaires.find(h => h.jour === this.jour);
            if (!jourBloc) {
                jourBloc = {
                    jour: this.jour,
                    cours: []
                };
                faculte.horaires.push(jourBloc);
            }

            jourBloc.cours.push(nouveauCours);

            localStorage.setItem('schola.horaires', JSON.stringify(horaires));

            this.success = 'Créneau enregistré avec succès !';
            this.resetForm();
        },

        resetForm() {
            this.jour = '';
            this.heureDebut = '';
            this.heureFin = '';
            this.coursId = '';
            this.enseignant = '';
            this.enseignantAuto = '';
            this.salle = '';
        },

        trouverEnseignant() {
            const coursId = this.coursId;
            const faculteNom = this.facultes.find(f => f.id === this.faculteId)?.nom;
            const annee = parseInt(this.anneeEtude);

            if (!coursId || !faculteNom || !annee) {
                this.enseignantAuto = '';
                this.enseignant = '';
                return;
            }

            const prof = this.users.find(u => {
                if (u.role !== 'professeur' || !u.affectations) return false;
                return u.affectations.some(a =>
                    a.nom === faculteNom &&
                    a.annees.some(ann =>
                        ann.annee === annee &&
                        ann.cours.some(c => c.id === coursId)
                    )
                );
            });

            this.enseignantAuto = prof ? `${prof.prenom} ${prof.nom}` : '';
            this.enseignant = this.enseignantAuto;
        },

        resetHeureFin() {
            this.heureFin = '';
        }
    }
};
</script>

<template>
    <div class="admin-creator">
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
                <select v-model="faculteId" @change="chargerAnneesEtCours" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="fac in facultes" :key="fac.id" :value="fac.id">{{ fac.nom }}</option>
                </select>
            </div>

            <div class="form-group" v-if="faculteId && annees.length">
                <label>Année d'étude:</label>
                <select v-model="anneeEtude" @change="trouverEnseignant" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="n in annees" :key="n" :value="n">{{ n }}ère année</option>
                </select>
            </div>

            <div class="form-group">
                <label>Jour:</label>
                <select v-model="jour" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="j in jours" :key="j" :value="j">{{ j }}</option>
                </select>
            </div>

            <div class="time-selection">
                <div class="form-group">
                    <label>Heure de début:</label>
                    <select v-model="heureDebut" @change="resetHeureFin" class="select-input">
                        <option value="">-- Sélectionner --</option>
                        <option v-for="h in heures" :key="h" :value="h">{{ h }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Heure de fin:</label>
                    <select v-model="heureFin" class="select-input" :disabled="!heureDebut">
                        <option value="">-- Sélectionner --</option>
                        <option v-for="h in heuresFinDisponibles" :key="h" :value="h">{{ h }}</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label>Cours:</label>
                <select v-model="coursId" @change="trouverEnseignant" class="select-input" :disabled="!anneeEtude">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="c in coursDisponibles" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
            </div>

            <div v-if="enseignantAuto" class="form-group info-box">
                <small>Professeur auto-détecté: <strong>{{ enseignantAuto }}</strong></small>
            </div>

            <div class="form-group">
                <label>Enseignant:</label>
                <input v-model="enseignant" placeholder="Nom de l'enseignant" class="input" />
            </div>

            <div class="form-group">
                <label>Salle:</label>
                <input v-model="salle" placeholder="Salle (ex: B203)" class="input" />
            </div>

            <div v-if="heureDebut && heureFin" class="duration-info">
                <small>Durée du cours: {{ calculerDuree() }}</small>
            </div>

            <button class="add-btn" @click="enregistrerHoraire" :disabled="!formulaireComplet">
                {{ !formulaireComplet ? 'Remplissez tous les champs' : 'Enregistrer le créneau' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.admin-creator {
    gap: .5rem;
}

.title {
    margin-bottom: 1.5rem;
}

.form {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
    font-size: 14px;
}

.select-input,
.input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 4px;
    font-size: 14px;
}

.time-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.add-btn {
    width: 100%;
    padding: 0.7rem;
    background-color: var(--color-primary);
    color: var(--color-surface);
    border: none;
    border-radius: 50px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 1rem;
}

.add-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.add-btn:not(:disabled):hover {
    background-color: var(--color-primary-dark);
}

.info-box {
    background-color: #e3f2fd;
    padding: 0.5rem;
    border-radius: 4px;
    border-left: 4px solid var(--color-secondary);
}

.duration-info {
    background-color: #e3f2fd;
    padding: 0.5rem;
    border-radius: 4px;
    border-left: 4px solid var(--color-secondary);
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .time-selection {
        grid-template-columns: 1fr;
        gap: .5rem;
    }
}
</style>