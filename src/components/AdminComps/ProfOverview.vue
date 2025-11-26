<script>
import AffectationModal from './ProfAffectationModal.vue';

export default {
    components: {
        AffectationModal
    },
    data() {
        return {
            facultes: [],
            professors: [],
            selectedFacultyFilter: '',
            isProfId: null,
            isUserPopover: false,
            modalConfig: {
                show: false,
                professor: null,
                affectationIndex: null,
                mode: 'add'
            }
        };
    },
    mounted() {
        this.loadData();
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
        loadData() {
            const savedFacultes = localStorage.getItem('schola.facultes');
            const savedUsers = localStorage.getItem('schola.users');

            if (savedFacultes) this.facultes = JSON.parse(savedFacultes);
            if (savedUsers) {
                const users = JSON.parse(savedUsers);
                this.professors = users.filter(user => user.role === 'professeur');
            }
        },

        formatAnnee(annee) {
            return `${annee} ${annee === 1 ? 'ère' : 'ème'}`;
        },

        formatAffectations(affectations) {
            if (!affectations || affectations.length === 0) return '-';
            return affectations.map(a => {
                const annees = a.annees
                    .sort((x, y) => x.annee - y.annee)
                    .map(an => {
                        const cours = an.cours?.map(c => typeof c === 'object' ? c.nom : c).join(', ') || '-';
                        return `${this.formatAnnee(an.annee)} (${cours})`;
                    }).join(', ');
                return `${a.nom} [${annees}]`;
            }).join(' • ');
        },

        openModal(prof, index = null) {
            this.modalConfig = {
                show: true,
                professor: JSON.parse(JSON.stringify(prof)),
                affectationIndex: index,
                mode: index !== null ? 'edit' : 'add'
            };
            this.isUserPopover = null;
        },

        closeModal() {
            this.modalConfig = {
                show: false,
                professor: null,
                affectationIndex: null,
                mode: 'add'
            };
        },

        handleAffectationSaved(updatedProfessor) {
            // Mettre à jour le professeur dans la liste
            const profIndex = this.professors.findIndex(p => p.id === updatedProfessor.id);
            if (profIndex !== -1) {
                this.professors[profIndex] = updatedProfessor;
            }

            this.saveToLocalStorage();
            this.closeModal();
        },

        saveToLocalStorage() {
            const savedUsers = localStorage.getItem('schola.users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];

            users = users.filter(user => user.role !== 'professeur');
            users = users.concat(this.professors);

            localStorage.setItem('schola.users', JSON.stringify(users));
        },

        deleteAffectation(professorId, index) {
            if (!confirm("Voulez-vous supprimer cette affectation ?")) return;

            const profIndex = this.professors.findIndex(p => p.id === professorId);
            if (profIndex !== -1 && this.professors[profIndex].affectations) {
                this.professors[profIndex].affectations.splice(index, 1);
                this.saveToLocalStorage();
            }

            this.isProfId = null;
        },

        dropdownActions(prof) {
            this.isProfId = prof.id;
        },

        closeDropdownActions() {
            this.isProfId = null;
        },

        showPopover(index) {
            if (this.isUserPopover === index) {
                this.isUserPopover = null;
            }
            else {
                this.isUserPopover = index;
            }
        },

        closePopover() {
            this.isUserPopover = null;
        }
    }
};
</script>

<template>
    <div class="prof-overview-container">
        <div class="filter-container">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="">Toutes les facultés</option>
                <option v-for="fac in facultes" :key="fac.id" :value="fac.nom">
                    {{ fac.nom }}
                </option>
            </select>
        </div>

        <div class="desktop-view table-container">
            <div v-if="filteredProfessors.length === 0" class="no-data">
                Aucun professeur trouvé
            </div>
            <table v-else>
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
                                <button class="dropdown-toggle" v-if="isProfId === prof.id"
                                    @click="closeDropdownActions()">Fermer</button>
                                <button class="dropdown-toggle" v-else @click="dropdownActions(prof)">Gérer</button>
                                <div class="dropdown-menu" v-if="isProfId === prof.id">
                                    <button v-for="(aff, i) in prof.affectations"
                                        class="dropdown-item dropdown-edit-btn bi-pencil" :key="i"
                                        @click="openModal(prof, i)" title="Modifier">
                                        Modifier {{ aff.nom }}
                                    </button>
                                    <button v-for="(aff, i) in prof.affectations"
                                        class="dropdown-item dropdown-delete-btn bi-trash" :key="'del-' + i"
                                        @click="deleteAffectation(prof.id, i)" title="Supprimer">
                                        Supprimer {{ aff.nom }}
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mobile-view">
            <div v-if="filteredProfessors.length === 0" class="no-data">
                Aucun professeur trouvé
            </div>
            <div class="user-cards-container">
                <div v-for="(prof, index) in filteredProfessors" :key="prof.id" class="user-card">
                    <div class="user-main-infos">
                        <h5>{{ prof.nom + ' ' + prof.prenom }}</h5>
                        <p>{{ formatAffectations(prof.affectations) }}</p>
                    </div>
                    <button class="bi-three-dots-vertical" @click="showPopover(index)"></button>
                    <div v-show="isUserPopover === index" class="popover-content">
                        <div class="item" @click="openModal(prof); closePopover();">
                            <i class="bi bi-plus"></i>
                            Ajouter une affectation
                        </div>
                        <div v-for="(aff, i) in prof.affectations" class="item" :key="i"
                            @click="openModal(prof, i); closePopover();">
                            <i class="bi bi-pencil"></i>
                            Modifier {{ aff.nom }}
                        </div>
                        <div v-for="(aff, i) in prof.affectations" class="item" :key="'del-' + i"
                            @click="deleteAffectation(prof.id, i); closePopover();">
                            <i class="bi bi-trash"></i>
                            Supprimer {{ aff.nom }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AffectationModal :show="modalConfig.show" :professor="modalConfig.professor"
            :affectation-index="modalConfig.affectationIndex" :mode="modalConfig.mode" :facultes="facultes"
            @save="handleAffectationSaved" @close="closeModal" />
    </div>
</template>

<style scoped>
.prof-overview-container {
    gap: 1rem;
}

/* .filter-container {
    margin-bottom: 1rem;
}

*/
.select-input,
.select-input option {
    color: var(--color-text);
}

.select-input::selection,
.select-input option::selection {
    border: none;
}

/* Table Styles */
.table-container {
    width: 100%;
    overflow-x: auto;
}

.table-container table {
    width: 100%;
    border-collapse: collapse;
}

.table-container th,
.table-container td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
}

.table-container th {
    background: var(--color-primary);
    color: var(--color-text-light);
    font-weight: 600;
}

.table-container tr:hover {
    background: var(--hover-lw);
}

.no-data {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
    font-style: italic;
}

/* Actions */
.actions-td {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.add-aff-btn {
    all: unset;
    padding: 0.4rem 0.6rem;
    border-radius: 5px;
    background: var(--color-primary);
    color: var(--color-text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
}

.add-aff-btn:hover {
    background: var(--color-primary-dark);
}

/* Dropdown Styles */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-toggle {
    all: unset;
    background: var(--hover-lw);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.dropdown-toggle:hover {
    background: var(--color-primary);
    color: var(--color-text-light);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 5px;
    padding: 0.5rem;
    min-width: 150px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
    all: unset;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 12px;
    border-radius: 3px;
    transition: all 0.3s ease;
    width: 100%;
}

.dropdown-edit-btn {
    color: var(--color-success);
    background: var(--color-success-bg);
    margin-bottom: 0.2rem;
}

.dropdown-edit-btn:hover {
    background: var(--color-success);
    color: var(--color-text-light);
}

.dropdown-delete-btn {
    color: var(--color-danger);
    background: var(--color-danger-bg);
}

.dropdown-delete-btn:hover {
    background: var(--color-danger);
    color: var(--color-text-light);
}

/* Mobile View */
.mobile-view {
    display: none;
}

.user-cards-container {
    display: flex;
    flex-direction: column;
    /* padding: 1rem; */
}

.user-cards-container .user-card {
    background: var(--color-surface);
    border-bottom: 1px solid var(--hover-lw);
    position: relative;
    cursor: default;
}

.user-cards-container .user-card:hover {
    background: inherit;
}

.user-cards-container .user-card .user-main-infos {
    width: 90%;
}

.user-cards-container .user-card .user-main-infos h5 {
    color: var(--color-text);
    font-size: 14px;
}

.user-cards-container .user-card .user-main-infos p {
    color: var(--color-text-secondary);
}

.user-cards-container .user-card .bi-three-dots-vertical {
    all: unset;
    width: 35px;
    height: 35px;
    color: var(--color-text);
    text-align: center;
    border-radius: 50px;
    transition: background 0.3s ease;
    cursor: pointer;
}

.user-cards-container .user-card .bi-three-dots-vertical:hover {
    background: var(--hover-lw);
}

.popover-content {
    position: absolute;
    top: 80%;
    right: 0;
    z-index: 1000;
    width: 260px;
    min-width: 180px;
    box-shadow: var(--shadow);
}


/* Responsive */
@media (max-width: 768px) {
    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }

    .prof-overview-container {
        padding: 0.5rem;
    }
}
</style>