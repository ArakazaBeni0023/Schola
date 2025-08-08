<script>
export default {
    props: {
        // selectedCourse: {
        //     type: Array,
        //     required: true
        // }
    },

    data() {
        return {
            course: {
                id: 1,
                nom: 'Programmation Web',
                classe: 'L1 Informatique',
                etudiants: 25,
                notesValidees: false,
                etudiants_list: [
                    { id: 1, nom: 'Nitegeka', prenom: 'Jean', noteTheorique: null, notePratique: null, noteFinale: null },
                    { id: 2, nom: 'Mahoro', prenom: 'Sophie', noteTheorique: null, notePratique: null, noteFinale: null },
                ]
            },
            selectedCourse: []
        }
    },

    methods: {
        getData() {
            this.selectedCourse = this.course;
        },
        calculateFinalGrade(etudiant) {
            if (etudiant.noteTheorique !== null && etudiant.notePratique !== null) {
                etudiant.noteFinale = ((etudiant.noteTheorique / 12) * 12 + (etudiant.notePratique / 8) * 8).toFixed(1)
            }
        },
        validateGrades() {
            this.selectedCourse.notesValidees = true;
            this.addNotification('Notes validées et verrouillées')
        },
    },

    mounted() {
        this.getData();
    }
}
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Saisie des notes - {{ selectedCourse.nom }}</h3>
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
                                :disabled="selectedCourse.notesValidees" @input="calculateFinalGrade(etudiant)"
                                class="editor" placeholder="0">
                        </td>
                        <td class="td-editor">
                            <input v-model.number="etudiant.notePratique" type="number" min="0" max="8" step="0.5"
                                :disabled="selectedCourse.notesValidees" @input="calculateFinalGrade(etudiant)"
                                class="editor" placeholder="0">
                        </td>
                        <td>
                            {{ etudiant.noteFinale || '-' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <button v-if="!selectedCourse.notesValidees" @click="validateGrades" class="valide-btn">
                Valider les notes</button>
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