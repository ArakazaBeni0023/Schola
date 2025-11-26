<script>
const STORAGE_KEY = 'schola.users';
import DeleteItemModal from '../DeleteItemModal.vue';
import UserInfosViewer from './UserInfosViewer.vue';
export default {
    name: 'UserManagement',
    components: { DeleteItemModal, UserInfosViewer },
    data() {
        return {
            showUserCreater: false,
            users: [],

            // New user form
            newUser: {
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                role: ''
            },

            // UI helpers
            isSaving: false,
            error: null,
            success: null,
            search: '',
            sortBy: 'nom',
            sortDir: 'A-Z',

            userId: '',
            isUserPopover: false,
            supprimerModal: false,

            voirInfosUtilisateurModal: false,
        }
    },
    created() {
        this.loadUsers();
    },
    computed: {
        filteredUsers() {
            const q = this.search.trim().toLowerCase();
            let list = this.users;

            if (q) {
                list = list.filter(u =>
                    [u.nom, u.prenom, u.email, u.role]
                        .filter(Boolean)
                        .some(v => String(v).toLowerCase().includes(q))
                );
            }

            const dir = this.sortDir === 'A-Z' ? 1 : -1;
            const key = this.sortBy;

            return [...list].sort((a, b) => {
                const va = String(a[key] || '').toLowerCase();
                const vb = String(b[key] || '').toLowerCase();
                if (va < vb) return -1 * dir;
                if (va > vb) return 1 * dir;
                return 0;
            });
        },
        userCount() {
            return this.users.length;
        }
    },
    methods: {
        // ---- Persistence ----
        loadUsers() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                this.users = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(this.users)) this.users = [];
            } catch (e) {
                console.warn('Failed to parse users from localStorage:', e);
                this.users = [];
            }
        },
        saveUsers() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
            } catch (e) {
                this.error = 'Unable to save users (storage full or blocked).';
                console.error(e);
            }
        },

        // ---- Utilities ----
        generateTempPassword(length = 10) {
            const chars =
                'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
            let pwd = '';
            for (let i = 0; i < length; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pwd;
        },
        generateId() {
            return `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        },
        normalizeEmail(email) {
            return String(email || '').trim().toLowerCase();
        },

        // ---- Validation ----
        validateNewUser() {
            this.error = null;

            if (!this.newUser.nom.trim()) {
                this.error = 'Le nom est requis.'; return false;
            }
            if (!this.newUser.prenom.trim()) {
                this.error = 'Le prénom est requis.'; return false;
            }

            const email = this.normalizeEmail(this.newUser.email);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!emailRegex.test(email)) {
                this.error = 'Adresse e-mail invalide.'; return false;
            }

            if (!this.newUser.role) {
                this.error = 'Le rôle est requis.'; return false;
            }

            const exists = this.users.some(u => this.normalizeEmail(u.email) === email);
            if (exists) {
                this.error = 'Cet e-mail existe déjà.'; return false;
            }

            return true;
        },

        // ---- Actions ----
        createUser() {
            if (!this.validateNewUser()) return;

            this.isSaving = true;
            try {
                const user = {
                    id: this.generateId(),
                    nom: this.newUser.nom.trim(),
                    prenom: this.newUser.prenom.trim(),
                    email: this.normalizeEmail(this.newUser.email),
                    role: this.newUser.role,
                    password: this.generateTempPassword(),
                    emailValidated: false,
                    createdAt: new Date().toISOString(),
                };

                this.users.push(user);
                this.saveUsers();

                this.success = 'Utilisateur créé avec succès.';
                this.resetForm();
            } finally {
                this.isSaving = false;
                setTimeout(() => { this.success = null; }, 2000);
            }
        },
        deleteUser(id) {
            this.users = this.users.filter(u => u.id !== id);
            this.saveUsers();
            this.closeUsrDltMdl();
        },
        resetForm() {
            this.newUser = { nom: '', prenom: '', email: '', role: '' };
            this.error = null;
        },
        formatRole(role) {
            return `${role === 'admin' ? 'Admin' : role === 'etudiant' ? 'Étudiant' : ' Professeur'
                }`;
        },
        showPopover(index) {
            if (this.isUserPopover === index) {
                this.isUserPopover = null;
            }
            else {
                this.isUserPopover = index;
            }
        },
        closeUsrDltMdl() {
            this.userId = '';
            this.isUserPopover = false;
            this.supprimerModal = false;
            this.voirInfosUtilisateurModal = false;
        },
        spmModal(id) {
            this.supprimerModal = true;
            this.isUserPopover = false;
            this.userId = id;
        },
        viewUserInfos(id) {
            this.userId = id;
            this.voirInfosUtilisateurModal = true;
        }
    }
}
</script>

<template>
    <div class="user-management-container">
        <div class="users-management" v-if="!showUserCreater">

            <button @click="showUserCreater = true" class="create-user-btn">
                <i class="bi-plus-lg"></i> Créer un utilisateur
            </button>

            <div class="search-filters-container">
                <input v-model.trim="search" type="search" placeholder="Rechercher (nom, email, rôle)"
                    class="input search" />

                <div class="filters-container">
                    <select v-model="sortBy" class="select-input">
                        <option value="nom">Trier par Nom</option>
                        <option value="email">Trier par E-mail</option>
                        <option value="role">Trier par Rôle</option>
                    </select>
                    <select v-model="sortDir" class="select-input">
                        <option value="A-Z">A-Z</option>
                        <option value="Z-A">Z-A</option>
                    </select>
                </div>
            </div>

            <p v-if="userCount === 0" class="empty-state">Aucun utilisateur pour l’instant.</p>

            <div v-else class="users-list-container">
                <div class="desktop-view">
                    <div v-if="filteredUsers.length === 0" class="no-data"> Aucune utilisateur trouvée.</div>
                    <table v-else>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>E-mail</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in filteredUsers" :key="u.id">
                                <td>{{ u.nom }} {{ u.prenom }}</td>
                                <td>{{ formatRole(u.role) }}</td>
                                <td>{{ u.email }}</td>
                                <td>
                                    <button @click="deleteUser(u.id)" class="bi-trash"></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mobile-view">
                    <div v-if="filteredUsers.length === 0" class="no-data"> Aucune utilisateur trouvée.</div>
                    <div v-else class="user-card" v-for="(u, index) in filteredUsers" :key="u.id">
                        <div class="user-main-infos" @click="viewUserInfos(u.id)">
                            <h4>{{ u.nom + ' ' + u.prenom }}</h4>
                            <p>{{ u.email }}</p>
                            <span class="user-role">{{ formatRole(u.role) }}</span>
                        </div>
                        <div class="bi-three-dots-vertical" @click="showPopover(index)"></div>
                        <div v-show="isUserPopover === index" class="popover-content">
                            <!-- <div class="item" @click="editerNote(index)"><i class="bi bi-pencil"></i>Editer</div> -->
                            <div class="item" @click="spmModal(u.id)"><i class="bi bi-trash3"></i>Supprimer</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Create User  -->
        <div class="user-form-container" v-else>
            <form @submit.prevent="createUser" class="form" novalidate>

                <div v-if="error" class="alert alert-error">{{ error }}</div>
                <div v-if="success" class="alert alert-success">{{ success }}</div>

                <div class="form-group">
                    <label>Nom</label>
                    <input v-model.trim="newUser.nom" type="text" required class="input">
                </div>

                <div class="form-group">
                    <label>Prénom</label>
                    <input v-model.trim="newUser.prenom" type="text" required class="input">
                </div>

                <div class="form-group">
                    <label>Téléphone</label>
                    <input v-model.trim="newUser.telephone" type="tel" required class="input">
                </div>

                <div class="form-group">
                    <label>E-mail</label>
                    <input v-model.trim="newUser.email" type="email" required class="input">
                </div>

                <div class="form-group">
                    <label>Rôle</label>
                    <select v-model.trim="newUser.role" required class="select-input">
                        <option value="">Sélectionner un rôle</option>
                        <option value="admin">Administrateur</option>
                        <option value="etudiant">Étudiant</option>
                        <option value="professeur">Professeur</option>
                    </select>
                </div>

                <div class="btns-group">
                    <button type="button" @click="showUserCreater = false; resetForm();" class="cancel-btn">
                        Annuler
                    </button>
                    <button type="submit" class="submit-btn" :disabled="isSaving">
                        {{ isSaving ? 'Création…' : 'Créer' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <UserInfosViewer v-show="voirInfosUtilisateurModal" :userId="userId" @closeUsrDltMdl="closeUsrDltMdl" />
    <DeleteItemModal v-show="supprimerModal" @closeUsrDltMdl="closeUsrDltMdl" @deleteItem="deleteUser(userId)" />
</template>

<style scoped>
.users-management {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.users-management .search-filters-container {
    display: flex;
    justify-content: space-between;
    gap: .5rem;
}

.users-management .search-filters-container .search {
    font-size: 14px;
    padding: 0.8rem;
    flex-grow: 1;

}

.users-management .search-filters-container .filters-container {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.users-management .search-filters-container .filters-container select {
    width: fit-content;
    padding: 0.8rem;

}

.users-management .search-filters-container .filters-container select option {
    font-size: 12px;
}

.bi-pencil,
.bi-trash {
    all: unset;
    cursor: pointer;
}

.users-management .users-list-container {
    width: 100%;
}

.title {
    margin-block: .5rem;
}

.create-user-container {
    height: 120px;
}

.create-user-btn {
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    padding: .8rem 2rem;
    border-radius: 50px;
    font-family: "Poppins", sans-serif;
    cursor: pointer;
    transition: all .5s ease;
    min-width: 40%;
    margin: 0 auto;
    border: none;
}

.create-user-btn:hover {
    background-color: var(--color-primary);
}

.user-form-container .form {
    gap: 1rem;
}

.user-form-container .form .form-title {
    margin-bottom: .5rem;
}

.form .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    font-size: 14px;
}

.input,
.select-input {
    all: unset;
    font-size: 12px;
    padding: .6rem;
    background: var(--hover-lw);
    color: var(--color-primary);
    border-radius: 4px;
    border: 2px solid #00000000;
    transition: all .5s ease;
}

.input:hover,
.select-input:hover,
.input:focus,
.select-input:focus {
    border: 2px solid var(--color-primary);
}

.btns-group {
    gap: 3rem;
    /* border: 1px solid #000; */
}

.popover-content {
    right: 5%;
}

@media (max-width:768px) {
    .users-management .search-filters-container {
        flex-direction: column;
        gap: .5rem;
    }

    .users-management .users-list-container {
        overflow: auto;
        max-height: 350px
    }

    .users-management .search-filters-container .filters-container {
        gap: 0.5rem;
    }

    .users-management .search-filters-container .filters-container select {
        width: 100%;
    }
}

@media (max-width:468px) {
    .users-management .users-list-container {
        overflow: auto;
        max-height: 350px
    }

    .users-management .search-filters-container .search {
        flex-grow: none;
    }

    .users-management .search-filters-container .filters-container {
        gap: 0.5rem;
    }

    .users-management .search-filters-container .filters-container select {
        width: 100%;
    }

    .create-user-btn {
        width: 100%;
        text-align: center;
    }
}
</style>