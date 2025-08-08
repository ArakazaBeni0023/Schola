<script>
export default {
    data() {
        return {
            showCreateUser: false,
            // New user form
            newUser: {
                nom: '',
                prenom: '',
                email: '',
                role: ''
            },
        }
    },
    methods: {
        createUser() {
            const tempPassword = 'Temp123!';
            const newUser = {
                id: this.users.length + 1,
                ...this.newUser,
                password: tempPassword,
                emailValidated: false
            };

            this.users.push(newUser);
            // this.addNotification(`Utilisateur créé. Mot de passe temporaire: ${tempPassword}`)

            this.newUser = { nom: '', prenom: '', email: '', role: '' };
            this.showCreateUser = false;
        },
    }
}
</script>

<template>
    <div class="user-management-container">
        <h3 class="title">Gestion des utilisateurs</h3>
        <div class="create-user-container" v-if="showCreateUser === false">
            <button @click="showCreateUser = true" class="create-user-btn">
                <i class="bi-plus"></i> Créer un utilisateur
            </button>
        </div>

        <!-- Create User Modal -->
        <div v-if="showCreateUser" class="user-form-container">
            <form @submit.prevent="createUser" class="form">
                <h4 class="form-title">Créer un utilisateur</h4>
                <div class="form-group">
                    <label>Nom</label>
                    <input v-model="newUser.nom" type="text" required class="input">
                </div>
                <div class="form-group">
                    <label>Prénom</label>
                    <input v-model="newUser.prenom" type="text" required class="input">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="newUser.email" type="email" required class="input">
                </div>
                <div class="form-group">
                    <label>Rôle</label>
                    <select v-model="newUser.role" required class="select-input">
                        <option value="">Sélectionner un rôle</option>
                        <option value="admin">Administrateur</option>
                        <option value="etudiant">Étudiant</option>
                        <option value="professeur">Professeur</option>
                    </select>
                </div>
                <div class="btns-group">
                    <button type="button" @click="showCreateUser = false" class="cancel-btn">Annuler</button>
                    <button type="submit" class="submit-btn">Créer</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.title {
    margin-block: .5rem;
}

.create-user-container {
    height: 120px;
}

.create-user-btn {
    border: 2px solid var(--color-primary);
    background-color: var(--color-surface);
    color: var(--color-primary);
    padding: .8rem 2rem;
    border-radius: 50px;
    font-family: "Poppins", sans-serif;
    cursor: pointer;
    transition: all .5s ease;
}

.create-user-btn:hover {
    background-color: var(--color-primary);
    color: var(--color-text-light);
}

.user-form-container .form {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    gap: 1rem;
    box-shadow: var(--shadow);
}

.user-form-container .form .form-title {
    margin-bottom: .5rem;
}


.form .form-group {
    margin-bottom: 1rem;
}

.input,
.select-input {
    width: 100%;
    padding: .8rem;
    background: var(--hover-lw);
    color: var(--color-primary);
    border-radius: 4px;
    border: 1px solid #00000000;
    transition: all .5s ease;
}

.input:hover,
.select-input:hover {
    border: 1px solid var(--color-primary);
}

.btns-group {
    gap: 3rem;
}
</style>