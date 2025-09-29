<script>
export default {
    data() {
        return {
            facultes: [],
            professors: [],
            selectedFacultyFilter: '',
            editingProfessorId: null,
            editProfessor: {},
            showModal: false,
            editingAffectationIndex: null,
            tempAffectation: {
                nom: '',
                annees: []
            },
            anneesDisponibles: [],
            isDropdown: false,
        };
    },
    mounted() {
        const savedFacultes = localStorage.getItem('schola.facultes');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedFacultes) this.facultes = JSON.parse(savedFacultes);
        if (savedUsers) {
            const users = JSON.parse(savedUsers);
            this.professors = users.filter(user => user.role === 'professeur');
        }
    },
    computed: {
        filteredProfessors() {
            if (!this.selectedFacultyFilter) return this.professors;
            return this.professors.filter(p =>
                p.affectations?.some(a => a.nom === this.selectedFacultyFilter)
            );
        }
    },
    methods: {
        formatAnnee(annee) {
            return `${annee} ${annee === 1 ? 'ère' : 'ème'}`;
        },
        formatAffectations(affectations) {
            if (!affectations || affectations.length === 0) return '-';
            return affectations.map(a => {
                const annees = a.annees
                    .sort((x, y) => x.annee - y.annee)
                    .map(an => {
                        const cours = an.cours?.map(c => c.nom).join(', ') || '-';
                        return `${this.formatAnnee(an.annee)} (${cours})`;
                    }).join(', ');
                return `${a.nom} [${annees}]`;
            }).join(' • ');
        },
        getCoursesForFacultyAndYear(faculteNom, annee) {
            const fac = this.facultes.find(f => f.nom === faculteNom);
            return fac?.courses?.filter(c => c.duree >= annee) || [];
        },
        openModal(prof, index = null) {
            this.editingProfessorId = prof.id;
            this.editProfessor = prof;

            if (!this.editProfessor.affectations) {
                this.editProfessor.affectations = [];
            }

            this.editingAffectationIndex = index;

            if (index !== null) {
                this.tempAffectation = JSON.parse(JSON.stringify(prof.affectations[index]));
            } else {
                this.tempAffectation = { nom: '', annees: [] };
            }

            this.showModal = true;
        },
        addAnneeToTemp(annee) {
            if (!this.tempAffectation.annees.some(a => a.annee === annee)) {
                this.tempAffectation.annees.push({ annee, cours: [] });
            }
        },
        confirmAffectation() {
            if (!this.editProfessor.affectations) {
                this.editProfessor.affectations = [];
            }

            const existingIndex = this.editProfessor.affectations.findIndex(a =>
                a.nom === this.tempAffectation.nom
            );

            if (this.editingAffectationIndex !== null) {
                this.editProfessor.affectations.splice(
                    this.editingAffectationIndex,
                    1,
                    JSON.parse(JSON.stringify(this.tempAffectation))
                );
            }
            else if (existingIndex === -1) {
                this.editProfessor.affectations.push(JSON.parse(JSON.stringify(this.tempAffectation)));
            }
            else {
                alert("Cette affectation existe déjà!");
                return;
            }

            this.saveProfessors();
            this.showModal = false;
        },
        deleteAffectation(index) {
            if (!confirm("Voulez-vous supprimer cette affectation ?")) return;
            this.editProfessor.affectations.splice(index, 1);
            this.saveProfessors();
        },
        saveProfessors() {
            const savedUsers = localStorage.getItem('schola.users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];

            users = users.filter(user => user.role !== 'professeur');
            users = users.concat(this.professors);

            localStorage.setItem('schola.users', JSON.stringify(users));
        },
        removeAnneeFromTemp(annee) {
            this.tempAffectation.annees = this.tempAffectation.annees.filter(a => a.annee !== annee);
        },
        chargerAnneesEtCours(faculteNom) {
            const fac = this.facultes.find(f => f.nom === faculteNom);
            if (fac && fac.duree) {
                this.anneesDisponibles = Array.from({ length: fac.duree }, (_, i) => i + 1);
            } else {
                this.anneesDisponibles = [];
            }

            this.tempAffectation.annees = [];
        },
        dropdownActions() {
            this.isDropdown = !this.isDropdown;
        }
    }
};
</script>

