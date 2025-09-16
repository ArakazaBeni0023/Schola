<script>
export default {
    props: ['onSelectCourse'], // 👈 Permet d'envoyer le cours sélectionné au parent
    data() {
        return {
            // Professor data
            selectedCourse: null,

            professorCourses: [
                {
                    id: 1,
                    nom: 'Programmation Web',
                    classe: 'L1 Informatique',
                    etudiants: 25,
                    notesValidees: false,
                    etudiants_list: [
                        { id: 1, nom: 'Dupont', prenom: 'Jean', noteTheorique: null, notePratique: null, noteFinale: null },
                        { id: 2, nom: 'Martin', prenom: 'Sophie', noteTheorique: null, notePratique: null, noteFinale: null }
                    ]
                },
                {
                    id: 2,
                    nom: 'Programmation Web',
                    classe: 'L1 Informatique',
                    etudiants: 25,
                    notesValidees: false,
                    etudiants_list: [
                        { id: 1, nom: 'Dupont', prenom: 'Jean', noteTheorique: null, notePratique: null, noteFinale: null },
                        { id: 2, nom: 'Martin', prenom: 'Sophie', noteTheorique: null, notePratique: null, noteFinale: null }
                    ]
                },
            ],
        }
    },
    methods: {
        selectCourse(cours) {
            this.selectedCourse = cours
        },
    }
}
</script>

<template>
    <div class="dashboard-container-fluid">
        <h3 class="title">Mes cours</h3>
        <div class="dashboard-container">
            <div v-for="cours in professorCoursesByYear" :key="cours.id" class="dashboard-item">
                <h4>{{ cours.nom }} - {{ cours.annee }}ᵉ année</h4>
                <div class="cours-infos">
                    <div class="text-sm">
                        <i class="bi-book-fill"></i>
                        <span> {{ cours.classe }}</span>
                    </div>
                    <div class="text-sm">
                        <i class="bi-people-fill"></i>
                        <span> {{ cours.etudiants }} étudiants</span>
                    </div>
                </div>
                <button @click="handleSelect(cours)" class="btn">Gérer les notes</button>
            </div>
        </div>
    </div>
</template>



<style scoped>
.dashboard-container-fluid {
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    border-radius: 15px;
    padding: 1rem;
    gap: 1rem;
}

.dashboard-container-fluid .dashboard-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: 0.5rem;
}

.dashboard-container .dashboard-item {
    grid-column: span 1;
    border: 1px solid var(--color-primary);
    padding: 1rem 0.5rem;
    border-radius: 16px;
    align-items: start;
    gap: .5rem;
}

.dashboard-container .dashboard-item .btn,
.dashboard-container .dashboard-item .cours-infos {
    width: 100%;
}

.dashboard-container .dashboard-item .cours-infos {
    gap: .5rem;
    /* text-align: center; */
}

.dashboard-container .dashboard-item .cours-infos .text-sm {
    background: var(--hover-lw);
    width: 100%;
    padding: .5rem;
    height: 70px;
    border-radius: 15px;
    font-size: 10px;
    border: 1px solid var(--color-secondary);
}

.dashboard-container .dashboard-item .cours-infos .text-sm i {
    font-size: 16px;
}

.dashboard-container .dashboard-item .btn {
    background: var(--color-primary-dark);
    color: var(--color-text-light);
    font-family: 'Poppins', sans-serif;
    padding: 0.8rem;
    border-radius: 50px;
    font-size: 11px;
    border: none;
    cursor: pointer;
    transition: all .5s ease;
}

.dashboard-container .dashboard-item .btn:hover {
    background-color: var(--color-primary);
}

@media (max-width:768px) {
    .dashboard-container-fluid .dashboard-container {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>