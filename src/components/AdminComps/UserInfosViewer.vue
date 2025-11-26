<script>
import ModalCmp from '../ModalCmp.vue';

export default {
    props: ["userId"],
    components: { ModalCmp },
    data() {
        return {
            user: null,
            loading: false,
            error: null
        }
    },
    mounted() {
        this.loadUserData();
    },
    watch: {
        userId: {
            immediate: true,
            handler(newUserId) {
                if (newUserId) {
                    this.loadUserData();
                }
            }
        }
    },
    methods: {
        loadUserData() {
            if (!this.userId) {
                this.error = "Aucun ID utilisateur fourni";
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const usersData = localStorage.getItem('schola.users');

                if (!usersData) {
                    this.error = "Aucune donnée utilisateur trouvée dans le localStorage";
                    return;
                }

                const users = JSON.parse(usersData);
                const foundUser = users.find(user => user.id === this.userId);

                if (foundUser) {
                    this.user = foundUser;
                } else {
                    this.error = `Utilisateur avec l'ID "${this.userId}" non trouvé`;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données utilisateur:', error);
                this.error = "Erreur lors du chargement des données utilisateur";
            } finally {
                this.loading = false;
            }
        },

        formatDate(dateString) {
            if (!dateString) return 'Non spécifié';
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getRoleDisplayName(role) {
            const roles = {
                'admin': 'Administrateur',
                'professeur': 'Professeur',
                'etudiant': 'Étudiant'
            };
            return roles[role] || role;
        }
    },
    computed: {
        userFaculte() {
            return this.user?.faculte || 'Non spécifié';
        },
        userAnnee() {
            return this.user?.annee || 'Non spécifié';
        },
        annoncesCount() {
            return this.user?.annonces?.filter(annonce => annonce !== null)?.length || 0;
        },
        affectationsCount() {
            return this.user?.affectations?.length || 0;
        },
        notesCount() {
            return this.user?.notes?.length || 0;
        }
    }
}
</script>

<template>
    <ModalCmp>
        <div class="modal-user-infos-header">

            <h3>Informations de l'utilisateur</h3>
            <button class="close-btn bi-x" @click="$emit('closeUsrDltMdl')"></button>
        </div>
        <div class="modal-body">
            <!-- État de chargement -->
            <div v-if="loading" class="loading-state">
                <p>Chargement des informations...</p>
            </div>

            <!-- État d'erreur -->
            <div v-else-if="error" class="error-state">
                <p class="error-message">{{ error }}</p>
            </div>

            <!-- Affichage des données utilisateur -->
            <div v-else-if="user" class="user-info">
                <!-- Informations principales -->
                <div class="user-section">
                    <h4>Informations personnelles</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nom complet:</label>
                            <span>{{ user.prenom }} {{ user.nom }}</span>
                        </div>
                        <div class="info-item">
                            <label>Email:</label>
                            <span>{{ user.email }}</span>
                        </div>
                        <div class="info-item">
                            <label>Rôle:</label>
                            <!-- <span class="role-badge" :class="user.role"> -->
                            {{ getRoleDisplayName(user.role) }}
                            <!-- </span> -->
                        </div>
                        <div class="info-item">
                            <label>Date de création:</label>
                            <span>{{ formatDate(user.createdAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Informations spécifiques au rôle -->
                <div v-if="user.role === 'etudiant'" class="user-section">
                    <h4>Informations étudiant</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Faculté:</label>
                            <span>{{ userFaculte }}</span>
                        </div>
                        <div class="info-item">
                            <label>Année d'étude:</label>
                            <span>{{ userAnnee }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="user.role === 'professeur' && user.affectations" class="user-section">
                    <h4>Affectations ({{ affectationsCount }})</h4>
                    <div class="affectations-container">
                        <div v-for="affectation in user.affectations" :key="affectation.nom" class="affectation-item">
                            <h4>{{ affectation.nom }}</h4>
                            <div v-for="annee in affectation.annees" :key="annee.annee" class="annee-item">
                                <strong>Année {{ annee.annee }}:</strong>
                                <ul>
                                    <li v-for="cours in annee.cours" :key="cours.id">
                                        {{ cours.nom }} ({{ cours.duree }}h) - Année {{ cours.anneeEtude }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Aucun utilisateur trouvé -->
            <div v-else class="no-data">
                <p>Aucune donnée utilisateur à afficher</p>
            </div>
        </div>
    </ModalCmp>
</template>

<style scoped>
.modal-user-infos-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-user-infos-header .close-btn {
    all: unset;
    background: var(--hover-lw);
    color: var(--color-primary);
    width: 35px;
    height: 35px;
    border-radius: 50px;
    text-align: center;
    cursor: pointer;
    transition: all .5s ease;
}

.modal-user-infos-header .close-btn:hover {
    background: var(--color-accent);
}

.user-info {
    max-height: 70vh;
    overflow-y: auto;
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.user-section {
    padding: 15px;
    border: 1px solid var(--hover-lw);
    border-radius: 8px;
    background-color: var(--color-background);
}

.user-section h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--color-primary-dark);
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 5px;
}

.info-grid,
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
}

.info-item,
.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    font-size: 12px;
}

.info-item label,
.stat-item label {
    font-weight: bold;
    color: var(--color-primary-dark);
}

.role-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
}

.role-badge.admin {
    background-color: #dc3545;
    color: white;
}

.role-badge.professeur {
    background-color: #007bff;
    color: white;
}

.role-badge.etudiant {
    background-color: #28a745;
    color: white;
}

.affectations-container {
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.affectation-item {
    padding: 10px;
    background-color: white;
    border-radius: 5px;
    border-left: 4px solid var(--color-primary);
}

.annee-item {
    margin-left: 10px;
}

.annee-item ul {
    margin: 5px 0;
    padding-left: 20px;
}

.annee-item li {
    margin: 2px 0;
}

.text-success {
    color: #28a745;
    font-weight: bold;
}

.text-warning {
    color: #ffc107;
    font-weight: bold;
}

.loading-state,
.error-state,
.no-data {
    text-align: center;
    padding: 40px;
}

.error-message {
    color: #dc3545;
    font-weight: bold;
}

.stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stat-item {
    text-align: center;
    flex-direction: column;
    border: none;
}

.stat-item span {
    font-size: 1.5em;
    font-weight: bold;
    color: #007bff;
}
</style>