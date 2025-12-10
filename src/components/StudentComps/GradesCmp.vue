<script>
export default {
    name: 'StudentGrades',

    data() {
        return {
            currentUser: null,
            facultes: [],
            notes: [],
            selectedFilter: 'all'
        };
    },

    computed: {
        studentGrades() {
            if (!this.currentUser) return [];

            const facultes = JSON.parse(localStorage.getItem('schola.facultes')) || [];
            const notesData = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const fac = facultes.find(f => f.nomFac === this.currentUser.faculte);
            if (!fac) return [];

            const coursDeLannee = fac.courses.filter(c => parseInt(c.anneeEtude) === parseInt(this.currentUser.annee));

            return coursDeLannee.map(cours => {
                const noteBloc = notesData.find(n =>
                    n.faculte === fac.nomFac &&
                    parseInt(n.annee) === parseInt(this.currentUser.annee) &&
                    n.coursNom === cours.nomCours &&
                    n.notesValidees === true
                );

                const etudiantNote = noteBloc?.etudiants.find(e => e.etudiantId === this.currentUser.id);
                const hasNote = etudiantNote && etudiantNote.notes;

                const noteFinale = hasNote ? parseFloat(etudiantNote.notes.finale) : null;

                return {
                    cours: cours.nomCours,
                    coursCode: cours.nomCours.substring(0, 3).toUpperCase(),
                    theorique: hasNote ? parseFloat(etudiantNote.notes.theorique) : '-',
                    pratique: hasNote ? parseFloat(etudiantNote.notes.pratique) : '-',
                    finale: noteFinale,
                    statut: noteFinale !== null ? (noteFinale >= 10 ? 'success' : 'fail') : 'pending'
                };
            });
        },

        filteredGrades() {
            if (this.selectedFilter === 'all') return this.studentGrades;
            return this.studentGrades.filter(grade => grade.statut === this.selectedFilter);
        },

        countSuccess() {
            return this.studentGrades.filter(n => n.statut === 'success').length;
        },

        countFail() {
            return this.studentGrades.filter(n => n.statut === 'fail').length;
        },

        countPending() {
            return this.studentGrades.filter(n => n.statut === 'pending').length;
        },

        totalCourses() {
            return this.studentGrades.length;
        },

        averageGrade() {
            const gradesWithNotes = this.studentGrades.filter(n => typeof n.finale === 'number');
            if (gradesWithNotes.length === 0) return 0;
            const sum = gradesWithNotes.reduce((acc, grade) => acc + grade.finale, 0);
            return (sum / gradesWithNotes.length).toFixed(2);
        }
    },

    mounted() {
        const userData = localStorage.getItem('schola.currentUser');
        const allUsers = JSON.parse(localStorage.getItem('schola.users')) || [];

        if (userData) {
            const basicUser = JSON.parse(userData);
            const fullUser = allUsers.find(u => u.id === basicUser.id);

            if (fullUser) {
                this.currentUser = fullUser;
            } else {
                this.currentUser = basicUser;
            }

            console.log('Current User:', this.currentUser);
            console.log('Facultes:', JSON.parse(localStorage.getItem('schola.facultes')));
            console.log('Notes:', JSON.parse(localStorage.getItem('schola.notes')));
        }
    },

    methods: {
        setFilter(filter) {
            this.selectedFilter = filter;
        },

        getGradeColor(grade) {
            if (grade === '-' || grade === null) return 'var(--color-text-light)';
            if (grade >= 16) return '#10b981'; // Excellent
            if (grade >= 14) return '#34d399'; // Très bien
            if (grade >= 12) return '#f59e0b'; // Bien
            if (grade >= 10) return '#f97316'; // Passable
            return '#ef4444'; // Échec
        },

        formatGrade(grade) {
            if (grade === '-' || grade === null || grade === undefined) return '-';
            if (typeof grade === 'string') return parseFloat(grade).toFixed(2);
            return grade.toFixed(2);
        }
    }
};
</script>

