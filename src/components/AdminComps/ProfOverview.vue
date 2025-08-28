<script>
export default {
    data() {
        return {
            facultes: [],
            professors: [],
            selectedFacultyFilter: '',
            editingProfessorId: null,
            editProfessor: {},
            newFacNom: '',
            newAnnee: null,
        };
    },
    mounted() {
        const savedFacultes = localStorage.getItem('schola.facultes');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedFacultes) {
            this.facultes = JSON.parse(savedFacultes);
        }

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
            if (!annee) return '-';
            return `${annee} ${annee === 1 ? 'ère' : 'éme'}`;
        },
        formatAffectations(affectations) {
            if (!affectations || affectations.length === 0) return '-';
            return affectations.map(a => {
                const annees = a.annees
                    .sort((x, y) => x - y)
                    .map(this.formatAnnee)
                    .join(', ');
                return `${a.nom} [${annees}]`;
            }).join(' | ');
        },
        startEdit(prof) {
            this.editingProfessorId = prof.id;
            this.editProfessor = {
                ...prof,
                affectations: prof.affectations ? JSON.parse(JSON.stringify(prof.affectations)) : []
            };
        },
        confirmEdit() {
            const index = this.professors.findIndex(p => p.id === this.editingProfessorId);
            if (index !== -1) {
                this.professors.splice(index, 1, this.editProfessor);
                this.saveProfessors();
                this.editingProfessorId = null;
                this.editProfessor = {};
            }
        },
        cancelEdit() {
            this.editingProfessorId = null;
            this.editProfessor = {};
        },
        /* addAffectation() {
            if (!this.editProfessor.affectations) {
                this.editProfessor.affectations = [];
            }
            this.editProfessor.affectations.push({ nom: '', annees: [] });
        }, */
        addAffectation(nom, annee) {
            if (!this.editProfessor.affectations) {
                this.editProfessor.affectations = [];
            }

            const existing = this.editProfessor.affectations.find(a => a.nom === nom);

            if (existing) {
                if (!existing.annees.includes(annee)) {
                    existing.annees.push(annee);
                }
            } else {
                this.editProfessor.affectations.push({ nom, annees: [annee] });
            }
        },
        removeAffectation(index) {
            this.editProfessor.affectations.splice(index, 1);
        },
        saveProfessors() {
            const savedUsers = localStorage.getItem('schola.users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];

            users = users.filter(user => user.role !== 'professeur');
            users = users.concat(this.professors);

            localStorage.setItem('schola.users', JSON.stringify(users));
        }
    }
};
</script>

<template>
    <div class="prof-overview-container">
        <h3 class="title">Vue d'ensemble des professeurs ({{ filteredProfessors.length }})</h3>

        <!-- Filtre par faculté -->
        <div class="filter-container">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="">Toutes les facultés</option>
                <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                    {{ fac.nom }}
                </option>
            </select>
        </div>

        <!-- Tableau des professeurs -->
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
                        <template v-if="editingProfessorId === prof.id">
                            <td>{{ prof.nom }}</td>
                            <td>{{ prof.prenom }}</td>
                            <td class="td-editor">
                                <div v-for="(aff, index) in editProfessor.affectations" :key="index"
                                    class="affectation-editor">
                                    <select v-model="aff.nom" class="select-input select-editor">
                                        <option disabled value="">Faculté</option>
                                        <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                                            {{ fac.nom }}
                                        </option>
                                    </select>

                                    <select v-model="aff.annees" multiple
                                        class="select-input select-editor select-editor-an">
                                        <option v-for="an in [1, 2, 3]" :key="an" :value="an">
                                            {{ formatAnnee(an) }}
                                        </option>
                                    </select>

                                    <button @click="removeAffectation(index)" class="delete-btn bi-trash"></button>
                                </div>
                                <button @click="addAffectation" class="add-affectation-btn bi-plus-lg"></button>
                            </td>
                            <td>
                                <div class="crud-btns">
                                    <button @click="confirmEdit" class="save-btn bi-check-lg"></button>
                                    <button @click="cancelEdit" class="cancel-btn bi-x-lg"></button>
                                </div>
                            </td>
                        </template>

                        <template v-else>
                            <td>{{ prof.nom }}</td>
                            <td>{{ prof.prenom }}</td>
                            <td>{{ formatAffectations(prof.affectations) }}</td>
                            <td>
                                <button @click="startEdit(prof)" class="edit-btn bi-pencil"></button>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
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
    grid-column: span 3;
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
    height: 100%;
    background: transparent;
    font-size: 12px;
    padding: .5rem .3rem;
    border-radius: 5px;
    border: 1px solid var(--color-accent);
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

@media (max-width: 480px) {
    .td-editor {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
    }

    .affectation-editor {
        grid-column: span 1;
        height: auto;
        flex-direction: column;
        align-items: normal;
        justify-content: center;
    }

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