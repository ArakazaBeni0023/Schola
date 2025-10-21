<script>
export default {
    name: 'AdminStudentRegistrationView',
    data() {
        return {
            inscriptions: [],
            users: [],
            searchQuery: '',
            selectedStatus: 'all'
        };
    },
    computed: {
        filteredInscriptions() {
            let filtered = this.inscriptions;

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(inscription =>
                    inscription.nom.toLowerCase().includes(query) ||
                    inscription.prenom.toLowerCase().includes(query) ||
                    inscription.email.toLowerCase().includes(query)
                );
            }

            if (this.selectedStatus !== 'all') {
                filtered = filtered.filter(inscription =>
                    inscription.status === this.selectedStatus
                );
            }

            return filtered;
        },
        pendingCount() {
            return this.inscriptions.filter(i => i.status === 'pending').length;
        },
        acceptedCount() {
            return this.inscriptions.filter(i => i.status === 'accepted').length;
        },
        rejectedCount() {
            return this.inscriptions.filter(i => i.status === 'rejected').length;
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            const inscriptionsData = JSON.parse(localStorage.getItem('schola.inscriptions')) || [];

            this.inscriptions = inscriptionsData.map(inscription => ({
                ...inscription,
                status: inscription.status || 'pending'
            }));

            this.users = JSON.parse(localStorage.getItem('schola.users')) || [];
        },
        generateUserId() {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            return `u_${timestamp}_${randomStr}`;
        },
        acceptRegistration(inscription) {
            if (confirm(`Voulez-vous accepter l'inscription de ${inscription.prenom} ${inscription.nom} ?`)) {

                const userId = this.generateUserId();

                const newUser = {
                    id: userId,
                    nom: inscription.nom,
                    prenom: inscription.prenom,
                    email: inscription.email,
                    role: "etudiant",
                    password: inscription.motDePasse,
                    emailValidated: false,
                    createdAt: new Date().toISOString(),

                    faculte: inscription.faculte,
                    annee: inscription.annee,
                    dateNaissance: inscription.dateNaissance,
                    sexe: inscription.sexe,
                    telephone: inscription.telephone
                };

                this.users.push(newUser);
                localStorage.setItem('schola.users', JSON.stringify(this.users));

                this.removeInscription(inscription.email, 'accepted');

                alert(`Inscription de ${inscription.prenom} ${inscription.nom} acceptée avec succès !`);
            }
        },
        rejectRegistration(inscription) {
            if (confirm(`Voulez-vous rejeter l'inscription de ${inscription.prenom} ${inscription.nom} ?`)) {
                this.removeInscription(inscription.email, 'rejected');
                alert(`Inscription de ${inscription.prenom} ${inscription.nom} rejetée.`);
            }
        },
        removeInscription(email, status) {
            const inscriptionIndex = this.inscriptions.findIndex(ins => ins.email === email);
            if (inscriptionIndex !== -1) {
                if (status === 'accepted') {
                    this.inscriptions.splice(inscriptionIndex, 1);
                } else {
                    this.inscriptions[inscriptionIndex].status = 'rejected';
                }

                localStorage.setItem('schola.inscriptions', JSON.stringify(this.inscriptions));

                this.loadData();
            }
        },
        getStatusBadgeClass(status) {
            switch (status) {
                case 'pending': return 'status-badge pending';
                case 'accepted': return 'status-badge accepted';
                case 'rejected': return 'status-badge rejected';
                default: return 'status-badge';
            }
        },
        getStatusText(status) {
            switch (status) {
                case 'pending': return 'En attente';
                case 'accepted': return 'Acceptée';
                case 'rejected': return 'Rejetée';
                default: return status;
            }
        },
        exportData() {
            const dataStr = JSON.stringify(this.inscriptions, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `inscriptions_etudiants_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        }
    }
};
</script>

<template>
    <div class="admin-container">
        <div class="admin-header">
            <h3 class="title">Gestion des inscriptions étudiantes</h3>
            <div class="stats-grid">
                <div class="stat-item total">
                    <span class="stat-number">{{ inscriptions.length }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item pending">
                    <span class="stat-number">{{ pendingCount }}</span>
                    <span class="stat-label">En attente</span>
                </div>
                <div class="stat-item accepted">
                    <span class="stat-number">{{ acceptedCount }}</span>
                    <span class="stat-label">Acceptées</span>
                </div>
                <div class="stat-item rejected">
                    <span class="stat-number">{{ rejectedCount }}</span>
                    <span class="stat-label">Rejetées</span>
                </div>
            </div>
        </div>

        <div class="admin-controls">
            <div class="search-filter">
                <input v-model="searchQuery" type="text" placeholder="Rechercher par nom, prénom ou email..."
                    class="search-input">

                <select v-model="selectedStatus" class="status-filter">
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="accepted">Acceptées</option>
                    <option value="rejected">Rejetées</option>
                </select>
            </div>
            <button @click="exportData" class="export-btn">
                Exporter les données
            </button>
        </div>

        <!-- Version Tableau pour PC -->
        <div class="table-container desktop-view">
            <table class="inscriptions-table" v-if="filteredInscriptions.length > 0">
                <thead>
                    <tr>
                        <th>Étudiant</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Faculté</th>
                        <th>Année</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="inscription in filteredInscriptions" :key="inscription.email">
                        <td class="student-info">
                            <div class="student-name">{{ inscription.prenom }} {{ inscription.nom }}</div>
                            <div class="student-details">
                                {{ inscription.dateNaissance }} • {{ inscription.sexe === 'M' ? 'M' : 'F' }}
                            </div>
                        </td>
                        <td>{{ inscription.email }}</td>
                        <td>{{ inscription.telephone || '-' }}</td>
                        <td>{{ inscription.faculte }}</td>
                        <td>Année {{ inscription.annee }}</td>
                        <td>
                            <span :class="getStatusBadgeClass(inscription.status)">
                                {{ getStatusText(inscription.status) }}
                            </span>
                        </td>
                        <td class="actions">
                            <template v-if="inscription.status === 'pending'">
                                <button @click="acceptRegistration(inscription)" class="btn-accept btn-small"
                                    title="Accepter l'inscription">
                                    ✓
                                </button>
                                <button @click="rejectRegistration(inscription)" class="btn-reject btn-small"
                                    title="Rejeter l'inscription">
                                    ✕
                                </button>
                            </template>
                            <span v-else class="action-completed">
                                Traité
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="no-data">
                Aucune inscription trouvée.
            </div>
        </div>

        <!-- Version Liste pour Mobile -->
        <div class="mobile-view">
            <div v-if="filteredInscriptions.length === 0" class="no-data">
                Aucune inscription trouvée.
            </div>

            <div v-else class="inscription-card" v-for="inscription in filteredInscriptions" :key="inscription.email">
                <div class="card-header">
                    <div class="student-main">
                        <h3>{{ inscription.prenom }} {{ inscription.nom }}</h3>
                        <span class="student-email">{{ inscription.email }}</span>
                    </div>
                    <span :class="getStatusBadgeClass(inscription.status)">
                        {{ getStatusText(inscription.status) }}
                    </span>
                </div>

                <div class="card-content">
                    <div class="info-list">
                        <div class="info-row">
                            <span class="info-label">Téléphone:</span>
                            <span class="info-value">{{ inscription.telephone || 'Non renseigné' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date naissance:</span>
                            <span class="info-value">{{ inscription.dateNaissance }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Sexe:</span>
                            <span class="info-value">{{ inscription.sexe === 'M' ? 'Masculin' : 'Féminin' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Faculté:</span>
                            <span class="info-value">{{ inscription.faculte }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Année:</span>
                            <span class="info-value">Année {{ inscription.annee }}</span>
                        </div>
                    </div>
                </div>

                <div class="card-actions" v-if="inscription.status === 'pending'">
                    <button @click="acceptRegistration(inscription)" class="btn-accept">
                        Accepter
                    </button>
                    <button @click="rejectRegistration(inscription)" class="btn-reject">
                        Rejeter
                    </button>
                </div>

                <div class="card-actions" v-else>
                    <span class="action-completed">
                        Action déjà traitée
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 20px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
}

.stat-item {
    text-align: center;
    padding: 15px;
    border-radius: 6px;
    background: var(--color-text-light);
}

.stat-item.total {
    border-left: 4px solid #6c757d;
}

.stat-item.pending {
    border-left: 4px solid #ffc107;
}

.stat-item.accepted {
    border-left: 4px solid #28a745;
}

.stat-item.rejected {
    border-left: 4px solid #dc3545;
}

.stat-number {
    display: block;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #6c757d;
    text-transform: uppercase;
}

.admin-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
}

.search-filter {
    display: flex;
    gap: 30px;
    flex: 1;
}

.search-input,
.status-filter {
    all: unset;
    font-size: 12px;
    padding: .6rem;
    background: var(--hover-lw);
    color: var(--color-primary);
    border-radius: 4px;
    border: 2px solid #00000000;
    transition: all .5s ease;
}

.search-input:hover,
.status-filter:hover {
    border: 2px solid var(--color-primary);
}

.search-input {
    flex: 2;
}

.status-filter {
    flex: 1;
}

.export-btn {
    background: var(--color-primary-dark);
    color: var(--color-text-light);
    border: none;
    padding: .6rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.export-btn:hover {
    background: var(--color-primary);
}

.table-container {
    width: 100%;
    background-color: var(--color-surface);
    margin: auto;
    gap: 1rem;
    color: var(--color-primary);
    padding: 1rem;
    border-radius: 10px;
    border: 2px solid var(--color-primary);
}

/* Version Tableau (Desktop) */
.desktop-view {
    display: block;
}

.inscriptions-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-text-light);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inscriptions-table th {
    background: #f8f9fa;
    padding: 15px 12px;
    text-align: left;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 1px solid #dee2e6;
}

.inscriptions-table td {
    padding: 15px 12px;
    border-bottom: 1px solid #dee2e6;
}

.inscriptions-table tr:last-child td {
    border-bottom: none;
}

.inscriptions-table tr:hover {
    background: #f8f9fa;
}

.student-info .student-name {
    font-weight: 600;
    color: #2c3e50;
}

.student-info .student-details {
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
}

.actions {
    white-space: nowrap;
}

.btn-small {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-right: 5px;
}

.btn-accept.btn-small {
    background: var(--color-success);
    color: var(--color-text-light);
}

.btn-reject.btn-small {
    background: #dc3545;
    color: var(--color-text-light);
}

/* Version Liste (Mobile) */
.mobile-view {
    display: none;
    border-radius: 10px;
    border: 2px solid var(--color-primary);
}

.inscription-card {
    background: var(--color-text-light);
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.student-main h3 {
    margin: 0 0 5px 0;
    color: #2c3e50;
}

.student-email {
    font-size: 14px;
    color: #6c757d;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
}

.status-badge.pending {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-badge.accepted {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.status-badge.rejected {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f8f9fa;
}

.info-label {
    font-weight: 600;
    color: #6c757d;
    font-size: 14px;
}

.info-value {
    color: #2c3e50;
    text-align: right;
    font-size: 14px;
}

.card-actions {
    display: flex;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.btn-accept {
    background: #28a745;
    color: var(--color-text-light);
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    flex: 1;
}

.btn-accept:hover {
    background: #218838;
}

.btn-reject {
    background: #dc3545;
    color: var(--color-text-light);
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    flex: 1;
}

.btn-reject:hover {
    background: #c82333;
}

.action-completed {
    color: #6c757d;
    font-style: italic;
    text-align: center;
    width: 100%;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
    background: var(--color-text-light);
    border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: block;
    }

    .admin-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .search-filter {
        flex-direction: column;
        max-width: none;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .card-header {
        flex-direction: column;
        gap: 10px;
    }

    .info-row {
        flex-direction: column;
        gap: 4px;
    }

    .info-value {
        text-align: left;
    }
}

@media (min-width: 769px) {
    .desktop-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }
}
</style>