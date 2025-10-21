<script>
export default {
    data() {
        return {
            listeNotes: [],
            titre: '',
            note: '',
            errorTitre: false,
            errorNote: false,
            currentUser: null,
        }
    },
    watch: {
        titre() {
            this.checkInput();
        },
        note() {
            this.checkInput();
        },
    },
    mounted() {
        this.loadCurrentUser();
        this.loadUserNotes();
    },
    methods: {
        loadCurrentUser() {
            const userData = localStorage.getItem('schola.currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        },

        loadUserNotes() {
            if (!this.currentUser) return;

            const allUsers = localStorage.getItem('schola.users');
            if (allUsers) {
                const users = JSON.parse(allUsers);
                const currentUserData = users.find(user => user.id === this.currentUser.id);

                if (currentUserData && currentUserData.notes) {
                    this.listeNotes = currentUserData.notes;
                }
            }
        },

        checkInput() {
            if (this.note || this.titre) {
                this.errorTitre = false;
                this.errorNote = false;
            }
        },

        ajouterNotes() {
            if (this.titre === '') {
                this.errorTitre = true
            }
            else if (this.note === '') {
                this.errorNote = true;
            }
            else {
                let obj = {
                    "avatar": this.titre[0].toUpperCase(),
                    "titre": this.titre.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    "content": this.note,
                    "dateCreation": new Date().toISOString()
                }

                this.listeNotes.push(obj);
                this.saveUserNotes();
                this.titre = '';
                this.note = '';

                this.$emit("addNote", obj);
                this.close();
            }
        },

        saveUserNotes() {
            if (!this.currentUser) return;

            const allUsers = localStorage.getItem('schola.users');
            if (allUsers) {
                const users = JSON.parse(allUsers);
                const userIndex = users.findIndex(user => user.id === this.currentUser.id);

                if (userIndex !== -1) {
                    users[userIndex].notes = this.listeNotes;

                    localStorage.setItem('schola.users', JSON.stringify(users));
                    this.currentUser.notes = this.listeNotes;
                    localStorage.setItem('schola.currentUser', JSON.stringify(this.currentUser));
                }
            }
        },

        close() {
            this.$emit("close");
        },
    }
}
</script>

<template>
    <div class="notes-adm-container">
        <div class="cont-head">
            <h5>Ajouter Notes</h5>
            <button class="close-btn bi-x" @click="close"></button>
        </div>
        <div class="notebook">
            <div class="title">
                <input type="text" :class="{ 'input_error': errorTitre }" placeholder="Titre" v-model.trim="titre">
            </div>
            <p class="msg" v-if="this.errorTitre === true">Veuillez ajouter le titre</p>
            <textarea class="paper" :class="{ 'input_error': errorNote }" placeholder="Content"
                v-model.trim="note"></textarea>
            <p class="msg" v-if="this.errorNote === true">Veuillez ajouter le contenu</p>
        </div>
        <button class="adm-btn" @click="ajouterNotes">Ajouter</button>
    </div>
</template>

<style scoped>
.input_error {
    border: 1px solid var(--danger-hover);
    color: var(--text-color);
}

.input_error:focus {
    border: inherit;
    border: 1px solid var(--danger-hover);
}
</style>