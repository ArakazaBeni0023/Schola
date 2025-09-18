<script>
export default {
    data() {
        return {
            facultes: [],
            newCourseName: '',
            newCourseDuration: 3,
            newCourseAnneeEtude: 1,
            editingCourseId: null,
            editedCourseName: '',
            editedCourseDuration: 3,
            editedCourseAnneeEtude: 1,
            isAddingCourse: false,
            selectedFaculteId: null,
        };
    },
    mounted() {
        const savedFacultes = localStorage.getItem('schola.facultes');
        if (savedFacultes) {
            this.facultes = JSON.parse(savedFacultes);
        } else {
            this.facultes = [
                { id: 1, nom: 'Faculté de Sciences', courses: [] },
                { id: 2, nom: 'Faculté de Lettres', courses: [] },
            ];
            this.saveFacultes();
        }
    },
    methods: {
        saveFacultes() {
            localStorage.setItem('schola.facultes', JSON.stringify(this.facultes));
        },
        addCourse() {
            const faculte = this.facultes.find(f => f.id === this.selectedFaculteId);
            if (faculte && this.newCourseName.trim()) {
                faculte.courses.push({
                    id: Date.now(),
                    nom: this.newCourseName.trim(),
                    duree: this.newCourseDuration,
                    anneeEtude: this.newCourseAnneeEtude
                });
                this.newCourseName = '';
                this.newCourseDuration = 3;
                this.newCourseAnneeEtude = 1;
                this.isAddingCourse = false;
                this.saveFacultes();
            }
        },
        startEditing(course) {
            this.editingCourseId = course.id;
            this.editedCourseName = course.nom;
            this.editedCourseDuration = course.duree;
            this.editedCourseAnneeEtude = course.anneeEtude || 1;
        },
        confirmEdit(faculteId) {
            const faculte = this.facultes.find(f => f.id === faculteId);
            if (faculte) {
                const course = faculte.courses.find(c => c.id === this.editingCourseId);
                if (course && this.editedCourseName.trim()) {
                    course.nom = this.editedCourseName.trim();
                    course.duree = this.editedCourseDuration;
                    course.anneeEtude = this.editedCourseAnneeEtude;
                    this.editingCourseId = null;
                    this.editedCourseName = '';
                    this.editedCourseDuration = 3;
                    this.editedCourseAnneeEtude = 1;
                    this.saveFacultes();
                }
            }
        },

        cancelEdit() {
            this.editingCourseId = null;
            this.editedCourseName = '';
            this.editedCourseDuration = 3;
        },
    },
};
</script>

<template>
    <div class="course-management-container">
        <h3 class="title">Gestion des cours</h3>

        <div class="courses-container">
            <div v-for="faculte in facultes" :key="faculte.id" class="course">
                <div class="course-header">
                    <h4>{{ faculte.nom }}</h4>
                    <button class="add-btn bi-plus" @click="isAddingCourse = true; selectedFaculteId = faculte.id"
                        v-if="isAddingCourse === false || selectedFaculteId === faculte.id"></button>

                </div>
                <!-- formulaire d'ajout -->
                <div v-if="isAddingCourse && selectedFaculteId === faculte.id" class="course-form add-course-form">
                    <input v-model="newCourseName" placeholder="Nom du cours..." />
                    <input type="number" v-model="newCourseDuration" min="1" placeholder="Durée (semaines)" />
                    <input type="number" v-model="newCourseAnneeEtude" min="1" max="3" placeholder="Année d'étude" />
                    <div class="checking-btns">
                        <button @click="isAddingCourse = false" class="cancel-btn bi-x-lg"></button>
                        <button @click="addCourse" class="save-btn bi-check-lg"></button>
                    </div>
                </div>
                <!-- formulaire d'édition -->
                <div class="course-counts">
                    <div v-for="course in faculte.courses" :key="course.id" class="counter-items">
                        <div v-if="editingCourseId === course.id" class="course-form modif-course-form">
                            <input v-model="editedCourseName" />
                            <input type="number" v-model="editedCourseDuration" min="1" />
                            <input type="number" v-model="editedCourseAnneeEtude" min="1" max="3"
                                placeholder="Année d'étude" />

                            <div class="checking-btns">
                                <button @click="cancelEdit" class="cancel-btn bi-x-lg"></button>
                                <button @click="confirmEdit(faculte.id)" class="save-btn bi-check-lg"></button>
                            </div>
                        </div>
                        <div v-else>
                            {{ course.nom }} ({{ course.duree }} semaines, année {{ course.anneeEtude }})
                            <div class="crud-btns">
                                <button class="edit bi-pencil" @click="startEditing(course)"></button>
                                <button class="delete bi-trash" @click="deleteCourse(faculte.id, course.id)"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.course-management-container {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    gap: .5rem;
}

.courses-container {
    /* display: grid; */
    /* grid-template-columns: repeat(4, 1fr); */
    /* grid-template-rows: auto; */
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.course {
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

.course .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-block: .0rem 1rem;
}

.course .course-header .add-btn {
    padding: .3rem .4rem;
    border-radius: 5px;
}

.course .cursus {
    background: var(--color-primary);
    color: var(--color-text-light);
    border-radius: 50px;
    padding: 0.5rem 0.8rem;
    width: fit-content;
    font-size: 14px;
    margin-bottom: .5rem;
}

.course .cursus .bi {
    margin-right: 0.5rem;
}

.course-form {
    display: flex;
    flex-direction: column;
    margin-top: 1.5rem;
    gap: .5rem;
}

.add-course-form {
    width: 40%;
}


/* .modif-course-form {width: 100%;} */

.course-form input {
    all: unset;
    font-size: 12px;
    padding: 0.5rem;
    background: transparent;
    border: 1px solid var(--color-primary);
    border-radius: 5px;
}

.course-form .add-btn {
    border-radius: 5px;
}

.course .course-counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.course .course-counts .counter-items {
    border: 1px solid var(--color-primary);
    width: fit-content;
    border-radius: 5px;
    font-size: 12px;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
}

.course .course-counts .counter-items:hover .crud-btns {
    opacity: 1;
}

.course .course-counts .counter-items .crud-btns {
    position: absolute;
    bottom: 5%;
    right: 1%;
    display: flex;
    gap: 5px;
    opacity: 0;
    transition: opacity .5s ease;
}

.course .course-counts .counter-items .crud-btns button {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: .2rem .4rem;
    border-radius: 5px;
    font-size: 12px;
    cursor: pointer;
    transition: all .5s ease;
}

.course .course-counts .counter-items .crud-btns button:hover {
    background: var(--color-primary-dark);
}

@media (max-width:768px) {
    .courses-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width:468px) {
    .courses-container {
        grid-template-columns: repeat(2, 1fr);
    }

    .course-management-container-header {
        flex-direction: column;
        align-items: normal;
    }

    .add-btn {
        text-align: center;
    }
}
</style>