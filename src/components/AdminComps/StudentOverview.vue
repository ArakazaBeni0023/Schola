<script>
import StudentModal from './StudentAffectationModal.vue';

export default {
    components: {
        StudentModal
    },
    data() {
        return {
            facultes: [],
            students: [],
            selectedFacultyFilter: '',
            isUserPopover: null,
            modalConfig: {
                show: false,
                student: null,
                mode: 'edit'
            }
        }
    },
    mounted() {
        this.loadData();
    },
    computed: {
        filteredStudents() {
            if (!this.selectedFacultyFilter) return this.students;
            return this.students.filter(s => s.faculte === this.selectedFacultyFilter);
        },
        facultesOptions() {
            return this.facultes.map(f => ({ value: f.nom, text: f.nom }));
        }
    },
    methods: {
        loadData() {
            const savedFacultes = localStorage.getItem('schola.facultes');
            const savedUsers = localStorage.getItem('schola.users');

            if (savedFacultes) {
                this.facultes = JSON.parse(savedFacultes);
            }

            if (savedUsers) {
                const users = JSON.parse(savedUsers);
                this.students = users.filter(user => user.role === 'etudiant');
            }
        },

        saveStudents() {
            const savedUsers = localStorage.getItem('schola.users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];
            users = users.filter(user => user.role !== 'etudiant');
            users = users.concat(this.students);
            localStorage.setItem('schola.users', JSON.stringify(users));
        },

        openModal(student) {
            this.modalConfig = {
                show: true,
                student: JSON.parse(JSON.stringify(student)),
                mode: 'edit'
            };
            this.isUserPopover = null;
        },

        closeModal() {
            this.modalConfig = {
                show: false,
                student: null,
                mode: 'edit'
            };
        },

        handleStudentSaved(updatedStudent) {
            const index = this.students.findIndex(s => s.id === updatedStudent.id);
            if (index !== -1) {
                this.students.splice(index, 1, updatedStudent);
                this.saveStudents();
            }
            this.closeModal();
        },

        formatAnnee(annee) {
            if (!annee) return '-';
            return `${annee}${annee === 1 ? 'ère' : 'ème'}`;
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
}
</script>

<template>
    <div class="student-overview-container">
        <!-- Filtre par faculté -->
        <div class="student-overview-container-header">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="">Toutes les facultés</option>
                <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.nomFac">
                    {{ faculte.nomFac }}
                </option>
            </select>
        </div>

        <!-- Tableau des étudiants -->
        <div class="desktop-view table-container">
            <div v-if="filteredStudents.length === 0" class="no-data">
                Aucun étudiant trouvé
            </div>
            <table v-else>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Faculté</th>
                        <th>Année</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="etudiant in filteredStudents" :key="etudiant.id">
                        <td>{{ etudiant.nom }}</td>
                        <td>{{ etudiant.prenom }}</td>
                        <td>{{ etudiant.faculte || '-' }}</td>
                        <td>{{ formatAnnee(etudiant.annee) }}</td>
                        <td class="actions-td">
                            <button @click="openModal(etudiant)" class="edit-btn bi-pencil"
                                :title="etudiant.faculte ? 'Modifier' : 'Ajouter une affectation'">
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Vue mobile -->
        <div class="mobile-view">
            <div v-if="filteredStudents.length === 0" class="no-data">
                Aucun étudiant trouvé
            </div>
            <div class="user-card" v-for="(etudiant, index) in filteredStudents" :key="etudiant.id">
                <div class="user-main-infos">
                    <h4>{{ etudiant.nom + ' ' + etudiant.prenom }}</h4>
                    <p>{{ etudiant.faculte || 'Non affecté' }} • {{ formatAnnee(etudiant.annee) }}</p>
                </div>
                <button class="bi-three-dots-vertical" @click="showPopover(index)"></button>
                <div v-show="isUserPopover === index" class="popover-content">
                    <div @click="openModal(etudiant); closePopover();" class="item"
                        :title="etudiant.faculte ? 'Modifier' : 'Ajouter une affectation'">
                        <i class="bi bi-pencil"></i>
                        {{ etudiant.faculte ? 'Modifier' : 'Affecter' }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Component -->
        <StudentModal :show="modalConfig.show" :student="modalConfig.student" :facultes="facultes"
            @save="handleStudentSaved" @close="closeModal" />
    </div>
</template>

<style scoped>
.student-overview-container {
    gap: 1rem;
}

.select-input {
    width: 100%;
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

.edit-btn {
    all: unset;
    padding: 0.4rem 0.6rem;
    border-radius: 5px;
    background: var(--color-primary);
    color: var(--color-text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 12px;
}

.edit-btn:hover {
    background: var(--color-primary-dark);
}

/* Mobile View */
.mobile-view {
    display: none;
}

.user-card {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    background: var(--color-surface);
    border-bottom: 1px solid var(--hover-lw);
    position: relative;
    cursor: default;
    padding: 0.5rem 0rem;
}

.user-card:hover {
    background: inherit;
}

.user-card .user-main-infos {
    width: fit-content;
}

.user-card .user-main-infos h4 {
    color: var(--color-text);
}

.user-card .user-main-infos p {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

.user-card .bi-three-dots-vertical {
    all: unset;
    cursor: pointer;
    text-align: center;
    width: 40px;
    height: 40px;
    border-radius: 50px;
    transition: background 0.5s ease;
}

.user-card .bi-three-dots-vertical:hover {
    background: var(--hover-lw);
}

.popover-content {
    position: absolute;
    top: 80%;
    right: 0;
    z-index: 1000;
    width: 160px;
    min-width: 80px;
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

    .student-overview-container {
        padding: 0.5rem;
    }
}

@media (max-width: 480px) {
    .popover-content {
        right: 0;
        left: auto;
        min-width: 140px;
    }
}
</style>