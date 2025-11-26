<script>
import HeaderCmp from './HeaderCmp.vue';
import RegistrationsCmp from './AdminComps/RegistrationsCmp.vue';
import UserManagement from './AdminComps/UserManagement.vue';
import FacultyManagement from './AdminComps/FacultyManagement.vue';
import CoursesManagement from './AdminComps/CoursesManagement.vue';
import StudentOverview from './AdminComps/StudentOverview.vue';
import ProfOverview from './AdminComps/ProfOverview.vue';
import ValidatedCourses from './AdminComps/ValidatedCourses.vue';
import TimetableCreator from './AdminComps/TimetableCreator.vue';
import TimetableViewer from './AdminComps/TimetableViewer.vue';


export default {
    name: 'AdministrationView',
    components: {
        HeaderCmp,
        RegistrationsCmp,
        UserManagement,
        FacultyManagement,
        CoursesManagement,
        ProfOverview,
        StudentOverview,
        ValidatedCourses,
        TimetableCreator,
        TimetableViewer,

    },

    data() {
        return {
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
            activeCard: null,
            searchQuery: '',
            selectedCategory: 'all',
            cards: [],
            categories: [
                { id: 'all', name: 'Toutes les sections', count: 9 },
                { id: 'users', name: 'Utilisateurs', count: 3 },
                { id: 'academic', name: 'Académique', count: 4 },
                { id: 'planning', name: 'Planning', count: 2 }
            ],
            showLogout: false
        }
    },

    computed: {
        usersData() {
            return JSON.parse(localStorage.getItem('schola.users') || '[]');
        },

        facultiesData() {
            return JSON.parse(localStorage.getItem('schola.facultes') || '[]');
        },

        notesData() {
            return JSON.parse(localStorage.getItem('schola.notes') || '[]');
        },

        inscriptionsData() {
            const data = localStorage.getItem('schola.inscriptions');
            return data ? JSON.parse(data) : {};
        },

        // Statistiques calculées
        stats() {
            const users = this.usersData || [];
            const faculties = this.facultiesData || [];
            const notes = this.notesData || [];

            const totalUsers = users.length;
            const students = users.filter(u => u.role === 'etudiant').length;
            const professors = users.filter(u => u.role === 'professeur').length;
            const admins = users.filter(u => u.role === 'admin').length;

            const totalFaculties = faculties.length;
            const totalCourses = faculties.reduce((acc, fac) => acc + (fac.courses?.length || 0), 0);

            const validatedNotes = notes.filter(n => n.notesValidees).length;
            const pendingNotes = notes.filter(n => !n.notesValidees).length;

            const hasPendingInscription = Object.keys(this.inscriptionsData || {}).length > 0;

            return {
                totalUsers,
                students,
                professors,
                admins,
                totalFaculties,
                totalCourses,
                validatedNotes,
                pendingNotes,
                hasPendingInscription
            };
        },

        filteredCards() {
            let filtered = this.cards;

            if (this.searchQuery) {
                filtered = filtered.filter(card =>
                    card.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    card.description.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }

            if (this.selectedCategory !== 'all') {
                filtered = filtered.filter(card => card.category === this.selectedCategory);
            }

            return filtered;
        },

        activeComponent() {
            return this.activeCard?.component || null;
        }
    },

    methods: {
        initializeCards() {
            const stats = this.stats;

            this.cards = [
                {
                    id: 1,
                    title: 'Gestion des Utilisateurs',
                    description: 'Gérez tous les utilisateurs de la plateforme',
                    icon: 'bi-people',
                    color: '#3498db',
                    category: 'users',
                    stats: `${stats.totalUsers} utilisateurs`,
                    component: UserManagement
                },
                {
                    id: 2,
                    title: 'Vue d\'ensemble des Étudiants',
                    description: 'Consultez le profil et les performances des étudiants',
                    icon: 'bi-mortarboard',
                    color: '#2ecc71',
                    category: 'users',
                    stats: `${stats.students} étudiants`,
                    component: StudentOverview
                },
                {
                    id: 3,
                    title: 'Vue d\'ensemble des Professeurs',
                    description: 'Gérez le personnel enseignant et leurs affectations',
                    icon: 'bi-person-workspace',
                    color: '#e74c3c',
                    category: 'users',
                    stats: `${stats.professors} professeurs`,
                    component: ProfOverview
                },
                {
                    id: 4,
                    title: 'Gestion des Facultés',
                    description: 'Créez et modifiez les facultés et filières',
                    icon: 'bi-building',
                    color: '#9b59b6',
                    category: 'academic',
                    stats: `${stats.totalFaculties} facultés`,
                    component: FacultyManagement
                },
                {
                    id: 5,
                    title: 'Gestion des Cours',
                    description: 'Organisez les cours par faculté et année',
                    icon: 'bi-book',
                    color: '#f39c12',
                    category: 'academic',
                    stats: `${stats.totalCourses} cours`,
                    component: CoursesManagement
                },
                {
                    id: 6,
                    title: 'Cours Validés',
                    description: 'Consultez les cours validés et leurs notes',
                    icon: 'bi-check2-circle',
                    color: '#27ae60',
                    category: 'academic',
                    stats: `${stats.validatedNotes} validés`,
                    component: ValidatedCourses
                },
                {
                    id: 7,
                    title: 'Inscriptions en Attente',
                    description: 'Validez les nouvelles demandes d\'inscription',
                    icon: 'bi-pencil-square',
                    color: '#e67e22',
                    category: 'academic',
                    stats: stats.hasPendingInscription ? 'Nouvelle demande' : 'Aucune demande',
                    component: RegistrationsCmp
                },
                {
                    id: 8,
                    title: 'Créateur d\'Emploi du Temps',
                    description: 'Créez et organisez les emplois du temps',
                    icon: 'bi-calendar',
                    color: '#34495e',
                    category: 'planning',
                    stats: 'Créer',
                    component: TimetableCreator
                },
                {
                    id: 9,
                    title: 'Visualisateur d\'Emploi du Temps',
                    description: 'Consultez les emplois du temps existants',
                    icon: 'bi-calendar3-range',
                    color: '#16a085',
                    category: 'planning',
                    stats: 'Voir',
                    component: TimetableViewer
                }
            ];

            this.categories = [
                { id: 'all', name: 'Toutes les sections', count: this.cards.length },
                { id: 'users', name: 'Utilisateurs', count: this.cards.filter(c => c.category === 'users').length },
                { id: 'academic', name: 'Académique', count: this.cards.filter(c => c.category === 'academic').length },
                { id: 'planning', name: 'Planning', count: this.cards.filter(c => c.category === 'planning').length }
            ];
        },

        openCard(card) {
            this.activeCard = card;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        closeCard() {
            this.activeCard = null;
        },

        setCategory(categoryId) {
            this.selectedCategory = categoryId;
        },


    },

    mounted() {
        this.initializeCards();
    }
}
</script>

<template>
    <div class="global-container">
        <HeaderCmp class="navbar-fixed" />

        <div class="admin-dashboard">
            <!-- En-tête du dashboard -->
            <div class="dashboard-header" v-show="!activeCard">
                <div class="header-content">
                    <h1 class="main-title">Espace Administration</h1>
                    <p class="subtitle">Gérez toutes les fonctionnalités de votre plateforme</p>
                </div>

                <!-- Barre de recherche et filtres -->
                <div class="controls-container">
                    <div class="search-box">
                        <input v-model="searchQuery" type="text" placeholder="Rechercher une fonctionnalité..."
                            class="search-input">
                        <span class="search-icon bi-search"></span>
                    </div>

                    <div class="category-filters">
                        <button v-for="category in categories" :key="category.id"
                            :class="['category-btn', { active: selectedCategory === category.id }]"
                            @click="setCategory(category.id)">
                            {{ category.name }}
                            <span class="category-count">{{ category.count }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenu principal -->
            <div class="dashboard-content">
                <!-- Vue cartes -->
                <div v-if="!activeCard" class="cards-grid">
                    <div v-for="card in filteredCards" :key="card.id" :class="['admin-card', `card-${card.category}`]"
                        @click="openCard(card)" @keypress.enter="openCard(card)" tabindex="0">
                        <div class="card-header">
                            <div class="card-icon" :style="{ backgroundColor: card.color }">
                                <i :class="card.icon"></i>
                            </div>
                            <div class="card-stats">
                                {{ card.stats }}
                            </div>
                        </div>

                        <div class="card-content">
                            <h3 class="card-title">{{ card.title }}</h3>
                            <p class="card-description">{{ card.description }}</p>
                        </div>

                        <div class="card-footer">
                            <span class="card-cta">Ouvrir <i class="bi-chevron-right"></i></span>
                        </div>

                        <div class="card-hover-effect"></div>
                    </div>

                    <div v-if="filteredCards.length === 0" class="no-results">
                        <div class="no-results-icon"><i class="bi-search"></i></div>
                        <h3>Aucun résultat trouvé</h3>
                        <p>Essayez de modifier votre recherche ou vos filtres</p>
                    </div>
                </div>

                <!-- Vue détaillée du composant -->
                <div v-else class="card-detail-view">
                    <div class="detail-header">
                        <button class="back-button bi-arrow-left" @click="closeCard"></button>
                        <div class="detail-title">
                            <div class="title-icon" :style="{ backgroundColor: activeCard.color }">
                                <i :class="activeCard.icon"></i>
                            </div>
                            <div>
                                <h2>{{ activeCard.title }}</h2>
                                <p class="detail-description">{{ activeCard.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="detail-content">
                        <component :is="activeComponent" />
                    </div>
                </div>

                <!-- Sidebar calendrier (seulement en mode cartes) -->
                <aside v-if="!activeCard" class="calendar-sidebar">
                    <div class="sidebar-header">
                        <h3>Calendrier</h3>
                    </div>
                    <VCalendar class="calendrier" :attributes="attributes" />

                    <!-- Statistiques rapides -->
                    <div class="quick-stats">
                        <h4>Aperçu rapide</h4>
                        <div class="stat-item">
                            <span class="stat-label">Étudiants inscrits</span>
                            <span class="stat-value">{{ stats.students }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Professeurs</span>
                            <span class="stat-value">{{ stats.professors }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Facultés</span>
                            <span class="stat-value">{{ stats.totalFaculties }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Cours validés</span>
                            <span class="stat-value">{{ stats.validatedNotes }}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>

</template>

<style scoped>
.global-container,
.admin-dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.global-container {
    min-height: 100vh;
    padding: 1rem 2.5rem;
}

.dashboard-header {
    background: var(--color-surface);
    padding: 3rem;
    border: 2px solid var(--color-primary);
    border-radius: 15px;
}

.header-content {
    text-align: center;
    margin-bottom: 30px;
}

.main-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.subtitle {
    color: var(--color-muted);
    font-size: 14px;
}

.controls-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.search-box {
    position: relative;
    width: 80%;
    margin: 0 auto;
}

.search-input {
    width: 100%;
    padding: .75rem 1rem;
    border: 2px solid var(--hover-lw);
    border-radius: 50px;
    font-size: 14px;
    background: #f8f9fa;
    transition: all 0.5s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(52, 152, 219, 0.2);
}

.search-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    color: var(--color-text);
}

.category-filters {
    width: 90%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
}

.category-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    padding: .75rem 1rem;
    border: 2px solid var(--hover-lw);
    background: var(--color-surface);
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.5s ease;
    color: var(--color-muted);
    font-family: 'Poppins', sans-serif;
}

.category-btn:hover {
    border-color: var(--color-primary);
}

.category-btn.active {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-light);
}

.category-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.dashboard-content {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 24px;
    align-items: start;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    padding-block-end: 1.5rem;
}

.admin-card {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.5s ease;
    position: relative;
    overflow: hidden;
    border: 2px solid var(--hover-lw);
}

.admin-card:hover {
    border: 2px solid var(--color-primary);
}

.admin-card:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.card-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--color-text-light);
}

.card-stats {
    background: var(--hover-lw);
    padding: 6px 12px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
}

.card-content {
    margin-bottom: 20px;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    line-height: 1.3;
}

.card-description {
    color: #6c757d;
    font-size: 14px;
    line-height: 1.5;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-cta {
    color: var(--color-text);
    font-weight: 600;
    font-size: 14px;
    transition: transform 0.3s ease;
}

.admin-card:hover .card-cta {
    transform: translateX(4px);
}

.card-hover-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease;
}

.admin-card:hover .card-hover-effect {
    left: 100%;
}

/* Vue détaillée */
.card-detail-view {
    background: var(--color-surface);
    border-radius: 15px;
    padding: 2rem;
    grid-column: 1 / -1;
    border: 2px solid var(--color-primary);
}

.detail-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--hover-lw);
}

.back-button {
    all: unset;
    background: var(--hover-lw);
    color: var(--color-primary);
    font-size: 14px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50px;
    font-weight: 500;
    transition: color 0.3s ease;
    text-align: center;
}

.back-button:hover {
    background-color: var(--color-primary);
    color: var(--color-text-light);
}

.detail-title {
    display: flex;
    align-items: center;
    gap: 20px;
}

.title-icon {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: var(--color-text-light);
}

.detail-title h2 {
    color: var(--color-text);
    margin: 0;
    font-size: 24px;
    text-transform: uppercase;
}

.detail-description {
    color: var(--color-muted);
    font-size: 14px;
    margin-top: 8px;
}

.detail-content {
    animation: fadeInUp 0.5s ease;
}

/* Sidebar calendrier */
.calendar-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.calendrier {
    border-radius: 15px;
    padding: 24px;
}

.quick-stats {
    background: var(--color-surface);
    border-radius: 16px;
    padding: 24px;
    border: 2px solid var(--hover-lw);
}

.quick-stats h4 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.1rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f3f4;
}

.stat-item:last-child {
    border-bottom: none;
}

.stat-label {
    color: #6c757d;
    font-size: 14px;
}

.stat-value {
    background: #3498db;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
}

/* États vides */
.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.no-results-icon {
    font-size: 48px;
    margin-bottom: 20px;
    opacity: 0.5;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 1200px) {
    .dashboard-content {
        grid-template-columns: 1fr;
    }

    .calendar-sidebar {
        order: -1;
    }
}

@media (max-width: 768px) {

    .admin-dashboard {
        padding-block-end: 5rem;
    }

    .global-container {
        padding: 1rem;
    }

    .dashboard-header {
        padding: 20px;
    }

    .main-title {
        font-size: 2rem;
    }

    .search-box {
        width: 100%;
    }

    .cards-grid {
        grid-template-columns: 1fr;
    }

    .category-filters {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 10px;
        width: 100%;
    }

    .card-detail-view {
        padding: 20px;
    }

    .detail-title {
        flex-direction: column;
        text-align: center;
        gap: 15px;
    }
}
</style>