<template>
    <div class="grades-container">
        <div class="table-container-header">
            <div class="header-main">
                <h3 class="title">Notes validées</h3>
            </div>

            <!-- Statistiques -->
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-value">{{ totalCourses }}</div>
                    <div class="stat-label">Total Cours</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-value">{{ countSuccess }}</div>
                    <div class="stat-label">Validés</div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-value">{{ countFail }}</div>
                    <div class="stat-label">Échecs</div>
                </div>
                <div class="stat-card pending">
                    <div class="stat-value">{{ countPending }}</div>
                    <div class="stat-label">En attente</div>
                </div>
                <div class="stat-card average" v-if="averageGrade > 0">
                    <div class="stat-value">{{ averageGrade }}</div>
                    <div class="stat-label">Moyenne</div>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="filters-container">
            <div class="filter-buttons">
                <button @click="setFilter('all')" :class="['filter-btn', { active: selectedFilter === 'all' }]">
                    Tous ({{ totalCourses }})
                </button>
                <button @click="setFilter('success')"
                    :class="['filter-btn', 'success', { active: selectedFilter === 'success' }]">
                    Validés ({{ countSuccess }})
                </button>
                <button @click="setFilter('fail')"
                    :class="['filter-btn', 'danger', { active: selectedFilter === 'fail' }]">
                    Échecs ({{ countFail }})
                </button>
                <button @click="setFilter('pending')"
                    :class="['filter-btn', 'pending', { active: selectedFilter === 'pending' }]">
                    En attente ({{ countPending }})
                </button>
            </div>
        </div>

        <!-- Vue Desktop -->
        <div class="desktop-view">
            <div class="table-container">
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th class="course-col">Cours</th>
                            <th class="grade-col">Théorique (/12)</th>
                            <th class="grade-col">Pratique (/8)</th>
                            <th class="grade-col">Finale (/20)</th>
                            <th class="status-col">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(note, index) in filteredGrades" :key="index" class="grade-row">
                            <td class="course-name">
                                <div class="course-title">{{ note.cours }}</div>
                                <div class="course-code">{{ note.coursCode }}</div>
                            </td>
                            <td class="grade-value">
                                <span :style="{ color: getGradeColor(note.theorique) }">
                                    {{ note.theorique }}
                                </span>
                            </td>
                            <td class="grade-value">
                                <span :style="{ color: getGradeColor(note.pratique) }">
                                    {{ note.pratique }}
                                </span>
                            </td>
                            <td class="grade-value final">
                                <span v-if="note.finale !== null" :style="{ color: getGradeColor(note.finale) }"
                                    class="final-grade">
                                    {{ formatGrade(note.finale) }}
                                </span>
                                <span v-else class="no-grade">-</span>
                            </td>
                            <td class="status-cell">
                                <span :class="['status-badge', note.statut]">
                                    <span class="status-icon">
                                        {{ note.statut === 'success' ? '✓' :
                                            note.statut === 'fail' ? '✗' : '⋯' }}
                                    </span>
                                    <span class="status-text">
                                        {{ note.statut === 'success' ? 'Validé' :
                                            note.statut === 'fail' ? 'Échec' : 'En attente' }}
                                    </span>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredGrades.length === 0" class="no-data-message">
                    <div class="no-data-icon"></div>
                    <p>Aucune note trouvée pour ce filtre</p>
                </div>
            </div>
        </div>

        <!-- Vue Mobile -->
        <div class="mobile-view">
            <div class="mobile-grades-list">
                <div v-for="(note, index) in filteredGrades" :key="index" class="mobile-grade-card">
                    <div class="card-header">
                        <div class="course-info">
                            <div class="course-code">{{ note.coursCode }}</div>
                            <div class="course-title">{{ note.cours }}</div>
                        </div>
                        <span :class="['mobile-status-badge', note.statut]">
                            <i :class="note.statut === 'success' ? 'bi-check-lg' :
                                note.statut === 'fail' ? 'bi-x-lg' : 'bi-three-dots'
                                "></i>
                            <p>{{ note.statut === 'success' ? 'Validé' :
                                note.statut === 'fail' ? 'Échec' : 'En attente de notation' }}</p>
                        </span>
                    </div>

                    <div class="grades-cont">
                        <div class="grade-item">
                            <div class="grade-label">Théorique</div>
                            <div class="grade-value" :style="{ color: getGradeColor(note.theorique) }">
                                {{ note.theorique }}<span class="grade-max"> /12</span>
                            </div>
                        </div>
                        <div class="grade-item">
                            <div class="grade-label">Pratique</div>
                            <div class="grade-value" :style="{ color: getGradeColor(note.pratique) }">
                                {{ note.pratique }}<span class="grade-max"> /8</span>
                            </div>
                        </div>
                        <div class="grade-item final">
                            <div class="grade-label">Finale</div>
                            <div v-if="note.finale !== null" class="grade-value"
                                :style="{ color: getGradeColor(note.finale) }">
                                {{ formatGrade(note.finale) }}<span class="grade-max"> /20</span>
                            </div>
                            <div v-else class="no-grade">-</div>
                        </div>
                    </div>
                </div>

                <div v-if="filteredGrades.length === 0" class="no-data-message mobile">
                    <div class="no-data"><i class="bi-chart"></i></div>
                    <p>Aucune note trouvée</p>
                    <button @click="setFilter('all')" class="reset-filter-btn">
                        Voir toutes les notes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.grades-container {
    width: 100%;
    padding: 2rem;
    background: var(--color-surface);
    border-radius: 15px;
    border: 2px solid var(--color-primary);
}

