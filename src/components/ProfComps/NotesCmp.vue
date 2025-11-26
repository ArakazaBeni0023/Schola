<script>
import AddNotes from "../../components/AddNotes.vue";
import EditNotes from "../../components/EditNotes.vue";
import ViewNotes from "../../components/ViewNotes.vue";
import NotesDeleteModal from "../NotesDeleteModal.vue";

export default {
    components: {
        AddNotes,
        EditNotes,
        ViewNotes,
        NotesDeleteModal,
    },
    data() {
        return {
            //----------
            index: '',
            avatar: '',
            titre: '',
            content: '',
            listeNotes: [],

            isNotePopover: false,
            isViewNotes: false,
            isAddNotes: false,
            isEditNotes: false,
            isNotes: true,
            expanded: true,

            selectedNote: null,
            supprimerModal: false,

            currentUser: null,
        }
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
            this.index = '';
            this.titre = '';
            this.content = '';
            this.isNotes = true;
            this.isAddNotes = false;
            this.isEditNotes = false;
            this.supprimerModal = false;
            this.isViewNotes = false;
        },
        showPopover(index) {
            if (this.isNotePopover === index) {
                this.isNotePopover = null;
            }
            else {
                this.isNotePopover = index;
            }
        },
        ajouterNote() {
            this.isNotes = false;
            this.isAddNotes = true;
            this.isEditNotes = false;
            this.isViewNotes = false;
        },
        editerNote(index) {
            this.isNotes = false;
            this.isAddNotes = false;
            this.isEditNotes = true;
            this.isViewNotes = false;
            //-------
            this.index = index;
            this.titre = this.listeNotes[index].titre;
            this.content = this.listeNotes[index].content;
            this.isNotePopover = false;
        },
        viewnotes(index) {
            this.isNotes = false;
            this.isAddNotes = false;
            this.isEditNotes = false;
            this.isViewNotes = true;
            //---------
            this.index = index;
            this.titre = this.listeNotes[index].titre;
            this.content = this.listeNotes[index].content;
        },
        spmModal(index) {
            this.supprimerModal = true;
            this.isNotePopover = false;
            this.index = index;
        },
        deleteItem() {
            this.listeNotes.splice(this.index, 1);
            this.saveUserNotes();
            this.$emit("close");
            this.isNotePopover = false;
            this.supprimerModal = false;
        },
        toggleHeight(item) {
            item.expanded = !item.expanded;
            this.isVisible === this.isVisible;
        },

        addNewNote(note) {
            this.listeNotes.push(note);
            this.saveUserNotes();
        },

        updateNote(updatedNote) {
            if (this.index !== '' && this.listeNotes[this.index]) {
                this.listeNotes[this.index] = updatedNote;
                this.saveUserNotes();
            }
        }
    }
}
</script>

<template>
    <div class="notes">
        <div class="notes-header">
            <div class="prime">
                <h3 class="title">Mes Notes</h3>
                <div class="notes-number ">
                    <p>{{ listeNotes.length }}</p>
                </div>
            </div>
            <button class="add-btn" :class="{ 'add-select': isNotes === false }" @click=" ajouterNote()"><i
                    class="bi-plus"></i> </button>
        </div>
        <div class="notes-body" v-if="isNotes">
            <div class="note" v-for="(note, index) in listeNotes" :key="index"
                :class="isNotePopover === index ? 'selected' : ''">
                <div class="note-clickable" @click="viewnotes(index)">
                    <div class="img">{{ note.avatar }}</div>
                    <div class="note-infos">
                        <b>{{ note.titre }}</b>
                        <p>{{ note.content }}</p>
                    </div>
                </div>
                <button class="dots-btn bi-three-dots-vertical" @click="showPopover(index)"></button>
                <!-- popover content -->
                <div v-show="isNotePopover === index" class="popover-content">
                    <div class="triangle"></div>
                    <div class="item" @click="editerNote(index)"><i class="bi bi-pencil"></i>Editer</div>
                    <div class="item" @click="spmModal(index)"><i class="bi bi-trash3"></i>Supprimer</div>
                </div>
            </div>
        </div>
        <!-- View notes-->
        <ViewNotes v-if="isViewNotes" :index="index" :content="content" :titre="titre" @close="close" />
        <!-- adding note-->
        <AddNotes v-if="isAddNotes" @close="close" @addNote="addNewNote" />
        <!-- edit note -->
        <EditNotes v-if="isEditNotes" :index="index" :content="content" :titre="titre" @close="close"
            @updateNote="updateNote" />
    </div>
    <!---------------------------------------------- modal -->
    <NotesDeleteModal v-show="supprimerModal" @close="close" @deleteItem="deleteItem" />
</template>