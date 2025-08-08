<script>
export default {
    props: ["index", "titre", "content"],
    data() {
        return {
            listeNotes: [],
            titreEdit: this.titre,
            contentEdit: this.content,
            errorTitre: false,
            errorNote: false,
        }
    },
    watch: {
        titreEdit() {
            this.checkInput();
        },
        contentEdit() {
            this.checkInput();
        },
    },
    mounted() {
        var Notes = localStorage.getItem("listeNotes");

        if (Notes) {
            this.listeNotes = JSON.parse(Notes);
        }
        else {
            localStorage.setItem("listeNotes", JSON.stringify(this.listeNotes));
        }
    },
    methods: {
        checkInput() {
            if (this.titreEdit || this.contentEdit) {
                this.errorTitre = false;
                this.errorNote = false;
            }
        },
        ajouterNotes() {
            if (this.titreEdit === '') {
                this.errorTitre = true
            }
            else if (this.contentEdit === '') {
                this.errorNote = true;
            }
            else {
                let obj = {
                    "avatar": this.titreEdit[0].toUpperCase(),
                    "titre": this.titreEdit.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    "content": this.contentEdit
                }
                this.listeNotes[this.index] = obj;
                localStorage.setItem("listeNotes", JSON.stringify(this.listeNotes));
                this.titreEdit = '';
                this.contentEdit = '';
                //--------  Message
                this.$emit('afficherMessage');
                //-------- close
                this.$emit("close");
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
            <h4>Editer</h4>
            <button class="close-btn bi-x" @click="close"></button>
        </div>
        <div class="notebook">
            <div class="title">
                <input type="text" :class="{ 'in_error': errorTitre }" placeholder="Titre" v-model.trim="titreEdit">
            </div>
            <p class="msg" v-if="this.errorTitre === true">Veillez ajouter le titre</p>
            <textarea class="paper" :class="{ 'in_error': errorNote }" placeholder="Content"
                v-model.trim="contentEdit"></textarea>
            <p class="msg" v-if="this.errorNote === true">Veillez ajouter le contenu</p>
        </div>
        <button class="adm-btn " @click="ajouterNotes">Valider</button>
    </div>
</template>