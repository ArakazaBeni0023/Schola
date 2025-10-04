<script>
export default {
    data() {
        return {
            cibles: ['Tous', 'Étudiant', 'Professeur', 'Administration'],
            types: ['Administratif', 'Urgence', 'Pédagogique'],
            cible: "Tous",
            type: "Urgence",
            newNotif: {
                titre: "",
                contenue: "",
                date: new Date().toISOString(),
                type: "",
                lien: "",
                cible: "tous",
                lu: false
            },
            attachedFiles: []
        }
    },
    methods: {
        close() {
            this.$emit('close');
            this.cible = "Tous";
            this.type = "Urgence";
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },

        handleFileUpload(event) {
            const files = Array.from(event.target.files);
            const allowedTypes = [
                'image/jpeg', 'image/png',
                'application/pdf', 'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            files.forEach(file => {
                if (allowedTypes.includes(file.type)) {
                    this.attachedFiles.push({
                        name: file.name,
                        url: URL.createObjectURL(file),
                        type: file.type
                    });
                } else {
                    alert(`Fichier non autorisé: ${file.name}`);
                }
            });

            event.target.value = null;
        },

        removeFile(index) {
            this.attachedFiles.splice(index, 1);
        },

        sendNotif() {
            if (!this.newNotif.titre || !this.newNotif.contenue) {
                alert("Veuillez remplir le titre et le message.");
                return;
            }

            this.newNotif.date = new Date().toISOString();
            this.newNotif.type = this.type.toLowerCase();
            this.newNotif.cible = this.cible.toLowerCase();
            this.newNotif.lu = false;
            this.newNotif.fichiers = [...this.attachedFiles];

            this.$emit('add', { ...this.newNotif });

            this.newNotif = {
                titre: "",
                contenue: "",
                date: new Date().toISOString(),
                type: "",
                cible: "tous",
                lu: false,
                fichiers: []
            };
            this.attachedFiles = [];
            this.cible = "Tous";
            this.type = "Urgence";
            this.$emit('close');
        },
    }

}

</script>

<template>
    <div class="new-notif">
        <div class="new-notif-header">
            <button class="bi-arrow-left-short" @click="close()"></button>
            <h3 class="title">Nouvelle Annonce</h3>
            <div class="controls-btns">
                <button class="bi-dash"></button>
                <button class="bi-arrows-angle-expand"></button>
                <button class="bi-x" @click="close()"></button>
            </div>
        </div>
        <div class="new-notif-container">
            <div class="inputs-group">
                <div class="form-group">
                    <select v-model="cible">
                        <option v-for="c in cibles" :key="c" :value="c">{{ c }}</option>
                    </select>
                    <i class="bi-chevron-down"></i>
                </div>
                <div class="form-group">
                    <select v-model="type">
                        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <i class="bi-chevron-down"></i>
                </div>
                <input type="text" placeholder="Objet" v-model="newNotif.titre">
                <textarea v-model="newNotif.contenue" placeholder="Votre message..."></textarea>
            </div>

            <div class="attached-file" v-if="attachedFiles.length">
                <div class="file" v-for="(file, index) in attachedFiles" :key="index">
                    {{ file.name }}
                    <i class="bi-x" @click="removeFile(index)"></i>
                </div>
            </div>


            <div class="btns-group">
                <button class="add-btn" @click="sendNotif">Envoyer <i class="bi-send"></i></button>
                <button class="attach-file" @click="triggerFileInput">
                    <i class="bi-paperclip"></i>
                </button>
                <input type="file" ref="fileInput" multiple @change="handleFileUpload"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt" style="display: none" />

            </div>
        </div>
    </div>
</template>

<style scoped>
.new-notif {
    background: var(--color-surface);
    border: 1px solid var(--color-primary);
    border-radius: 15px;
    width: 600px;
    height: 600px;
    padding: 1rem;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.new-notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bi-arrow-left-short {
    display: none;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50px;
    transition: all .5s ease;
    color: var(--color-primary);
    cursor: pointer;
}

.bi-arrow-left-short:hover {
    background: var(--hover-lw);
}

.controls-btns {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.controls-btns button {
    all: unset;
    cursor: pointer;
    border-radius: 5px;
    padding: .2rem .5rem;
    font-size: 12px;
    transition: all .5s ease;
}

.controls-btns button:hover {
    background: var(--hover-lw);
}

.controls-btns .bi-x:hover {
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.new-notif-container {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    height: 100%;
}

.inputs-group {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.inputs-group input,
.inputs-group select,
.inputs-group textarea {
    all: unset;
    padding: .8rem 0rem;
    font-size: 12px;
    transition: all .5s ease;
}

.inputs-group input:hover,
.inputs-group select:hover {
    border-bottom: 1px solid var(--color-primary);
}

.inputs-group input,
.inputs-group select {
    border-bottom: 1px solid var(--hover-lw);
}

.inputs-group textarea {
    padding: .5rem 0rem;
    flex-grow: 1;
    overflow: auto;
}

.form-group {
    position: relative;
    display: flex;
    align-items: center;
}

/* attach file */
.attached-file {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
}

.attached-file .file {
    background: var(--hover-lw);
    border: 1px solid var(--color-primary);
    padding: .6em 1rem;
    border-radius: 50px;
    font-size: 12px;
    transition: all .5s ease;
    cursor: pointer;
}

.attached-file .file .bi-x {
    margin-left: .5rem;
    cursor: pointer;
}

.attached-file .file .bi-x:hover {
    transform: scale(1.1);
}

.attached-file .file:hover {
    background: var(--color-accent);
}

.form-group select {
    width: 100%;
}

.form-group .bi-chevron-down {
    position: absolute;
    right: 3%;
    font-size: 12px;
}

.btns-group {
    margin-top: 0;
    padding: 0;
    justify-content: end;
    align-items: center;
    font-size: 12px;
    height: fit-content;
    flex-direction: row-reverse;
}

.btns-group button {
    margin-top: 0;
    padding: .5rem .6rem;
    width: fit-content;
    border-radius: 5px;
}

.btns-group .add-btn {
    border-radius: 50px;
    padding: 0.8rem 1.5rem;
}




@media (max-width:768px) {
    .new-notif {
        width: 100%;
    }

    .bi-arrow-left-short {
        display: block;
    }

    .controls-btns .bi-arrows-angle-expand,
    .controls-btns .bi-dash,
    .controls-btns .bi-x {
        display: none;
    }
}

@media (max-width:468px) {
    .btns-group {
        padding-bottom: 1rem;
    }
}
</style>