<template>
    <div class="prof-overview-container">
        <h3 class="title">Vue d'ensemble des professeurs ({{ filteredProfessors.length }})</h3>

        <div class="filter-container">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="">Toutes les facultés</option>
                <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                    {{ fac.nom }}
                </option>
            </select>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Affectations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="prof in filteredProfessors" :key="prof.id">
                        <td>{{ prof.nom }}</td>
                        <td>{{ prof.prenom }}</td>
                        <td>{{ formatAffectations(prof.affectations) }}</td>
                        <td class="actions-td">
                            <button @click="openModal(prof)" class="add-aff-btn bi-plus"
                                title="Ajouter une affectation"></button>
                            <div class="dropdown">
                                <button class="dropdown-toggle" @click="dropdownActions()">Gérer </button>
                                <div class="dropdown-menu" v-if="isDropdown">
                                    <button v-for="(aff, i) in prof.affectations"
                                        class="dropdown-item dropdown-edit-btn bi-pencil" :key="i"
                                        @click="openModal(prof, i)"> Modifier {{ aff.nom }}
                                    </button>
                                    <button v-for="(aff, i) in prof.affectations"
                                        class="dropdown-item dropdown-delete-btn bi-trash" :key="'del-' + i"
                                        @click="deleteAffectation(i)"> Supprimer {{ aff.nom }}
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal ajout & modif -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <h4>{{ editingAffectationIndex !== null ? 'Modifier' : 'Nouvelle' }} affectation</h4>

                <label>Faculté:</label>
                <select v-model="tempAffectation.nom" class="select-input"
                    @change="chargerAnneesEtCours(tempAffectation.nom)">
                    <option disabled value="">Choisir une faculté</option>
                    <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                        {{ fac.nom }}
                    </option>
                </select>

                <div v-if="tempAffectation.nom">
                    <label>Années:</label>
                    <div v-for="an in anneesDisponibles" :key="an" class="anneeAffectation">
                        <label class="check-box-input">
                            <input type="checkbox" :checked="tempAffectation.annees.some(a => a.annee === an)" @change="event => {
                                if (event.target.checked) {
                                    addAnneeToTemp(an);
                                } else {
                                    removeAnneeFromTemp(an);
                                }
                            }" />
                            {{ formatAnnee(an) }}
                        </label>
                        <div v-if="tempAffectation.annees.some(a => a.annee === an)" class="block-tempAffectation">
                            <select v-model="tempAffectation.annees.find(a => a.annee === an).cours" multiple
                                class="select-input">
                                <option v-for="c in getCoursesForFacultyAndYear(tempAffectation.nom, an)" :key="c.id"
                                    :value="c">
                                    {{ c.nom }}
                                </option>
                            </select>
                            <button @click="removeAnneeFromTemp(an)" class="delete-btn supprimer-annee-modal-btn bi-x"
                                title="Retirer l'année">
                                Retirer l'année</button>
                        </div>
                    </div>
                </div>

                <div class="checking-btns">
                    <button @click="showModal = false" class="cancel-btn bi-x-lg" title="Annuler"></button>
                    <button @click="confirmAffectation" class="save-btn bi-check-lg" title="Confirmer"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.prof-overview-container {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    gap: 1rem;
}

.select-input,
.select-input option {
    color: var(--color-text);
}

.select-input::selection,
.select-input option::selection {
    border: none;
}

.add-student-form {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.add-student-form .input {
    all: unset;
    padding: 0.7rem;
    background-color: var(--hover-lw);
    border: 2px solid var(--hover-lw);
    border-radius: 5px;
    font-size: 14px;
}

.add-student-form .input:hover,
.add-student-form .input:focus {
    border: 2px solid var(--color-primary);
}

.add-form-btns {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}

.add-form-btns button {
    all: unset;
    text-align: center;
    transition: all;
    border-radius: 50px;
    padding: .7rem;
    width: 40%;
    font-size: 14px;
    cursor: pointer;
}

.add-form-btns .close-btn {
    background: var(--hover-lw);
}

.add-form-btns .close-btn:hover {
    background: var(--color-accent);
}

.add-form-btns .add-btn {
    background: var(--color-primary);
    color: var(--color-text-light);
}

.add-form-btns .add-btn:hover {
    background: var(--color-primary-dark);
}

/* ------  */

.table-container .ced-btns {
    display: flex;
    gap: .2rem;
}

/* ------ td editor */

.td-editor {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto;
    padding: 0;
    gap: .5rem;
    padding: .2rem;
}

.affectation-editor {
    grid-column: span 8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    width: auto;
    gap: .5rem;
    border: 1px solid var(--color-primary-dark);
    border-radius: 10px;
    padding: .2rem;
}

.select-editor {
    width: fit-content;
    height: 100%;
    background: transparent;
    font-size: 12px;
    padding: .5rem .3rem;
    border-radius: 5px;
    border: 1px solid var(--color-accent);
}

.actions-td {
    display: flex;
    gap: .2rem;
}

.table-container .actions-td .add-aff-btn,
.ced-btns .edit-btn,
.delete-btn {
    all: unset;
    padding: 0.2rem .4rem;
    border-radius: 5px;
    transition: all .5s ease;
    cursor: pointer;
    text-align: center;
}

.delete-btn {
    color: var(--color-danger);
}

.supprimer-annee-modal-btn {
    border: 1px solid var(--color-danger);
}

.delete-btn:hover {
    background: var(--color-danger-bg);
}

.actions-td .add-aff-btn,
.edit-btn {
    all: unset;
    cursor: pointer;
    background: var(--hover-lw);
    border: 2px solid var(--hover-lw);
}

.actions-td .add-aff-btn:hover,
.edit-btn:hover {
    background: var(--hover-lw);
}

.dropdown {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.dropdown-toggle {
    all: unset;
    background: var(--hover-lw);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    padding: .2rem .8rem;
    border-radius: 5px;
    width: auto;
    text-align: center;
    cursor: pointer;
}

.dropdown-menu {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.dropdown-menu .dropdown-item {
    all: unset;
    padding: .4rem .5rem;
    cursor: pointer;
    font-size: 11px;
    border-radius: 5px;
    border: 1px solid #00000000;
    transition: all .5s ease;
}

.dropdown-menu .dropdown-edit-btn {
    background: var(--color-success-bg);
    color: var(--color-success);
}

.dropdown-menu .dropdown-edit-btn:hover {
    border: 1px solid var(--color-success);
}

.dropdown-menu .dropdown-delete-btn {
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.dropdown-menu .dropdown-delete-btn:hover {
    border: 1px solid var(--color-danger);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    font-size: 14px;
}

.block-tempAffectation {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: .5rem;
}

.block-tempAffectation .delete-btn {
    font-size: 12px;
}

.anneeAffectation {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: .5rem;
}

.modal-content .checking-btns {
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .td-editor {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .affectation-editor {
        grid-column: span 1;
        height: auto;
        flex-direction: column;
        align-items: normal;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .td-editor {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
    }

    .select-editor {
        width: fit-content;
    }

    .select-editor-an {
        width: 100%;
    }
}
</style>
