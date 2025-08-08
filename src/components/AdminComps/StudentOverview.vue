<script>
export default {
    data() {
        return {
            facultes: [
                {
                    id: 1,
                    nom: 'Sciences et Technologies',
                    classes: [
                        { id: 1, nom: 'L1 Informatique' },
                        { id: 2, nom: 'L2 Informatique' },
                        { id: 3, nom: 'L3 Informatique' }
                    ]
                },
                {
                    id: 2,
                    nom: 'Lettres et Sciences Humaines',
                    classes: [
                        { id: 4, nom: 'L1 Littérature' },
                        { id: 5, nom: 'L2 Littérature' }
                    ]
                }
            ],
        }
    },

    computed: {
        filteredStudents() {
            return [
                { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@test.com', faculte: 'Sciences et Technologies', classe: 'L1 Informatique' },
            ]
        }
    },
}
</script>

<template>
    <div class="student-overview-container">
        <h3 class="title">Vue d'ensemble des étudiants</h3>
        <div class="student-overview-container-header">
            <select v-model="selectedFacultyFilter" class="select-input">
                <option value="" selected>Toutes les facultés</option>
                <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.id">
                    {{ faculte.nom }}
                </option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Faculté</th>
                        <th>Classe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="etudiant in filteredStudents" :key="etudiant.id">
                        <td>{{ etudiant.nom }}</td>
                        <td>{{ etudiant.prenom }}</td>
                        <td>{{ etudiant.email }}</td>
                        <td>{{ etudiant.faculte }}</td>
                        <td>{{ etudiant.classe }}</td>
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
    gap: .5rem;
}
</style>