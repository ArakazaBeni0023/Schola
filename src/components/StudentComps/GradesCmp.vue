<script>
export default {
    data() {
        return {
            studentGrades: [
                { id: 1, cours: 'Mathématiques', theorique: 7, pratique: 7, finale: 14 },
                { id: 2, cours: 'Physique', theorique: 8, pratique: 7, finale: 15 },
                { id: 3, cours: 'Biologie', theorique: 9, pratique: 7, finale: 16 },
                { id: 4, cours: 'Anglais', theorique: 9, pratique: 9, finale: 18 },
                { id: 5, cours: 'Français', theorique: 0, pratique: 9, finale: 9 },
            ],
        }
    },

}
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Notes validées</h3>
            <div class="stats">
                <span class="success">✔ 4</span>
                <span class="danger">✖ 1</span>
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
                    <tr v-for="note in studentGrades" :key="note.cours">
                        <td>{{ note.cours }}</td>
                        <td>{{ note.theorique }}</td>
                        <td>{{ note.pratique }}</td>
                        <td>{{ note.finale }}</td>
                        <td>
                            <span :class="note.finale >= 10 ? 'success' : 'danger'" class="vld-sign">
                                {{ note.finale >= 10 ? '✔' : '✖' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>