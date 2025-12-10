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
            try {
                const minimalUser = JSON.parse(savedUser);
                const allUsers = JSON.parse(savedUsers);
                const facultes = JSON.parse(savedFacultes);

                this.currentUser = allUsers.find(u =>
                    u.id === minimalUser.id && u.role === 'professeur'
                );

                if (this.currentUser?.affectations) {
                    const allStudents = allUsers.filter(u => u.role === 'etudiant');

                    this.professorCoursesByYear = this.currentUser.affectations.flatMap((affectation, affectIndex) => {
                        const faculteData = facultes.find(f => f.nomFac === affectation.nom);
                        if (!faculteData) return [];

                        return affectation.annees.flatMap(anneeObj => {
                            const etudiants_list = allStudents.filter(e =>
                                e.faculte === affectation.nom && e.annee === anneeObj.annee
                            );

                            const coursPourAnnee = faculteData.courses?.filter(course =>
                                course.anneeEtude === anneeObj.annee
                            ) || [];

                            return coursPourAnnee.map((course, courseIndex) => {
                                return {
                                    id: `cours_${affectIndex}_${anneeObj.annee}_${course.id || courseIndex}`,
                                    nom: course.nomCours,
                                    faculte: affectation.nom,
                                    annee: anneeObj.annee,
                                    coursId: course.id || `crs_${affectIndex}_${anneeObj.annee}_${courseIndex}`,
                                    courseIndex: courseIndex,
                                    originalCourse: course,
                                    etudiants_list
                                };
                            });
                        });
                    });

                    this.loadAndCalculateCourseStats();
                }
            } catch (error) {
                console.error('Erreur chargement cours:', error);
            }
        }
    },
    methods: {
        handleSelect(course) {
            const courseForEditor = {
                ...course,
                coursId: course.coursId || course.originalCourse?.id,
                coursNom: course.nom
            };

            this.onSelectCourse(courseForEditor);
        },

        loadAndCalculateCourseStats() {
            try {
                const savedNotes = localStorage.getItem('schola.notes');
                if (!savedNotes) return;

                const allNotes = JSON.parse(savedNotes);

                this.professorCoursesByYear = this.professorCoursesByYear.map(course => {
                    const courseNotes = allNotes.find(n =>
                        n.faculte === course.faculte &&
                        n.annee === course.annee &&
                        (n.coursId === course.coursId || n.coursNom === course.nom)
                    );

                    if (courseNotes) {
                        const notesValidees = courseNotes.notesValidees || false;

                        const stats = this.calculateCourseStats(courseNotes);

                        return {
                            ...course,
                            notesValidees: notesValidees,
                            lastModified: courseNotes.dateDerniereModification,
                            stats: stats,
                            hasNotes: true
                        };
                    }

                    return {
                        ...course,
                        notesValidees: false,
                        hasNotes: false,
                        stats: {
                            average: 0,
                            completed: 0,
                            total: course.etudiants_list.length
                        }
                    };
                });

            } catch (error) {
                console.error('Erreur chargement stats:', error);
            }
        },

        calculateCourseStats(courseNotes) {
            if (!courseNotes.etudiants || courseNotes.etudiants.length === 0) {
                return { average: 0, completed: 0, total: 0 };
            }

            const finales = courseNotes.etudiants
                .map(e => parseFloat(e.notes.finale))
                .filter(n => !isNaN(n) && n !== null);

            const completed = finales.length;
            const total = courseNotes.etudiants.length;
            const average = completed > 0
                ? (finales.reduce((a, b) => a + b, 0) / completed).toFixed(1)
                : 0;

            return { average, completed, total };
        },

        // raba ko average irkora neza

        /*  getAverage(course) {
             const savedNotes = localStorage.getItem('schola.notes');
             if (!savedNotes) return '0.0';
 
             try {
                 const allNotes = JSON.parse(savedNotes);
 
                 const courseNotes = allNotes.find(note =>
                     note.faculte === course.faculte &&
                     note.annee === course.annee &&
                     note.coursNom === course.coursNom
                 );
 
                 if (!courseNotes || !courseNotes.etudiants || courseNotes.etudiants.length === 0) {
                     return '0.0';
                 }
 
                 const finalGrades = courseNotes.etudiants
                     .map(etudiant => {
                         const finale = etudiant.notes?.finale;
                         return finale !== null && finale !== undefined ? parseFloat(finale) : null;
                     })
                     .filter(grade => grade !== null && !isNaN(grade));
 
                 if (finalGrades.length === 0) return '0.0';
 
                 const sum = finalGrades.reduce((total, grade) => total + grade, 0);
                 return (sum / finalGrades.length).toFixed(1);
 
             } catch (error) {
                 console.error('Erreur lors du calcul de la moyenne:', error);
                 return '0.0';
             }
         }, */
        getAverage(course) {
            try {
                const savedNotes = localStorage.getItem('schola.notes');
                if (!savedNotes) return '0.0';

                const allNotes = JSON.parse(savedNotes);

                const courseNotes = allNotes.find(note => {
                    if (note.faculte !== course.faculte || note.annee !== course.annee) {
                        return false;
                    }
                    if (note.coursId && course.coursId && note.coursId === course.coursId) {
                        return true;
                    }
                    if (note.coursNom && course.nom && note.coursNom === course.nomCours) {
                        return true;
                    }

                    return false;
                });

                if (!courseNotes || !courseNotes.etudiants || courseNotes.etudiants.length === 0) {
                    return '0.0';
                }

                const finalGrades = courseNotes.etudiants
                    .map(etudiant => {
                        const finale = etudiant.notes?.finale;
                        return finale !== null && finale !== undefined ? parseFloat(finale) : null;
                    })
                    .filter(grade => grade !== null && !isNaN(grade));

                if (finalGrades.length === 0) return '0.0';

                const sum = finalGrades.reduce((total, grade) => total + grade, 0);
                return (sum / finalGrades.length).toFixed(1);

            } catch (error) {
                console.error('Erreur calcul moyenne:', error);
                return '0.0';
            }
        },

        formatAnnee(annee) {
            return `${annee} ${annee === 1 ? 'ère' : 'ème'}`;
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }

    }
};
</script>

