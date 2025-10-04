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
            heure: '',
            enseignant: '',
            salle: '',
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
            heures: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],

        };
    },
    computed: {
        formulaireComplet() {
            return this.faculteId && this.anneeEtude && this.jour && this.heure && this.coursId && this.enseignant && this.salle;
        }
    },
    mounted() {
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
        },
        enregistrerHoraire() {
            const cours = this.coursDisponibles.find(c => c.id === this.coursId);
            const [heureDebut, heureFin] = this.heure.includes('–')
                ? this.heure.split('–')
                : [this.heure, this.addOneHour(this.heure)];

            const nouveauCours = {
                coursId: this.coursId,
                nomCours: cours.nom,
                heureDebut,
                heureFin,
                enseignant: this.enseignant,
                salle: this.salle,
                anneeEtude: parseInt(this.anneeEtude)
            };

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

            alert('Créneau enregistré avec succès!');
            this.resetForm();
        },
        resetForm() {
            this.jour = '';
            this.heure = '';
            this.coursId = '';
            this.enseignant = '';
            this.enseignantAuto = '';
            this.salle = '';
        },
        trouverEnseignant() {
            const coursId = this.coursId;
            const faculteNom = this.facultes.find(f => f.id === this.faculteId)?.nom;
            const annee = parseInt(this.anneeEtude);

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
        addOneHour(timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            const newH = (h + 1) % 24;
            return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

    }
};
</script>

<template>
    <div class="admin-creator">
        <h3 class="title">Créer un créneau d'emploi du temps</h3>

        <div class="form-group">
            <label>Faculté:</label>
            <select v-model="faculteId" @change="chargerAnneesEtCours" class="select-input">
                <option value="">-- Sélectionner --</option>
                <option v-for="fac in facultes" :key="fac.id" :value="fac.id">{{ fac.nom }}</option>
            </select>
        </div>

        <div class="form-group" v-show="faculteId != ''">
            <label v-if="annees.length">Année d'étude:</label>
            <select v-model="anneeEtude" class="select-input">
                <option value="">-- Sélectionner --</option>
                <option v-for="n in annees" :key="n" :value="n">{{ n }}</option>
            </select>
        </div>

        <div class="form-group">
            <label>Jour:</label>
            <select v-model="jour" class="select-input">
                <option value="">-- Sélectionner --</option>
                <option v-for="j in jours" :key="j" :value="j">{{ j }}</option>
            </select>
        </div>

        <div class="form-group">
            <label>Heure:</label>
            <select v-model="heure" class="select-input">
                <option value="">-- Sélectionner --</option>
                <option v-for="h in heures" :key="h" :value="h">{{ h }}</option>
            </select>
        </div>

        <div class="form-group">
            <label>Cours:</label>
            <select v-model="coursId" @change="trouverEnseignant" class="select-input">
                <option value="">-- Sélectionner --</option>
                <option v-for="c in coursDisponibles" :key="c.id" :value="c.id">{{ c.nom }}</option>
            </select>
        </div>

        <div v-if="enseignantAuto">
            <small>Professeur: <strong>{{ enseignantAuto }}</strong></small>
        </div>

        <div class="form-group">
            <label>Salle:</label>
            <input v-model="salle" placeholder="Salle (ex: B203)" class="input" />
        </div>

        <button class="add-btn" @click="enregistrerHoraire" :disabled="!formulaireComplet">Enregistrer</button>
    </div>
</template>

<style scoped>
.admin-creator {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    font-size: 12px;
    display: flex;
    flex-direction: column;
}

.form-group .input {
    all: unset;
    font-size: 12px;
    padding: .6rem;
    background: var(--hover-lw);
    color: var(--color-primary);
    border-radius: 4px;
    border: 2px solid #00000000;
    transition: all .5s ease;
}
</style>