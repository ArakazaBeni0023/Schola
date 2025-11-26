<script>
export default {
    name: 'AdminCoursesView',
    data() {
        return {
            allCourses: [],
            allUsers: [],
            filter: 'tous',
            isNotif: false
        };
    },
    created() {
        this.loadData();
    },
    computed: {
        filteredCourses() {
            if (this.filter === 'valides') {
                return this.allCourses.filter(c => c.notesValidees);
            } else if (this.filter === 'non-valides') {
                return this.allCourses.filter(c => !c.notesValidees);
            }
            return this.allCourses;
        }
    },
    methods: {
        loadData() {
            const rawCourses = localStorage.getItem('schola.notes');
            const rawUsers = localStorage.getItem('schola.users');

            this.allCourses = rawCourses ? JSON.parse(rawCourses) : [];
            this.allUsers = rawUsers ? JSON.parse(rawUsers) : [];
        },
        getProfName(id) {
            const prof = this.allUsers.find(u => u.id === id);
            return prof ? `${prof.nom} ${prof.prenom}` : `Prof inconnu (${id})`;
        },
        formatDate(dateStr) {
            const d = new Date(dateStr);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
        },
        getStudentCount(cours) {
            return cours.etudiants?.length || 0;
        },
        getAverage(cours) {
            const notes = cours.etudiants
                .map(e => parseFloat(e.notes.finale))
                .filter(n => !isNaN(n));

            if (notes.length === 0) return '-';
            const sum = notes.reduce((a, b) => a + b, 0);
            return (sum / notes.length).toFixed(1);
        },
        toggleCourseLock(id, lock = true) {
            const action = lock ? 'verrouiller' : 'déverrouiller';
            if (!confirm(`Voulez-vous vraiment ${action} ce cours?`)) return;

            const index = this.allCourses.findIndex(c => c.id === id);
            if (index !== -1) {
                this.allCourses[index].notesValidees = lock;
                this.allCourses[index].dateDerniereModification = new Date().toISOString();

                localStorage.setItem('schola.notes', JSON.stringify(this.allCourses));
                this.$emit('notify', `Cours ${lock ? 'verrouillé' : 'déverrouillé'} avec succès`);
            }
        },
    }
};
</script>

<template>
    <div class="admin-container">
        <div class="filter-container">
            <select v-model="filter" class="select-input">
                <option value="tous">Tous</option>
                <option value="valides">Validés</option>
                <option value="non-valides">Non validés</option>
            </select>
        </div>

        <div v-if="filteredCourses.length === 0" class="empty-msg">
            Aucun cours trouvé pour ce filtre.
        </div>

        <div class="courses-container">
            <div v-for="cours in filteredCourses" :key="cours.coursId" class="course-block">
                <h3 class="title">{{ cours.coursNom }} - {{ cours.annee }}ᵉ année - {{ cours.faculte }} </h3>
                <div class="stats">
                    <span><i class="bi-person-fill"></i> {{ getProfName(cours.professeurId) }}</span>
                    <span><i class="bi-pie-chart-fill "></i> {{ getAverage(cours) }} </span>
                    <span>
                        <i class="bi-people-fill"></i>
                        {{ getStudentCount(cours) }}
                        {{ getStudentCount(cours) === 1 ? 'Étudiant' : 'Étudiants' }}
                    </span>
                    <span>
                        <i class="bi-clock-history"></i>
                        {{ formatDate(cours.dateDerniereModification) }}
                    </span>
                    <div class="status" :class="cours.notesValidees ? 'validé' : 'non-validé'">
                        <i :class="cours.notesValidees ? 'bi-lock-fill' : 'bi-unlock-fill'"></i>
                        {{ cours.notesValidees ? 'Validé et Verrouillé' : 'Non validé et Non Verrouillé' }}
                    </div>
                </div>
                <div class="grp-btns" v-if="isNotif === false">
                    <!-- Bouton pour verrouiller -->
                    <button class="unlock-btn" @click="toggleCourseLock(cours.id, true)" v-if="!cours.notesValidees">
                        <i class="bi-unlock"></i> Verrouiller
                    </button>

                    <!-- Bouton pour déverrouiller -->
                    <button class="lock-btn" @click="toggleCourseLock(cours.id, false)" v-if="cours.notesValidees">
                        <i class="bi-lock"></i> Déverrouiller
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-container {
    gap: 1rem;
}

.filter-container {
    margin-bottom: 1rem;
}

.courses-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto;
    gap: .5rem;
}

.course-block {
    background: var(--hover-lw);
    border: 1px solid var(--color-secondary);
    padding: 15px;
    border-radius: 6px;
    position: relative;
}

.course-block .stats {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin-top: 1rem;
}

span {
    font-size: 12px;
    border: 1px solid var(--color-secondary);
    padding: .3rem .5rem;
    border-radius: 50px;
}

.status {
    font-weight: bold;
    padding: 0.3rem .5rem;
    border-radius: 50px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: .2rem;
    cursor: pointer;
}

.validé {
    background-color: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.non-validé {
    background-color: var(--color-danger-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
}

.empty-msg {
    font-style: italic;
    color: var(--color-muted);
}

.grp-btns {
    width: 100%;
    margin-top: 1rem;
}

.grp-btns button {
    all: unset;
    width: stretch;
    padding: .5rem 1rem;
    border-radius: 50px;
    font-size: 12px;
    color: var(--color-text-light);
    text-align: center;
    cursor: pointer;
    transition: all .5s ease;
}

.grp-btns .lock-btn {
    background-color: var(--color-danger);
}

.grp-btns .lock-btn:hover {
    opacity: 0.8;
}

.grp-btns .unlock-btn {
    background-color: var(--color-success);
}

.grp-btns .unlock-btn:hover {
    opacity: 0.8;
}

@media (max-width:768px) {
    .courses-container {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
