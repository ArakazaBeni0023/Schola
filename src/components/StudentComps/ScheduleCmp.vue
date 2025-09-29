<script>
export default {
    data() {
        return {
            schedule: [
                {
                    jour: 'Lundi',
                    heure: '08:00-10:00',
                    cours: 'Programmation Web',
                    professeur: 'M. Martin',
                    salle: 'A101'
                },
                {
                    jour: 'Mardi',
                    heure: '10:00-12:00',
                    cours: 'Base de données',
                    professeur: 'Mme. Durand',
                    salle: 'B205'
                }
            ],

            jours: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
            heures: ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'],

            availableClasses: [],
            availableCours: []
        }
    },
    methods: {
        getScheduleItem(jour, heure) {
            return this.schedule.find(s => s.jour === jour && s.heure === heure)
        },
    }
}
</script>

<template>
    <div class="table-container-fluid">
        <div class="table-container-header">
            <h3 class="title">Emploi du temps</h3>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Heure</th>
                        <th>Lundi</th>
                        <th>Mardi</th>
                        <th>Mercredi</th>
                        <th>Jeudi</th>
                        <th>Vendredi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="heure in heures" :key="heure">
                        <td>{{ heure }}</td>
                        <td v-for="jour in jours" :key="jour">
                            <div v-if="getScheduleItem(jour, heure)">
                                <div>{{ getScheduleItem(jour, heure).cours }}</div>
                                <div>{{ getScheduleItem(jour, heure).professeur }}</div>
                                <div>{{ getScheduleItem(jour, heure).salle }}</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>