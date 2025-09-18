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
            }
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
            const existingIndex = this.editProfessor.affectations.findIndex(a =>
                a.nom === this.tempAffectation.nom
            );

            if (this.editingAffectationIndex !== null) {
                this.editProfessor.affectations.splice(this.editingAffectationIndex, 1, JSON.parse(JSON.stringify(this.tempAffectation)));
            } else if (existingIndex === -1) {
                this.editProfessor.affectations.push(JSON.parse(JSON.stringify(this.tempAffectation)));
            } else {
                alert("Cette affectation existe déjà!");
                return;
            }

            this.saveProfessors();
            this.showModal = false;
        },
        deleteAffectation(index) {
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
                        <td>
                            <button @click="openModal(prof)" class="edit-btn">Ajouter</button>
                            <button v-for="(aff, i) in prof.affectations" :key="i" @click="openModal(prof, i)"
                                class="edit-btn">
                                Modifier {{ aff.nom }}
                            </button>
                            <button v-for="(aff, i) in prof.affectations" :key="'del-' + i"
                                @click="deleteAffectation(i)" class="delete-btn">
                                Supprimer {{ aff.nom }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <h4>{{ editingAffectationIndex !== null ? 'Modifier' : 'Nouvelle' }} affectation</h4>

                <label>Faculté:</label>
                <select v-model="tempAffectation.nom" class="select-input">
                    <option disabled value="">Choisir une faculté</option>
                    <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                        {{ fac.nom }}
                    </option>
                </select>

                <div v-if="tempAffectation.nom">
                    <label>Années:</label>
                    <div v-for="an in [1, 2, 3]" :key="an">
                        <input type="checkbox" :checked="tempAffectation.annees.some(a => a.annee === an)" @change="event => {
                            if (event.target.checked) {
                                addAnneeToTemp(an);
                            } else {
                                removeAnneeFromTemp(an);
                            }
                        }" />


                        {{ formatAnnee(an) }}

                        <div v-if="tempAffectation.annees.some(a => a.annee === an)">
                            <select v-model="tempAffectation.annees.find(a => a.annee === an).cours" multiple
                                class="select-input">
                                <option v-for="c in getCoursesForFacultyAndYear(tempAffectation.nom, an)" :key="c.id"
                                    :value="c">
                                    {{ c.nom }}
                                </option>
                            </select>
                            <button @click="removeAnneeFromTemp(an)" class="delete-btn">Retirer année</button>
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button @click="confirmAffectation" class="save-btn">Valider</button>
                    <button @click="showModal = false" class="cancel-btn">Annuler</button>
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

.annee-cours-editor {
    display: flex;
    align-items: center;
    border: 1px solid #000;
}

.add-affectation-btn,
.delete-btn {
    all: unset;
    padding: 0.2rem .4rem;
    border-radius: 5px;
    transition: all .5s ease;
    cursor: pointer;
    text-align: center;
}

.add-affectation-btn {
    grid-column: span 1;
    background: var(--color-primary);
    color: var(--color-text-light);
    justify-self: flex-end;
}

.add-affectation-btn:hover {
    background: var(--color-primary-dark);
}

.delete-btn {
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.delete-btn:hover {
    background: var(--color-danger);
    color: var(--color-text-light);
}

.add-affectation-btn {
    padding: 0.2rem .4rem;
}

.edit-btn {
    all: unset;
    cursor: pointer;
}


.crud-btns {
    display: flex;
    gap: .8rem;
}

.crud-btns button {
    all: unset;
    padding: 0.2rem .4rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.crud-btns .save-btn:hover {
    color: var(--color-success);
    background: var(--color-success-bg);
}

.crud-btns .cancel-btn:hover {
    color: var(--color-danger);
    background: var(--color-danger-bg);
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
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

    /* .affectation-editor {
                    grid-column: span 1;
                    height: auto;
                    flex-direction: column;
                    align-items: normal;
                    justify-content: center;
                } */
    .select-editor {
        width: fit-content;
    }

    .select-editor-an {
        width: 100%;
    }

    .add-affectation-btn {
        grid-column: span 1;
        grid-row: span 1;
        justify-self: normal;

    }
}
</style>
