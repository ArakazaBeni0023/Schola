<script>
export default {
    props: ['course', 'currentUser'],

    data() {
        return {
            selectedCourse: {},
            notesIsValide: null,
            searchQuery: '',
            sortField: 'nom',
            sortDirection: 'asc',
            autoSaveTimer: null,
            lastSave: null,
            statistics: {
                averageTheorique: 0,
                averagePratique: 0,
                averageFinale: 0,
                successCount: 0,
                failCount: 0,
                pendingCount: 0
            }
        };
    },

    watch: {
        course: {
            immediate: true,
            handler(newCourse) {
                this.selectedCourse = newCourse;
                this.ensureNotesTable();
                this.loadExistingNotes();
            }
        },

        selectedCourse: {
            deep: true,
            handler() {
                this.debounceAutoSave();
            }
        }
    },

    computed: {
        filteredStudents() {
            if (!this.selectedCourse.etudiants_list) return [];

            let students = [...this.selectedCourse.etudiants_list];

            // Filtre par recherche
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                students = students.filter(etudiant =>
                    etudiant.nom.toLowerCase().includes(query) ||
                    etudiant.prenom.toLowerCase().includes(query)
                );
            }

            // Tri
            students.sort((a, b) => {
                let aValue, bValue;

                switch (this.sortField) {
                    case 'nom':
                        aValue = a.nom;
                        bValue = b.nom;
                        break;
                    case 'prenom':
                        aValue = a.prenom;
                        bValue = b.prenom;
                        break;
                    case 'theorique':
                        aValue = a.noteTheorique !== null ? a.noteTheorique : -1;
                        bValue = b.noteTheorique !== null ? b.noteTheorique : -1;
                        break;
                    case 'finale':
                        aValue = a.noteFinale !== null ? parseFloat(a.noteFinale) : -1;
                        bValue = b.noteFinale !== null ? parseFloat(b.noteFinale) : -1;
                        break;
                    default:
                        aValue = a.nom;
                        bValue = b.nom;
                }

                if (this.sortDirection === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                }
            });

            return students;
        },

        canValidate() {
            return this.filteredStudents.every(etudiant =>
                etudiant.noteTheorique != null &&
                etudiant.notePratique != null
            );
        },

        progressPercentage() {
            const total = this.filteredStudents.length;
            if (total === 0) return 0;
            const completed = this.filteredStudents.filter(etudiant =>
                etudiant.noteTheorique != null &&
                etudiant.notePratique != null
            ).length;
            return Math.round((completed / total) * 100);
        },

        isMobileView() {
            return window.innerWidth < 768;
        }
    },

    methods: {
        ensureNotesTable() {
            if (!localStorage.getItem('schola.notes')) {
                localStorage.setItem('schola.notes', JSON.stringify([]));
            }
        },

        loadExistingNotes() {
            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];
            const courseNote = allCourses.find(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            this.notesIsValide = courseNote?.notesValidees || false;

            if (courseNote && Array.isArray(this.selectedCourse.etudiants_list)) {
                this.selectedCourse.etudiants_list.forEach(etudiant => {
                    const note = courseNote.etudiants.find(n => n.etudiantId === etudiant.id);
                    if (note) {
                        etudiant.noteTheorique = note.notes.theorique;
                        etudiant.notePratique = note.notes.pratique;
                        etudiant.noteFinale = note.notes.finale;
                    } else {
                        etudiant.noteTheorique = null;
                        etudiant.notePratique = null;
                        etudiant.noteFinale = null;
                    }
                });
            } else {
                this.selectedCourse.etudiants_list?.forEach(etudiant => {
                    etudiant.noteTheorique = null;
                    etudiant.notePratique = null;
                    etudiant.noteFinale = null;
                });
            }

            this.calculateStatistics();
        },

        calculateFinalGrade(etudiant) {
            if (etudiant.noteTheorique != null && etudiant.notePratique != null) {
                if (etudiant.noteTheorique > 12) etudiant.noteTheorique = 12;
                if (etudiant.notePratique > 8) etudiant.notePratique = 8;
                if (etudiant.noteTheorique < 0) etudiant.noteTheorique = 0;
                if (etudiant.notePratique < 0) etudiant.notePratique = 0;

                etudiant.noteFinale = (
                    (etudiant.noteTheorique / 12) * 12 +
                    (etudiant.notePratique / 8) * 8
                ).toFixed(1);
            } else {
                etudiant.noteFinale = null;
            }
            this.calculateStatistics();
        },

        calculateStatistics() {
            const students = this.filteredStudents;
            const notesTheorique = students.map(e => e.noteTheorique).filter(n => n != null);
            const notesPratique = students.map(e => e.notePratique).filter(n => n != null);
            const notesFinale = students.map(e => parseFloat(e.noteFinale)).filter(n => !isNaN(n));

            this.statistics.averageTheorique = notesTheorique.length ?
                (notesTheorique.reduce((a, b) => a + b, 0) / notesTheorique.length).toFixed(1) : 0;
            this.statistics.averagePratique = notesPratique.length ?
                (notesPratique.reduce((a, b) => a + b, 0) / notesPratique.length).toFixed(1) : 0;
            this.statistics.averageFinale = notesFinale.length ?
                (notesFinale.reduce((a, b) => a + b, 0) / notesFinale.length).toFixed(1) : 0;
            this.statistics.successCount = notesFinale.filter(n => n >= 10).length;
            this.statistics.failCount = notesFinale.filter(n => n < 10).length;
            this.statistics.pendingCount = students.length - notesFinale.length;
        },

        debounceAutoSave() {
            if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveCourseNotes(false);
            }, 2000);
        },

        saveCourseNotes(showNotification = true) {
            if (!Array.isArray(this.selectedCourse.etudiants_list)) return;
            if (!this.currentUser?.id) return;

            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];

            const index = allCourses.findIndex(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            const etudiants = this.selectedCourse.etudiants_list.map(etudiant => ({
                etudiantId: etudiant.id,
                notes: {
                    theorique: etudiant.noteTheorique ?? null,
                    pratique: etudiant.notePratique ?? null,
                    finale: etudiant.noteFinale ?? null
                }
            }));

            if (index !== -1) {
                allCourses[index] = {
                    ...allCourses[index],
                    etudiants,
                    dateDerniereModification: new Date().toISOString()
                };
            } else {
                allCourses.push({
                    id: 'ntsVlds_' + Date.now(),
                    faculte: this.selectedCourse.faculte,
                    annee: this.selectedCourse.annee,
                    coursId: this.selectedCourse.coursId,
                    coursNom: this.selectedCourse.nom,
                    professeurId: this.currentUser.id,
                    notesValidees: false,
                    dateCreation: new Date().toISOString(),
                    dateDerniereModification: new Date().toISOString(),
                    etudiants
                });
            }

            localStorage.setItem('schola.notes', JSON.stringify(allCourses));
            this.lastSave = new Date();

            if (showNotification) {
                this.$emit('notify', 'Notes enregistrées');
            }
        },

        validateGrades() {
            if (!this.canValidate) {
                alert('Veuillez saisir toutes les notes avant de valider.');
                return;
            }

            if (!confirm('Êtes-vous sûr de vouloir valider ces notes ? Cette action est définitive et verrouillera les notes.')) {
                return;
            }

            this.saveCourseNotes(false);

            const allCourses = JSON.parse(localStorage.getItem('schola.notes')) || [];
            const index = allCourses.findIndex(c =>
                c.faculte === this.selectedCourse.faculte &&
                c.annee === this.selectedCourse.annee &&
                c.coursId === this.selectedCourse.coursId
            );

            if (index === -1) {
                alert('Erreur : impossible de trouver les notes à valider.');
                return;
            }

            allCourses[index].notesValidees = true;
            allCourses[index].dateValidation = new Date().toISOString();

            localStorage.setItem('schola.notes', JSON.stringify(allCourses));

            this.notesIsValide = true;
            this.selectedCourse.notesValidees = true;

            this.loadExistingNotes();

            this.$emit('notesValidated', this.selectedCourse);
            this.$emit('notify', 'Notes validées et verrouillées');
        },

        exportToCSV() {
            const headers = ['Nom', 'Prénom', 'Théorique (/12)', 'Pratique (/8)', 'Finale (/20)', 'Statut'];
            const rows = this.filteredStudents.map(etudiant => [
                etudiant.nom,
                etudiant.prenom,
                etudiant.noteTheorique ?? '',
                etudiant.notePratique ?? '',
                etudiant.noteFinale ?? '',
                etudiant.noteFinale ? (parseFloat(etudiant.noteFinale) >= 10 ? 'Validé' : 'Échec') : 'En attente'
            ]);

            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `notes_${this.selectedCourse.nom}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        sortStudents(field) {
            if (this.sortField === field) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortDirection = 'asc';
            }
        },

        getGradeColor(grade, max = 20) {
            if (grade === null || grade === undefined) return 'var(--color-text-light)';
            const percentage = (grade / max) * 100;
            if (percentage >= 80) return '#10b981'; // Excellent
            if (percentage >= 70) return '#34d399'; // Très bien
            if (percentage >= 60) return '#f59e0b'; // Bien
            if (percentage >= 50) return '#f97316'; // Passable
            return '#ef4444'; // Échec
        },

        clearAllNotes() {
            if (!confirm('Êtes-vous sûr de vouloir effacer toutes les notes ? Cette action est irréversible.')) return;

            this.selectedCourse.etudiants_list.forEach(etudiant => {
                etudiant.noteTheorique = null;
                etudiant.notePratique = null;
                etudiant.noteFinale = null;
            });

            this.saveCourseNotes();
            this.$emit('notify', 'Toutes les notes ont été effacées');
        },

        closeViewer() {
            this.$emit('closeNotesViewer');
        }
    }
};
</script>

<template>
    <div class="grades-container">
        <!-- En-tête avec informations du cours -->
        <div class="course-header">
            <div class="header-main">
                <button class="retour-btn" @click="closeViewer"><i class="bi-arrow-left"></i> Retour</button>
                <h3 class="title">Saisie des notes {{ selectedCourse.nom }}</h3>
                <!-- <div class="course-info">
                    {{ selectedCourse.faculte }} • {{ selectedCourse.annee }}ᵉ année
                    <span v-if="lastSave" class="last-save">
                        • Dernière sauvegarde: {{ lastSave.toLocaleTimeString() }}
                    </span>
                </div> -->
            </div>

            <div class="header-actions">
                <button @click="exportToCSV" class="action-btn export-btn" :disabled="notesIsValide">
                    <i class="bi-download"></i> Exporter CSV
                </button>
            </div>
        </div>

        <!-- Barre de progression et statistiques -->
        <div class="progress-section">
            <div class="statistics">
                <div class="stat-item">
                    <h4 class="stat-value">{{ statistics.averageTheorique }}</h4>
                    <p class="stat-label">Moy. Théorique</p>
                </div>
                <div class="stat-item">
                    <h4 class="stat-value">{{ statistics.averagePratique }}</h4>
                    <p class="stat-label">Moy. Pratique</p>
                </div>
                <div class="stat-item">
                    <h4 class="stat-value">{{ statistics.averageFinale }}</h4>
                    <p class="stat-label">Moy. Finale</p>
                </div>
                <div class="stat-item success">
                    <h4 class="stat-value">{{ statistics.successCount }}</h4>
                    <p class="stat-label">Validés</p>
                </div>
                <div class="stat-item danger">
                    <h4 class="stat-value">{{ statistics.failCount }}</h4>
                    <p class="stat-label">Échecs</p>
                </div>
                <div class="stat-item pending">
                    <h4 class="stat-value">{{ statistics.pendingCount }}</h4>
                    <p class="stat-label">En attente</p>
                </div>
            </div>
        </div>

        <!-- Barre de recherche et tri -->
        <div class="controls-bar">
            <div class="search-box">
                <i class="bi-search"></i>
                <input v-model="searchQuery" type="text" placeholder="Rechercher un étudiant..." class="search-input">
            </div>
            <div class="sort-controls">
                <select v-model="sortField" @change="sortStudents(sortField)" class="select-input ort-select">
                    <option value="nom">Nom</option>
                    <option value="prenom">Prénom</option>
                    <option value="theorique">Note Théorique</option>
                    <option value="finale">Note Finale</option>
                </select>
                <button @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
                    class="add-btn sort-direction">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </button>
            </div>
        </div>

        <!-- Vue Desktop -->
        <div v-if="filteredStudents.length > 0 && !isMobileView" class="desktop-view">
            <div class="table-container">
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th @click="sortStudents('nom')" class="sortable">
                                Étudiant
                                <span v-if="sortField === 'nom'" class="sort-indicator">
                                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th>Note Théorique (/12)</th>
                            <th>Note Pratique (/8)</th>
                            <th @click="sortStudents('finale')" class="sortable">
                                Note Finale (/20)
                                <span v-if="sortField === 'finale'" class="sort-indicator">
                                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="etudiant in filteredStudents" :key="etudiant.id" class="student-row">
                            <td class="student-name">
                                <div class="name">{{ etudiant.nom }} {{ etudiant.prenom }}</div>
                            </td>
                            <td class="grade-cell">
                                <input v-model.number="etudiant.noteTheorique" type="number" min="0" max="12" step="0.5"
                                    :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)" class="grade-input"
                                    :class="{ 'has-value': etudiant.noteTheorique != null }" placeholder="0.0">
                            </td>
                            <td class="grade-cell">
                                <input v-model.number="etudiant.notePratique" type="number" min="0" max="8" step="0.5"
                                    :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)" class="grade-input"
                                    :class="{ 'has-value': etudiant.notePratique != null }" placeholder="0.0">
                            </td>
                            <td class="final-grade">
                                <span :style="{ color: getGradeColor(etudiant.noteFinale) }" class="grade-display">
                                    {{ etudiant.noteFinale || '-' }}
                                </span>
                            </td>
                            <td class="status-cell">
                                <span :class="[
                                    'status-badge',
                                    etudiant.noteFinale ? (parseFloat(etudiant.noteFinale) >= 10 ? 'success' : 'fail') : 'pending'
                                ]">
                                    {{
                                        etudiant.noteFinale ?
                                            (parseFloat(etudiant.noteFinale) >= 10 ? '✓ Validé' : '✗ Échec') :
                                            '⋯ En attente'
                                    }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Vue Mobile -->
        <div v-else-if="filteredStudents.length > 0 && isMobileView" class="mobile-view">
            <div class="mobile-students-list">
                <div v-for="etudiant in filteredStudents" :key="etudiant.id" class="mobile-student-card">
                    <div class="card-header">
                        <div class="student-info">
                            <div class="name">{{ etudiant.nom }} {{ etudiant.prenom }}</div>
                        </div>
                        <span :class="[
                            'mobile-status-badge',
                            etudiant.noteFinale ? (parseFloat(etudiant.noteFinale) >= 10 ? 'success' : 'fail') : 'pending'
                        ]">
                            {{ etudiant.noteFinale ?
                                (parseFloat(etudiant.noteFinale) >= 10 ? '✔' : '✖') :
                                '⋯' }}
                        </span>
                    </div>

                    <div class="grades-grid">
                        <div class="grade-item">
                            <label class="grade-label">Théorique (/12)</label>
                            <input v-model.number="etudiant.noteTheorique" type="number" min="0" max="12" step="0.5"
                                :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)"
                                class="mobile-grade-input" :class="{ 'has-value': etudiant.noteTheorique != null }"
                                placeholder="0.0">
                        </div>
                        <div class="grade-item">
                            <label class="grade-label">Pratique (/8)</label>
                            <input v-model.number="etudiant.notePratique" type="number" min="0" max="8" step="0.5"
                                :disabled="notesIsValide" @input="calculateFinalGrade(etudiant)"
                                class="mobile-grade-input" :class="{ 'has-value': etudiant.notePratique != null }"
                                placeholder="0.0">
                        </div>
                        <div class="grade-item final">
                            <label class="grade-label">Finale (/20)</label>
                            <div class="final-grade-display" :style="{ color: getGradeColor(etudiant.noteFinale) }">
                                {{ etudiant.noteFinale || '-' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="no-students">
            <i class="bi-search"></i>
            <p>Aucun étudiant trouvé pour votre recherche</p>
        </div>

        <!-- Actions principales -->
        <div class="actions-footer">
            <div class="actions-left">
                <span v-if="notesIsValide" class="locked-message">
                    <i class="bi-lock-fill"></i> Notes validées et verrouillées
                </span>
                <span v-else class="edit-message">
                    <i class="bi-pencil-fill"></i> Mode édition activé
                </span>
            </div>

            <div class="actions-right">
                <button v-if="!notesIsValide" @click="saveCourseNotes(true)" class="action-btn save-btn">
                    <i class="bi-save"></i> Enregistrer
                </button>
                <button v-if="!notesIsValide" @click="validateGrades" class="action-btn validate-btn"
                    :class="{ 'disabled': !canValidate }" :disabled="!canValidate">
                    <i class="bi-check-lg"></i> Valider les notes
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.grades-container {
    background: var(--color-surface);
    padding: 1rem;
    border: 2px solid var(--color-primary);
    border-radius: 15px;
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-main {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-main .retour-btn {
    all: unset;
    background: var(--hover-lw);
    width: 90px;
    height: 40px;
    text-align: center;
    border-radius: 50px;
    font-size: 14px;
    cursor: pointer;
    transition: all .5s ease;
}

.header-main .retour-btn:hover {
    background: var(--hover-lw-2);
    gap: 1rem;
}

.header-main .title {
    color: var(--color-text);
}

.course-info {
    color: var(--color-text-light);
    font-size: 0.9rem;
}

.last-save {
    font-size: 0.8rem;
    opacity: 0.7;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-btn {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.export-btn {
    background: #10b981;
    color: white;
}

.clear-btn {
    background: #ef4444;
    color: white;
}

.save-btn {
    background: #3b82f6;
    color: white;
}

.validate-btn {
    background: var(--color-success);
    color: white;
}

.validate-btn.disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
}

.action-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Statistiques */
.statistics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.stat-item {
    text-align: center;
    padding: 0.75rem;
    background: #f8f9fa;
    color: var(--color-text);
    border-radius: 6px;
    border-left: 4px solid var(--color-primary);
}

.stat-item.success {
    border-left: 4px solid var(--color-success);
}

.stat-item.danger {
    border-left: 4px solid var(--color-danger);
}

.stat-item.pending {
    border-left: 4px solid var(--color-warning);
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--color-text);
    text-transform: uppercase;
    font-weight: 600;
}

/* Contrôles */
.controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-block: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.search-box {
    position: relative;
    flex: 1;
}

.search-box i {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text);
}

.search-input {
    width: 100%;
    padding: 1rem;
    border: none;
    background-color: var(--hover-lw);
    color: var(--color-primary);
    border-radius: 50px;
    font-size: 14px;
}

.sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.sort-direction {
    width: 40px;
    height: 40px;
    cursor: pointer;
}

/* Tableau Desktop */
.grades-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-surface);
    overflow: hidden;
    border: none;
}

.grades-table th {
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: 1rem;
    text-align: left;
    /* font-weight: 600; */
}

.grades-table th.sortable {
    cursor: pointer;
    user-select: none;
}

.grades-table th.sortable:hover {
    background: var(--color-primary-dark);
}

.sort-indicator {
    margin-left: 0.5rem;
}

.grades-table td {
    padding: .5rem;
    border-bottom: 1px solid var(--color-text);
}

.student-name .name {
    font-weight: 600;
}

.student-name .student-id {
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-top: 0.25rem;
}

.grade-cell {
    padding: 0.5rem;
}

.grade-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-text);
    border-radius: 4px;
    transition: all 0.5s ease;
}

.grade-input.has-value {
    border-color: var(--color-primary);
    background: var(--color-surface);
    color: var(--color-text);
}

.grade-input:focus {
    outline: none;
    /* border-color: #3b82f6; */
    /* box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); */
}

.grade-input:disabled {
    background: var(--color-background);
    color: var(--color-text);
    cursor: not-allowed;
}

.final-grade {
    font-weight: 600;
    font-size: 14px;
}

.status-badge {
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-family: "Poppins", sans-serif;
    font-weight: 600;
}

.status-badge.success {
    background: var(--color-success-bg);
    color: var(--color-success);
}

.status-badge.fail {
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

/* Vue Mobile */
.mobile-students-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.mobile-student-card {
    background: var(--color-surface);
    border: 2px solid var(--hover-lw);
    padding: 1rem;
    border-radius: 8px;
    transition: all .5s ease;
}

/* .mobile-student-card:hover {
    border-color: var(--color-primary);
} */

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.student-info .name {
    font-weight: 600;
}

.student-info .student-id {
    font-size: 0.8rem;
    color: var(--color-text-light);
}

.mobile-status-badge {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.mobile-status-badge.success {
    background: #d1fae5;
    color: #065f46;
}

.mobile-status-badge.fail {
    background: #fee2e2;
    color: #991b1b;
}

.mobile-status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.grades-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .5rem;
}

.grade-item.final {
    grid-column: 1 / -1;
}

.grade-label {
    color: var(--color-text);
    display: block;
    font-size: 12px;
}

.mobile-grade-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-primary);
    color: var(--color-text);
    border-radius: 4px;
    font-size: 14px;
}

.mobile-grade-input.has-value {
    border-color: var(--color-accent);
    background: var(--hover-lw);
    transition: all .5s ease;
}

/* .mobile-grade-input.has-value:hover {
    border-color: var(--color-primary);
}

*/
.final-grade-display {
    font-weight: 700;
    font-size: 14px;
}

/* États */
.no-students {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-light);
}

.no-students i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.actions-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-text);
    flex-wrap: wrap;
    gap: 1rem;
}

.locked-message,
.edit-message {
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.locked-message {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.edit-message {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #92400e;
}

.actions-right {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 768px) {
    .course-header {
        flex-direction: column;
    }

    .header-actions {
        width: 100%;
        justify-content: center;
    }

    .controls-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }

    .statistics {
        grid-template-columns: repeat(2, 1fr);
    }

    .actions-footer {
        flex-direction: column;
        text-align: center;
    }

    .actions-right {
        justify-content: center;
    }
}

@media (min-width: 769px) {
    .mobile-view {
        display: none;
    }
}

@media (max-width: 768px) {
    .desktop-view {
        display: none;
    }
}
</style>