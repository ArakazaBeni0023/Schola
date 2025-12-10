<script>
export default {
    data() {
        return {
            facultes: [],
            students: [],
            newFacultyName: '',
            selectedFacultyFilter: '',
            editingFacultyId: null,
            editedFacultyName: '',
            newFacultyDuration: 3,
            editedFacultyDuration: 3,
        }
    },
    mounted() {
        const savedFacultes = localStorage.getItem('schola.facultes');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedUsers) {
            const users = JSON.parse(savedUsers);
            this.students = users.filter(u => u.role === 'etudiant');
        }
        if (savedFacultes) {
            this.facultes = JSON.parse(savedFacultes);
        } else {
            this.saveFacultes();
        }
    },
    methods: {
        saveFacultes() {
            localStorage.setItem('schola.facultes', JSON.stringify(this.facultes));
        },

        addFaculty() {
            if (this.newFacultyName.trim()) {
                this.facultes.push({
                    id: 'fc_' + Date.now(),
                    nomFac: this.newFacultyName.trim(),
                    duree: this.newFacultyDuration,
                    courses: [],
                });
                this.newFacultyName = '';
                this.newFacultyDuration = 3;
                this.saveFacultes();
            }
        },

        deleteFaculty(id) {
            if (!confirm("Supprimer cette faculté ?")) return;
            this.facultes = this.facultes.filter(f => f.id !== id);
            this.saveFacultes();
        },

        startEditing(faculty) {
            this.editingFacultyId = faculty.id;
            this.editedFacultyName = faculty.nom;
            this.editedFacultyDuration = faculty.duree;
        },

        confirmEdit() {
            const faculty = this.facultes.find(f => f.id === this.editingFacultyId);
            if (faculty && this.editedFacultyName.trim()) {
                faculty.nom = this.editedFacultyName.trim();
                faculty.duree = this.editedFacultyDuration;
                this.editingFacultyId = null;
                this.editedFacultyName = '';
                this.editedFacultyDuration = 3;
                this.saveFacultes();
            }
        },

        cancelEdit() {
            this.editingFacultyId = null;
            this.editedFacultyName = '';
        },

        getStudentCountByYear(fac) {
            const counts = {};
            this.students.forEach(student => {
                if (student.faculte === fac) {
                    const year = student.annee || 1;
                    counts[year] = (counts[year] || 0) + 1;
                }
            });
            return counts;
        },

        formatAnnee(annee) {
            if (!annee) return '-';
            return `${annee}${annee === 1 ? ' ère' : ' ème'}`;
        }
    }
}
</script>

<template>
    <div class="faculty-management-container">
        <div class="faculty-management-container-header">
            <input v-model.trim="newFacultyName" type="text" placeholder="Nom de la faculté" class="input">
            <input v-model.number="newFacultyDuration" type="number" min="1" placeholder="Durée (années)" class="input"
                v-show="newFacultyName != ''">
            <button @click="addFaculty" v-show="newFacultyName != ''" class="add-btn"><i
                    class="bi-plus-lg"></i></button>
        </div>

        <div class="faculties-container">
            <div v-for="faculte in facultes" :key="faculte.id" class="faculty">
                <div v-if="editingFacultyId === faculte.id" class="faculty-editor">
                    <input v-model.trim="editedFacultyName" type="text" class="input">
                    <input v-model.number="editedFacultyDuration" type="number" min="1" class="input"
                        placeholder="Durée (années)">
                    <div class="checking-btns">
                        <button @click="cancelEdit" class="cancel-btn bi-x-lg"></button>
                        <button @click="confirmEdit" class="save-btn bi-check-lg"></button>
                    </div>
                </div>
                <div v-else class="faculty-view">
                    <h4>{{ faculte.nomFac }}</h4>
                    <span class="cursus">
                        <i class="bi bi-calendar-range-fill"></i> {{ faculte.duree }} ans
                    </span>
                    <div class="student-counts">
                        <div v-for="(count, an) in getStudentCountByYear(faculte.nom)" :key="count"
                            class="counter-items">
                            <span class="left-part">{{ formatAnnee(an) }}</span>
                            <div class="right-part">
                                <p>
                                    <i class="bi-people-fill"></i>
                                    {{ count === 1 ? 'Étudiant' : 'Étudiants' }}
                                </p>
                                <p><strong>{{ count }} </strong></p>
                            </div>
                        </div>
                        <div class="counter-items" v-if="totalEdutiantsFaculte">
                            <span class="left-part">Total</span>
                            <div class="right-part">
                                <p>
                                    <i class="bi-people-fill"></i>
                                    {{ count === 1 ? 'Étudiant' : 'Étudiants' }}
                                </p>
                                <p><strong>{{ count }} </strong></p>
                            </div>
                        </div>
                    </div>
                    <div class="crud-btns">
                        <button @click="startEditing(faculte)" class="edit-btn bi-pencil"></button>
                        <button @click="deleteFaculty(faculte.id)" class="delete-btn bi-trash"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.faculty-management-container {
    gap: .5rem;
}