.table-container-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;
}

.header-main {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.title {
    color: var(--color-text);
    margin: 0;
    font-size: 1.25rem;
}

.user-info {
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: normal;
}

.refresh-btn {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.refresh-btn:hover {
    background: var(--color-primary-dark);
}

/* Statistiques */
.stats-overview {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.stat-card {
    background: var(--hover-lw);
    color: var(--color-primary);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    border: 1px solid var(--color-primary);
    border-left: 4px solid var(--color-primary);
}

.stat-card.success {
    background: #10b98161;
    border: 1px solid #10b981;
    border-left: 4px solid #10b981;
}

.stat-card.danger {
    background: #ef444461;
    border: 1px solid #ef4444;
    border-left: 4px solid #ef4444;
}

.stat-card.pending {
    background: #f59e0b61;
    border: 1px solid #f59e0b;
    border-left: 4px solid #f59e0b;
}

.stat-card.average {
    background: #8a5cf661;
    border: 1px solid #8b5cf6;
    border-left: 4px solid #8b5cf6;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-card.success .stat-value {
    color: #10b981;
}

.stat-card.danger .stat-value {
    color: #ef4444;
}

.stat-card.pending .stat-value {
    color: #f59e0b;
}

.stat-card.average .stat-value {
    color: #8b5cf6;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--color-text-light);
    text-transform: uppercase;
    font-weight: 600;
}

/* Filtres */
.filters-container {
    margin-bottom: 1.5rem;
}

.filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-primary);
    background: var(--color-surface);
    color: var(--color-primary);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    font-family: "Poppins", sans-serif;
}

.filter-btn.active {
    color: white;
    border-color: transparent;
}

.filter-btn:not(.active):hover {
    background: var(--hover-lw);
}

/* success */
.filter-btn.success {
    color: #10b981;
    border: 1px solid #10b981;
}

.filter-btn:not(.active).success:hover {
    background: #10b98130;
}

.filter-btn.success.active {
    background: #10b981;
    color: white;
    border: 1px solid #10b981;
}

/* danger */
.filter-btn.danger {
    color: #ef4444;
    border: 1px solid #ef4444;
}

.filter-btn:not(.active).danger:hover {
    background: #ef444430;
}

.filter-btn.danger.active {
    background: #ef4444;
    color: white;
    border: 1px solid #ef4444;
}

/* pending */
.filter-btn.pending {
    color: #f59e0b;
    border: 1px solid #f59e0b;
}

.filter-btn:not(.active).pending:hover {
    background: #f59e0b30;
}

.filter-btn.pending.active {
    background: #f59e0b;
    color: white;
    border: 1px solid #f59e0b;
}

.filter-btn:not([class*="success"]):not([class*="danger"]):not([class*="pending"]).active {
    background: var(--color-primary);
}

/* Vue Desktop */
.grades-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grades-table th {
    background: var(--color-primary);
    color: white;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border: 1px solid var(--color-border-light);
}

.grades-table td {
    padding: .5rem;
    border: 1px solid var(--color-border);
}

.grade-row:hover {
    background: #f8f9fa;
}

.course-col {
    width: 40%;
}

.grade-col {
    width: 15%;
}

.status-col {
    width: 15%;
}

.course-name {
    font-weight: 600;
}

.course-code {
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-top: 0.25rem;
}

.grade-value {
    font-weight: 600;
    font-size: 1rem;
}

.grade-value.final {
    font-weight: 700;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.status-badge.success {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.fail {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

/* Vue Mobile */
.mobile-grade-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 1rem;
    border: 2px solid var(--color-primary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.course-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.course-code {
    font-size: 0.75rem;
    color: var(--color-primary);
    background: #e0e7ff;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    display: inline-block;
    font-weight: 700;
    width: fit-content;
}

.course-title {
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.3;
}

.mobile-status-badge {
    width: fit-content;
    height: 30px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: .5rem;
    gap: .2rem;
    font-size: 14px;
}

.mobile-status-badge p {
    font-weight: 600;
}

.mobile-status-badge.success {
    background: var(--color-success-bg);
    color: var(--color-success);
}

.mobile-status-badge.fail {
    background: #fee2e2;
    color: #991b1b;
}

.mobile-status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.grades-cont {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.grade-item {
    text-align: start;
    border: 1px solid var(--color-primary);
    border-radius: 8px;
    overflow: hidden;
}

.grade-label {
    padding: 0.5rem;
    font-size: 12px;
    background: var(--hover-lw);
    color: var(--color-text);
    border-bottom: 1px solid var(--color-primary);
}

.grade-value {
    font-weight: 700;
    font-size: 1rem;
    padding: 0 .3rem;
}


.grade-value.success {
    background: var(--color-success-bg);
}

.grade-value.fail {
    background: var(--color-danger-bg);
}

.grade-max {
    font-size: 14px;
    color: var(--color-muted);
}

.no-grade {
    color: var(--color-text-light);
    font-style: italic;
}

.card-footer {
    display: flex;
}

/* Messages d'absence de données */
.no-data-message {
    text-align: center;
    padding: 3rem 2rem;
    background: #6c6c6c2d;
    color: var(--color-muted);
    border: 2px dashed var(--color-muted);
    border-radius: 10px;
}

.no-data-message.mobile {
    padding: 2rem 1rem;
}

.no-data-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.reset-filter-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-primary);
    color: var(--color-text-light);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.reset-filter-btn:hover {
    background: var(--color-primary-dark);
}

/* Responsive */
@media (max-width: 767px) {
    .grades-container {
        padding: 0.5rem;
    }

    .stats-overview {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
    }

    .stat-card {
        padding: 0.75rem 0.5rem;
    }

    .stat-value {
        font-size: 1.25rem;
    }

    .filter-buttons {
        gap: 0.25rem;
    }

    .filter-btn {
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
    }

    .grades-cont {
        gap: 0.5rem;
    }
}

@media (min-width: 768px) {
    .mobile-view {
        display: none;
    }
}

@media (max-width: 767px) {
    .desktop-view {
        display: none;
    }
}
</style>