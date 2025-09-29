<script>
export default {
    props: ['onSelectCourse'],
    data() {
        return {
            currentUser: null,
            professorCoursesByYear: [],
        };
    },
    created() {
        const savedUser = localStorage.getItem('schola.currentUser');
        const savedUsers = localStorage.getItem('schola.users');
        const savedFacultes = localStorage.getItem('schola.facultes');

        if (savedUser && savedUsers && savedFacultes) {
            const minimalUser = JSON.parse(savedUser);
            const allUsers = JSON.parse(savedUsers);
            const facultes = JSON.parse(savedFacultes);

            this.currentUser = allUsers.find(u => u.id === minimalUser.id && u.role === 'professeur');

            if (this.currentUser?.affectations) {
                const allStudents = allUsers.filter(u => u.role === 'etudiant');

                this.professorCoursesByYear = this.currentUser.affectations.flatMap((affectation, index) => {
                    const fac = facultes.find(f => f.nom === affectation.nom);
                    if (!fac) return [];

                    return affectation.annees.flatMap(anneeObj => {
                        const coursEtudie = anneeObj.cours || [];

                        const etudiants_list = allStudents.filter(e =>
                            e.faculte === affectation.nom && e.annee === anneeObj.annee
                        );

                        return coursEtudie.map(course => ({
                            id: `cours_${index}_${anneeObj.annee}_${course.id}`,
                            nom: course.nom,
                            faculte: affectation.nom,
                            annee: anneeObj.annee,
                            etudiants_list
                        }));
                    });
                });
                console.log(this.professorCoursesByYear);
            }
        }
    },
    methods: {
        handleSelect(course) {
            this.onSelectCourse(course);
        },
        /*         getAverage(course) {
                    const notes = course.etudiants
                        .map(e => parseFloat(e.notes.finale))
                        .filter(n => !isNaN(n));
        
                    if (notes.length === 0) return '-';
                    const sum = notes.reduce((a, b) => a + b, 0);
                    return (sum / notes.length).toFixed(1);
                }, */
    }
};
</script>

<template>
    <div class="dashboard-container-fluid">
        <h3 class="title">Mes cours</h3>
        <div class="dashboard-container">
            <div v-for="cours in professorCoursesByYear" :key="cours.id" class="dashboard-item">
                <h4>{{ cours.nom }} - {{ cours.faculte }} - {{ cours.annee }}ᵉ année</h4>
                <div class="cours-infos">
                    <div class="text-sm">
                        <i class="bi-people-fill"></i>
                        <span>{{ cours.etudiants_list.length }} étudiants</span>
                    </div>
                    <div class="text-sm">
                        <i class="bi-pie-chart-fill"></i>
                        <!-- {{ getAverage(cours) }} -->
                        <span>{{  }} points</span>
                    </div>
                </div>
                <button v-if="cours.etudiants_list.length" @click="handleSelect(cours)" class="btn">
                    Gérer les notes
                </button>
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
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width:468px) {
    .dashboard-container-fluid .dashboard-container {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>