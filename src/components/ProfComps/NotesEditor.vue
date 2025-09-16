<script>
export default {
    props: ['course', 'currentUser'], // 👈 Ajout du currentUser pour vérifier le rôle
    data() {
        return {
            selectedCourse: {},
            isLocked: false
        }
    },
    watch: {
        course: {
            immediate: true,
            handler(newCourse) {
                this.selectedCourse = newCourse;
                this.loadLockState();
            }
        }
    },
    methods: {
        calculateFinalGrade(etudiant) {
            if (etudiant.noteTheorique !== null && etudiant.notePratique !== null) {
                etudiant.noteFinale = ((etudiant.noteTheorique / 12) * 12 + (etudiant.notePratique / 8) * 8).toFixed(1);
            }
        },
        validateGrades() {
            this.selectedCourse.notesValidees = true;
            this.isLocked = true;
            this.saveLockState();
            this.$emit('notify', 'Notes validées et verrouillées');
        },
        unlockGrades() {
            this.selectedCourse.notesValidees = false;
            this.isLocked = false;
            this.saveLockState();
            this.$emit('notify', 'Notes déverrouillées par l’admin');
        },
        saveLockState() {
            const lockKey = `schola.lockedNotes.${this.selectedCourse.id}`;
            localStorage.setItem(lockKey, JSON.stringify(true));
        },

        loadLockState() {
            const lockKey = `schola.lockedNotes.${this.selectedCourse.id}`;
            const locked = JSON.parse(localStorage.getItem(lockKey));
            this.isLocked = locked === true;
            this.selectedCourse.notesValidees = this.isLocked;
        }

    }
}
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
                    <tr v-for="etudiant in selectedCourse.etudiants_list" :key="etudiant.id">
                        <td>{{ etudiant.nom }} {{ etudiant.prenom }}</td>
                        <td class="td-editor">
                            <input v-model.number="etudiant.noteTheorique" type="number" min="0" max="12" step="0.5"
                                :disabled="isLocked" @input="calculateFinalGrade(etudiant)" class="editor"
                                placeholder="0">
                        </td>
                        <td class="td-editor">
                            <input v-model.number="etudiant.notePratique" type="number" min="0" max="8" step="0.5"
                                :disabled="isLocked" @input="calculateFinalGrade(etudiant)" class="editor"
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
            <button v-if="!isLocked" @click="validateGrades" class="valide-btn">
                Valider les notes
            </button>
            <span v-else class="locked-msg">
                <i class="bi-lock-fill"></i> Notes verrouillées
                <button v-if="currentUser.role === 'admin'" @click="unlockGrades" class="unlock-btn">
                    Déverrouiller
                </button>
            </span>
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
