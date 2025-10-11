<script>
export default {
    name: 'StudentGrades',
    data() {
        return {
            currentUser: null,
            facultes: [],
            notes: [],
        };
    },
    computed: {
        studentGrades() {
            if (!this.currentUser) return [];

            const facultes = JSON.parse(localStorage.getItem('schola.facultes')) || [];
            const notesData = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const fac = facultes.find(f => f.nom === this.currentUser.faculte);
            if (!fac) return [];

            const coursDeLannee = fac.courses.filter(c => parseInt(c.anneeEtude) === parseInt(this.currentUser.annee));

            return coursDeLannee.map(cours => {
                const noteBloc = notesData.find(n =>
                    n.faculte === fac.nom &&
                    parseInt(n.annee) === parseInt(this.currentUser.annee) &&
                    n.coursNom === cours.nom &&
                    n.notesValidees === true
                );

                const etudiantNote = noteBloc?.etudiants.find(e => e.etudiantId === this.currentUser.id);

                return {
                    cours: cours.nom,
                    theorique: etudiantNote ? etudiantNote.notes.theorique : '-',
                    pratique: etudiantNote ? etudiantNote.notes.pratique : '-',
                    finale: etudiantNote ? parseFloat(etudiantNote.notes.finale) : '-',
                };
            });
        },
        countSuccess() {
            return this.studentGrades.filter(n => typeof n.finale === 'number' && n.finale >= 10).length;
        },
        countFail() {
            return this.studentGrades.filter(n => typeof n.finale === 'number' && n.finale < 10).length;
        }
    },
    mounted() {
        const userData = localStorage.getItem('schola.currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }
};
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Notes validées</h3>
            <div class="stats">
                <span class="success">✔ {{ countSuccess }}</span>
                <span class="danger">✖ {{ countFail }}</span>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Cours</th>
                        <th>Note Théorique (/12)</th>
                        <th>Note Pratique (/8)</th>
                        <th>Note Finale (/20)</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(note, index) in studentGrades" :key="index">
                        <td>{{ note.cours }}</td>
                        <td>{{ note.theorique }}</td>
                        <td>{{ note.pratique }}</td>
                        <td>{{ note.finale }}</td>
                        <td>
                            <span v-if="typeof note.finale === 'number'"
                                :class="note.finale >= 10 ? 'success' : 'danger'" class="vld-sign">
                                {{ note.finale >= 10 ? '✔' : '✖' }}
                            </span>
                            <span v-else class="pending">-</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