.faculty-management-container-header {
    gap: .5rem;
    padding: 0;
    flex-wrap: wrap;
}

.faculty-management-container-header .input {
    all: unset;
    background: var(--hover-lw);
    border: 2px solid #00000000;
    padding: .8rem;

    flex-grow: 1;
    border-radius: 7px;
    font-size: 12px;
    transition: all .5s ease;
}

.faculty-management-container-header .input:focus {
    border: 2px solid var(--color-secondary);
}

.add-btn {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: .8rem 1rem;
    border-radius: 5px;
    font-size: 12px;
    transition: all .5s ease;
    cursor: pointer;
}

.add-btn:hover {
    background: var(--color-primary-dark);
}

.faculties-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: .5rem;
    padding-block-start: 1rem;
}

.faculties-container .faculty:hover .crud-btns {
    opacity: 1;
}

.faculty {
    grid-column: span 1;
    position: relative;
    background: var(--hover-lw);
    border: 1px solid var(--color-secondary);
    padding: .5rem;
    border-radius: 8px;

    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100%;
    box-sizing: border-box;
}

.faculty .faculty-view {
    display: flex;
    flex-direction: column;
}

.faculty .faculty-view h4 {
    margin-top: .5rem;
}

.faculty .faculty-view .cursus {
    background: var(--color-primary);
    color: var(--color-text-light);
    border-radius: 50px;
    padding: 0.5rem 0.8rem;
    width: fit-content;
    font-size: 14px;
}

.faculty .faculty-view .cursus .bi {
    margin-right: 0.5rem;
}

.faculty .faculty-view .student-counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: .5rem;
}

.faculty .faculty-view .student-counts .counter-items {
    border: 1px solid var(--color-primary);
    width: fit-content;
    border-radius: 50px;
    font-size: 12px;
    display: flex;
    align-items: center;
    overflow: hidden;
}

.faculty .faculty-view .student-counts .counter-items .left-part {
    background: var(--color-primary);
    color: var(--color-text-light);
    height: 100%;
    text-align: center;
    padding: 0.5rem;
    border-bottom-right-radius: 10px;
}

.faculty .faculty-view .student-counts .counter-items .right-part {
    padding-inline: .2rem .8rem;
}

.faculty .faculty-view .student-counts .counter-items .bi {
    margin-right: .5rem;
}

/* --------- */

.faculty .faculty-editor {
    display: flex;
    gap: .5rem;
    flex-direction: column;
}

.faculty .faculty-editor .input {
    all: unset;
    border: 1px solid var(--color-accent);
    padding: .6rem;
    flex-grow: 1;
    border-radius: 4px;
    font-size: 12px;
    transition: all .5s ease;
}

.faculty .faculty-editor .input:hover {
    border: 1px solid var(--color-primary);
}

.faculty .faculty-editor .checking-btns {
    display: flex;
    gap: 2rem;
    justify-content: space-between;
}

.faculty .faculty-editor .checking-btns button {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: .5rem;
    border-radius: 50px;
    font-size: 12px;
    cursor: pointer;
    transition: all .5s ease;
    width: 50%;
    text-align: center;
}

.faculty .faculty-editor .checking-btns .cancel-btn {
    background-color: transparent;
    border: 1px solid var(--color-primary);
    color: var(--color-text);
}

.faculty .faculty-editor .checking-btns .cancel-btn:hover {
    background: var(--color-accent);
}

.faculty .faculty-editor .checking-btns .save-btn:hover {
    background: var(--color-primary-dark);
}

.faculty .crud-btns {
    position: absolute;
    bottom: 5%;
    right: 5%;
    display: flex;
    gap: .5rem;
    opacity: 0;
    transition: opacity .5s ease;
}

.faculty .crud-btns button {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: .2rem .4rem;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    transition: all .5s ease;
}

.faculty .crud-btns button:hover {
    background: var(--color-primary-dark);
}

@media (max-width:768px) {
    .faculties-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width:468px) {
    .faculties-container {
        grid-template-columns: repeat(2, 1fr);
    }

    .faculty-management-container-header {
        flex-direction: column;
        align-items: normal;
    }

    .add-btn {
        text-align: center;
    }
}
</style>