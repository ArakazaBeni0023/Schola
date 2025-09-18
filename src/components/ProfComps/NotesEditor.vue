<script>
export default {
    props: ['course', 'currentUser'],
    data() {
        return {
            selectedCourse: {},
            notesIsValide: null,
        };
    },
    watch: {
        course: {
            immediate: true,
            handler(newCourse) {
                this.selectedCourse = newCourse;
                this.ensureNotesTable();
                this.loadExistingNotes();
            }
        }
    },
    methods: {
        ensureNotesTable() {
            if (!localStorage.getItem('schola.notes')) {
                localStorage.setItem('schola.notes', JSON.stringify([]));
            }
        },
        loadExistingNotes() {
            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const courseNote = allCourses.find(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            this.notesIsValide = courseNote?.notesValidees || false;

            if (courseNote && Array.isArray(this.selectedCourse.etudiants_list)) {
                this.selectedCourse.etudiants_list.forEach(etudiant => {
                    const note = courseNote.etudiants.find(n => n.etudiantId === etudiant.id);
                    if (note) {
                        etudiant.noteTheorique = note.notes.theorique;
                        etudiant.notePratique = note.notes.pratique;
                        etudiant.noteFinale = note.notes.finale;
                    }
                });
            }
        },
        calculateFinalGrade(etudiant) {
            if (etudiant.noteTheorique != null && etudiant.notePratique != null) {
                etudiant.noteFinale = (
                    (etudiant.noteTheorique / 12) * 12 +
                    (etudiant.notePratique / 8) * 8
                ).toFixed(1);
            } else {
                etudiant.noteFinale = null;
            }
        },
        saveCourseNotes() {
            if (!Array.isArray(this.selectedCourse.etudiants_list)) return;
            if (!this.currentUser?.id) return;

            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const index = allCourses.findIndex(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            const etudiants = this.selectedCourse.etudiants_list.map(etudiant => ({
                etudiantId: etudiant.id,
                notes: {
                    theorique: etudiant.noteTheorique ?? null,
                    pratique: etudiant.notePratique ?? null,
                    finale: etudiant.noteFinale ?? null
                }
            }));

            const newCourseNote = {
                faculte: this.selectedCourse.faculte,
                annee: this.selectedCourse.annee,
                coursId: this.selectedCourse.coursId,
                professeurId: this.currentUser.id,
                notesValidees: false,
                dateDerniereModification: new Date().toISOString(),
                etudiants
            };

            if (index !== -1) {
                allCourses[index] = newCourseNote;
            } else {
                allCourses.push(newCourseNote);
            }

            localStorage.setItem('schola.notes', JSON.stringify(allCourses));
            this.$emit('notify', 'Notes enregistrées');
        },
        validateGrades() {
            this.saveCourseNotes();

            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const index = allCourses.findIndex(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            if (index !== -1) {
                allCourses[index].notesValidees = true;
                localStorage.setItem('schola.notes', JSON.stringify(allCourses));
                this.notesIsValide = true;
                this.selectedCourse.notesValidees = true;
                this.$emit('notify', 'Notes validées et verrouillées');
            }
        }
    }
};
</script>


<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Saisie des notes - {{ selectedCourse.nom }} ({{ selectedCourse.annee }}ᵉ année)</h3>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Étudiant</th>
                        <th>Note Théorique (/12)</th>
                        <th>Note Pratique (/8)</th>
                        <th>Note Finale (/20)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="etudiant in selectedCourse.etudiants_list || []" :key="etudiant.id">
                        <td>{{ etudiant.nom }} {{ etudiant.prenom }}</td>
                        <td class="td-editor">
                            <input v-model.number="etudiant.noteTheorique" type="number" min="0" max="12" step="0.5"
                                :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)" class="editor"
                                placeholder="0">
                        </td>
                        <td class="td-editor">
                            <input v-model.number="etudiant.notePratique" type="number" min="0" max="8" step="0.5"
                                :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)" class="editor"
                                placeholder="0">
                        </td>
                        <td>
                            {{ etudiant.noteFinale || '-' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <button v-if="!notesIsValide" class="valide-btn" @click="saveCourseNotes">
                Enregistrer les notes
            </button>
            <button v-if="!notesIsValide" @click="validateGrades" class="valide-btn">
                Valider les notes
            </button>
            <span v-else class="locked-msg"><i class="bi-lock-fill"></i> Notes validées et verrouillées</span>
        </div>
    </div>
</template>


<style scoped>
.td-editor {
    padding: 0 .5rem;
}

.editor {
    width: 100%;
    padding: .5rem .2rem;
    border: none;
}

.valide-btn {
    padding: .8rem 2rem;
    background: var(--color-primary-dark);
    color: var(--color-text-light);
    font-family: "Poppins", sans-serif;
    border: none;
    border-radius: 50px;
    font-size: 11px;
    transition: all .5s ease;
    cursor: pointer;
}

.valide-btn:hover {
    background: var(--color-primary);
}

.locked-msg {
    background: var(--color-success-bg);
    color: var(--color-success);
    padding: .5rem;
    border: 1px solid var(--color-success);
    font-size: 12px;
    display: block;
    margin: auto;
    border-radius: 5px;
}

.locked-msg i {
    margin-right: .5rem;
}
</style>
