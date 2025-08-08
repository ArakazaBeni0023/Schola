<script>
export default {
    data() {
        return {
            listeNotes: [],
            titre: '',
            note: '',
            errorTitre: false,
            errorNote: false,
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
                    "content": this.note
                }
                this.listeNotes.push(obj);
                localStorage.setItem("listeNotes", JSON.stringify(this.listeNotes));
                this.titre = '';
                this.note = '';
                window.location.reload();
                //-------- close
                this.close();
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
            <p class="msg" v-if="this.errorTitre === true">Veillez ajouter le titre</p>
            <textarea class="paper" :class="{ 'input_error': errorNote }" placeholder="Content"
                v-model.trim="note"></textarea>
            <p class="msg" v-if="this.errorNote === true">Veillez ajouter le contenu</p>
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