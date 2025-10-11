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
            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
            heures: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00']
        };
    },
    mounted() {
        const facData = localStorage.getItem('schola.facultes');
        if (facData) this.facultes = JSON.parse(facData);

        const horairesData = localStorage.getItem('schola.horaires');
        if (horairesData) this.horaires = JSON.parse(horairesData);
    },
    methods: {
        chargerAnnees() {
            const fac = this.facultes.find(f => f.id === this.faculteId);
            this.annees = fac ? Array.from({ length: fac.duree }, (_, i) => i + 1) : [];
            this.anneeEtude = '';
            this.grille = {};
        },
        afficherEmploiDuTemps() {
            const fac = this.horaires.find(f => f.faculteId === this.faculteId);
            if (!fac || !fac.horaires) {
                this.grille = {};
                return;
            }

            const grilleTemp = {};
            this.heures.forEach(h => {
                grilleTemp[h] = {};
                this.jours.forEach(jour => {
                    const jourBloc = fac.horaires.find(hb => hb.jour === jour);
                    if (!jourBloc || !jourBloc.cours) return;

                    const coursFiltres = jourBloc.cours.filter(c =>
                        c.anneeEtude === parseInt(this.anneeEtude) &&
                        c.heureDebut === h
                    );

                    if (coursFiltres.length > 0) {
                        grilleTemp[h][jour] = coursFiltres.map(c => ({
                            nomCours: c.nomCours,
                            enseignant: c.enseignant || '—',
                            salle: c.salle || '—',
                            heureFin: c.heureFin
                        }));
                    }
                });
            });

            this.grille = grilleTemp;
        }
    }
};
</script>

<template>
    <div class="horaire-viewer">
        <h3 class="title">Emploi du temps par faculté et année</h3>
        <div class="form">
            <div class="form-group">
                <label>Faculté:</label>
                <select v-model="faculteId" @change="chargerAnnees" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="fac in facultes" :key="fac.id" :value="fac.id">{{ fac.nom }}</option>
                </select>
            </div>

            <div class="form-group">
                <label v-if="annees.length">Année d'étude:</label>
                <select v-if="annees.length" v-model="anneeEtude" class="select-input">
                    <option value="">-- Sélectionner --</option>
                    <option v-for="n in annees" :key="n" :value="n">{{ n }}</option>
                </select>
            </div>

            <button @click="afficherEmploiDuTemps" :disabled="!faculteId || !anneeEtude" class="add-btn">
                Afficher l'emploi du temps
            </button>
        </div>

        <table class="table-container">
            <thead>
                <tr>
                    <th><i class="bi-clock"></i></th>
                    <th v-for="jour in jours" :key="jour">{{ jour }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="heure in heures" :key="heure">
                    <td>{{ heure }}</td>
                    <td v-for="jour in jours" :key="jour">
                        <div v-if="grille[heure] && grille[heure][jour]">
                            <div v-for="(cours, index) in grille[heure][jour]" :key="index">
                                <strong :title="cours.enseignant + ' - ' + cours.salle">
                                    {{ cours.nomCours }}
                                </strong><br />
                                <span class="infos">
                                    {{ cours.enseignant }} — {{ cours.salle }} (jusqu'à {{ cours.heureFin }})
                                </span>
                                <hr v-if="index < grille[heure][jour].length - 1" />
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.horaire-viewer {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
}

.form {
    display: flex;
    align-items: end;
    gap: .5rem;
    margin-top: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    font-size: 12px;
}

.add-btn {
    padding: .8rem 1rem;
    border-radius: 5px;
}

.table-container {
    margin-top: 1.5rem;
    border-collapse: collapse;
}


@media (max-width:786px) {
    .form {
        display: flex;
        flex-direction: column;
        align-items: normal;
    }

    .form-group {
        width: 100%;
    }

    .infos {
        display: none;
    }
}
</style>
