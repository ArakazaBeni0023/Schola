<script>
import ModalCmp from '../ModalCmp.vue';

export default {
    components: {
        ModalCmp
    },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        student: {
            type: Object,
            default: null
        },
        facultes: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            editedStudent: {},
            error: null,
            success: null
        };
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.initializeModal();
            }
        },
        student: {
            handler(newVal) {
                if (newVal) {
                    this.editedStudent = JSON.parse(JSON.stringify(newVal));
                }
            },
            immediate: true
        }
    },
    computed: {
        modalTitle() {
            return this.editedStudent.faculte ? 'Modifier étudiant' : 'Affecter étudiant';
        },
        selectedFaculte() {
            return this.facultes.find(f => f.nomFac === this.editedStudent.faculte);
        },
        anneesDisponibles() {
            if (!this.selectedFaculte) return [];
            return Array.from({ length: this.selectedFaculte.duree }, (_, i) => i + 1);
        }
    },
    methods: {
        initializeModal() {
            this.error = null;
            this.success = null;
            this.editedStudent = this.student ? JSON.parse(JSON.stringify(this.student)) : {};

            // Initialiser les propriétés si elles n'existent pas
            if (!this.editedStudent.faculte) {
                this.editedStudent.faculte = '';
            }
            if (!this.editedStudent.annee) {
                this.editedStudent.annee = null;
            }
        },

        formatAnnee(annee) {
            if (!annee) return '-';
            return `${annee}${annee === 1 ? 'ère' : 'ème'}`;
        },

        showError(message) {
            this.error = message;
            this.success = null;
            setTimeout(() => {
                this.error = null;
            }, 5000);
        },

        showSuccess(message) {
            this.success = message;
            this.error = null;
            setTimeout(() => {
                this.success = null;
            }, 3000);
        },

        validateStudent() {
            if (!this.editedStudent.faculte) {
                this.showError("Veuillez sélectionner une faculté");
                return false;
            }

            if (!this.editedStudent.annee) {
                this.showError("Veuillez sélectionner une année");
                return false;
            }

            const faculte = this.facultes.find(f => f.nomFac === this.editedStudent.faculte);
            if (faculte && this.editedStudent.annee > faculte.duree) {
                this.showError(`L'année ne peut pas dépasser la durée de la faculté (${faculte.duree} années)`);
                return false;
            }

            if (this.editedStudent.annee < 1) {
                this.showError("L'année doit être au moins 1");
                return false;
            }

            return true;
        },

        handleSave() {
            if (!this.validateStudent()) return;

            this.showSuccess("Étudiant mis à jour avec succès");

            setTimeout(() => {
                this.$emit('save', this.editedStudent);
            }, 1000);
        },

        handleClose() {
            this.error = null;
            this.success = null;
            this.$emit('close');
        },

        onFaculteChange() {
            // Réinitialiser l'année si la faculté change
            if (this.selectedFaculte && this.editedStudent.annee > this.selectedFaculte.duree) {
                this.editedStudent.annee = null;
            }
        }
    }
}
</script>

<template>
    <ModalCmp v-if="show" class="modal-overlay" @close="handleClose">
        <h3>{{ modalTitle }}</h3>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>

        <div class="form-group">
            <label>Étudiant:</label> <strong>{{ editedStudent.nom }} {{ editedStudent.prenom }}</strong>
        </div>

        <div class="form-group">
            <label>Faculté:</label>
            <select v-model="editedStudent.faculte" class="select-input" @change="onFaculteChange">
                <option value="">Choisir une faculté</option>
                <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.nomFac">
                    {{ faculte.nomFac }} ({{ faculte.duree }} ans)
                </option>
            </select>
        </div>

        <div class="form-group" v-if="editedStudent.faculte">
            <label>Année d'étude:</label>
            <select v-model="editedStudent.annee" class="select-input">
                <option value="">Choisir une année</option>
                <option v-for="annee in anneesDisponibles" :key="annee" :value="annee">
                    {{ formatAnnee(annee) }} année
                </option>
            </select>
            <small class="help-text">
                Faculté: {{ selectedFaculte?.nomFac }} - Durée: {{ selectedFaculte?.duree }} années
            </small>
        </div>

        <div class="checking-btns">
            <button @click="handleClose" class="cancel-btn bi-x-lg" title="Annuler"> Annuler</button>
            <button @click="handleSave" class="save-btn bi-check-lg" title="Confirmer"> Confirmer</button>
        </div>
    </ModalCmp>
</template>

<style scoped>
.modal-overlay h3 {
    text-align: center;
    padding-bottom: 0.5rem;
}

/* Form Styles */
.form-group {
    margin-bottom: 1rem;
    font-size: 14px;
}

.select-input {
    padding: 0.75rem;
}

.select-input:focus {
    outline: none;
    border-color: var(--color-primary);
    background-color: var(--hover-lw);
}

.help-text {
    display: block;
    margin-top: 0.25rem;
    color: var(--color-text-secondary);
    font-size: 0.8rem;
    font-style: italic;
}

@media (max-width: 768px) {
    .modal-actions {
        flex-direction: column-reverse;
        gap: 0.5rem;
    }

    .cancel-btn,
    .save-btn {
        justify-content: center;
        width: 100%;
    }
}
</style>