<template>
    <div class="dashboard-container-fluid">
        <h3 class="title">Mes cours</h3>
        <div class="dashboard-container">
            <div v-for="cours in professorCoursesByYear" :key="cours.id" class="dashboard-item">
                <h4>{{ cours.nom }} - {{ cours.faculte }} - {{ formatAnnee(cours.annee) }}
                    année</h4>

                <div v-if="cours.notesValidees" class="status-badge validated">
                    <i class="bi-check-circle"></i> Notes validées
                </div>
                <div v-else-if="cours.hasNotes" class="status-badge in-progress">
                    <i class="bi-pencil"></i> En cours de saisie
                </div>
                <div v-else class="status-badge not-started">
                    <i class="bi-clock"></i> Non commencé
                </div>

                <div class="cours-infos">
                    <div class="text-sm">
                        <i class="bi-people-fill"></i>
                        <span>{{ cours.etudiants_list.length }} étudiants</span>
                    </div>
                    <div class="text-sm">
                        <i class="bi-pie-chart-fill"></i>
                        <span v-if="cours.stats">
                            {{ cours.stats.average }} /20 ({{ cours.stats.completed }}/{{ cours.stats.total }})
                        </span>
                        <span v-else>0.0 /20</span>
                    </div>
                </div>
                <button v-if="cours.etudiants_list.length" @click=" handleSelect(cours)" class="btn">
                    {{ cours.hasNotes ? 'Modifier les notes' : 'Saisir les notes' }}
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

.status-badge {
    padding: 4px 8px;
    border-radius: 25px;
    font-size: 12px;
    font-weight: 600;
    margin: 8px 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;

}

.status-badge.validated {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.status-badge.in-progress {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #f59e0b;
}

.status-badge.not-started {
    background: #e5e7eb;
    color: #4b5563;
    border: 1px solid #9ca3af;
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