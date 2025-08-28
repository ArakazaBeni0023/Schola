<script>
export default {
    data() {
        return {
            facultes: [],
            students: [],
            selectedFacultyFilter: '',
            editingStudentId: null,
            editedStudent: {},
        }
    },
    mounted() {
        const savedFacultes = localStorage.getItem('schola.facultes');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedFacultes) {
            this.facultes = JSON.parse(savedFacultes);
        }

        if (savedUsers) {
            const users = JSON.parse(savedUsers);
            this.students = users.filter(user => user.role === 'etudiant');
        }
        else {
            this.saveStudents();
        }
    },
    computed: {
        filteredStudents() {
            if (!this.selectedFacultyFilter) return this.students;
            const selectedFac = this.facultes.find(f => f.id === parseInt(this.selectedFacultyFilter));
            return this.students.filter(s => s.faculte === selectedFac?.nom);
        }
    },
    methods: {
        saveStudents() {
            const savedUsers = localStorage.getItem('schola.users');
            let users = savedUsers ? JSON.parse(savedUsers) : [];
            users = users.filter(user => user.role !== 'etudiant');
            users = users.concat(this.students);
            localStorage.setItem('schola.users', JSON.stringify(users));
        },
        startEdit(student) {
            this.editingStudentId = student.id;
            this.editedStudent = { ...student };
        },
        confirmEdit() {
            const index = this.students.findIndex(s => s.id === this.editingStudentId);
            if (index !== -1) {
                this.students.splice(index, 1, this.editedStudent);
                this.editingStudentId = null;
                this.editedStudent = {};
                this.saveStudents();
            }
        },
        cancelEdit() {
            this.editingStudentId = null;
            this.editedStudent = {};
        },
        formatAnnee(annee) {
            if (!annee) return '-';
            return `${annee}${annee === 1 ? ' ère' : ' ème'}`;
        }
    }
}
</script>

<template>
    <div class="student-overview-container">
        <h3 class="title">Vue d'ensemble des étudiants ({{ filteredStudents.length }})</h3>

        <!-- <button class="addt-btn bi-plus-lg" @click="showAddForm = true" v-if="!showAddForm"></button> -->
        <!-- Filtre par faculté -->
        <div class="student-overview-container-header">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="">Toutes les facultés</option>
                <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.id">
                    {{ faculte.nom }}
                </option>
            </select>
        </div>

        <!-- Tableau des étudiants -->
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <!-- <th>Email</th> -->
                        <th>Faculté</th>
                        <th>Année</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="etudiant in filteredStudents" :key="etudiant.id">
                        <!-- template pour modifier -->
                        <template v-if="editingStudentId === etudiant.id">
                            <td>{{ etudiant.nom }}</td>
                            <td>{{ etudiant.prenom }}</td>
                            <!-- <td>{{ etudiant.email }}</td> -->
                            <td>
                                <select v-model="editedStudent.faculte" class="select-input select-editor">
                                    <option disabled value="">Faculté</option>
                                    <option v-for="fac in facultes" :key="fac.id" :label="fac.nom">
                                        {{ fac.nom }} </option>
                                </select>
                            </td>
                            <td>
                                <input v-model.number="editedStudent.annee" type="number" min="1"
                                    placeholder="Durée (années)" class="select-editor">
                            </td>
                            <td>
                                <div class="crud-btns">
                                    <button @click="confirmEdit" class="save-btn bi-check-lg"></button>
                                    <button @click="cancelEdit" class="cancel-btn bi-x-lg"></button>
                                </div>
                            </td>
                        </template>
                        <!-- template pour visualiser -->
                        <template v-else>
                            <td>{{ etudiant.nom }}</td>
                            <td>{{ etudiant.prenom }}</td>
                            <!-- <td>{{ etudiant.email }}</td> -->
                            <td>{{ etudiant.faculte || '-' }}</td>
                            <td>
                                {{ formatAnnee(etudiant.annee) }}</td>
                            <td>
                                <div class="crud-btns">
                                    <button @click="startEdit(etudiant)" class="bi-pencil"></button>
                                    <!-- <button @click="deleteStudent(etudiant.id)" class="bi-trash"></button> -->
                                </div>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.student-overview-container {
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

.select-editor {
    /* all: unset; */
    /* font */
    /* background: var(--color-accent); */
    color: var(--color-text);
    background: transparent;
    font-size: 12px;
    padding: .5rem .3rem;
    border-radius: 5px;
    border: 1px solid var(--color-accent);

}

.select-editor:focus,
.select-editor::selection {
    border: none;
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
</style>