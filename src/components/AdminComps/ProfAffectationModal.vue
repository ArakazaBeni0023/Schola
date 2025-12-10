<script>
import ModalCmp from '../ModalCmp.vue';
export default {
    components: { ModalCmp },
    props: {
        show: {
            type: Boolean,
            default: false
        },
        professor: {
            type: Object,
            default: null
        },
        affectationIndex: {
            type: Number,
            default: null
        },
        mode: {
            type: String,
            default: 'add'
        },
        facultes: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            tempAffectation: {
                nom: '',
                annees: []
            },
            anneesDisponibles: [],
            editProfessor: null,

            error: null,
            success: null,
        };
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.initializeModal();
            }
        },
        professor: {
            handler(newVal) {
                if (newVal) {
                    this.editProfessor = JSON.parse(JSON.stringify(newVal));
                }
            },
            immediate: true
        }
    },
    computed: {
        modalTitle() {
            return this.mode === 'edit' ? 'Modifier affectation' : 'Nouvelle affectation';
        },
        selectedFaculte() {
            return this.facultes.find(f => f.nom === this.tempAffectation.nom);
        }
    },
    methods: {
        initializeModal() {
            this.error = null;
            this.success = null;
            this.editProfessor = this.professor ? JSON.parse(JSON.stringify(this.professor)) : null;

            if (!this.editProfessor?.affectations) {
                this.editProfessor.affectations = [];
            }

            if (this.affectationIndex !== null && this.editProfessor.affectations[this.affectationIndex]) {
                this.tempAffectation = JSON.parse(JSON.stringify(this.editProfessor.affectations[this.affectationIndex]));
            } else {
                this.tempAffectation = { nom: '', annees: [] };
            }

            if (this.tempAffectation.nom) {
                this.chargerAnneesEtCours(this.tempAffectation.nom);
            }
        },

        formatAnnee(annee) {
            return `${annee} ${annee === 1 ? 'ère' : 'ème'}`;
        },

        getCoursesForFacultyAndYear(faculteNom, annee) {
            const fac = this.facultes.find(f => f.nomFac === faculteNom);
            return fac?.courses?.filter(c => c.anneeEtude === annee) || [];
        },

        addAnneeToTemp(annee) {
            if (!this.tempAffectation.annees.some(a => a.annee === annee)) {
                this.tempAffectation.annees.push({
                    annee,
                    cours: []
                });
            }
        },

        removeAnneeFromTemp(annee) {
            this.tempAffectation.annees = this.tempAffectation.annees.filter(a => a.annee !== annee);
        },

        chargerAnneesEtCours(faculteNom) {
            const fac = this.facultes.find(f => f.nomFac === faculteNom);
            if (fac && fac.duree) {
                this.anneesDisponibles = Array.from({ length: fac.duree }, (_, i) => i + 1);
            }
            else {
                this.anneesDisponibles = [];
            }

            if (this.tempAffectation.nom !== faculteNom) {
                this.tempAffectation.annees = [];
            }
        },

        showError(message) {
            this.error = message;
            this.success = null;
            // Auto-hide après 5 secondes
            setTimeout(() => {
                this.error = null;
            }, 5000);
        },

        showSuccess(message) {
            this.success = message;
            this.error = null;
            // Auto-hide après 3 secondes
            setTimeout(() => {
                this.success = null;
            }, 3000);
        },

        validateAffectation() {
            if (!this.tempAffectation.nom) {
                this.showError("Veuillez sélectionner une faculté");
                return false;
            }

            if (this.tempAffectation.annees.length === 0) {
                this.showError("Veuillez sélectionner au moins une année");
                return false;
            }

            // Vérifier que chaque année a au moins un cours sélectionné
            for (const annee of this.tempAffectation.annees) {
                if (!annee.cours || annee.cours.length === 0) {
                    this.showError(`Veuillez sélectionner au moins un cours pour la ${this.formatAnnee(annee.annee)} année`);
                    return false;
                }
            }

            return true;
        },

        handleSave() {
            if (!this.validateAffectation()) return;

            if (!this.editProfessor.affectations) {
                this.editProfessor.affectations = [];
            }

            const existingIndex = this.editProfessor.affectations.findIndex(a =>
                a.nom === this.tempAffectation.nom &&
                a !== this.editProfessor.affectations[this.affectationIndex]
            );

            if (this.affectationIndex !== null) {
                this.editProfessor.affectations.splice(
                    this.affectationIndex,
                    1,
                    JSON.parse(JSON.stringify(this.tempAffectation))
                );
                this.showSuccess("Affectation modifiée avec succès");
            }
            else if (existingIndex === -1) {
                this.editProfessor.affectations.push(JSON.parse(JSON.stringify(this.tempAffectation)));
                this.showSuccess("Affectation ajoutée avec succès");
            }
            else {
                this.showError("Cette affectation existe déjà pour ce professeur");
                return;
            }

            // Émettre l'événement après un court délai pour voir le message de succès
            setTimeout(() => {
                this.$emit('save', this.editProfessor);
            }, 1000);
        },

        handleClose() {
            this.error = null;
            this.success = null;
            this.$emit('close');
        },

        updateCoursSelection(annee, selectedOptions) {
            const anneeObj = this.tempAffectation.annees.find(a => a.annee === annee);
            if (anneeObj) {
                anneeObj.cours = Array.from(selectedOptions).map(option => option.value);
            }
        }
    }
};
</script>

<template>
    <ModalCmp v-if="show" class="modal-overlay" @close="handleClose">
        <h3>{{ modalTitle }}</h3>


        <transition name="alert-fade">
            <div v-if="error" class="alert alert-error">
                {{ error }}
            </div>
        </transition>

        <transition name="alert-fade">
            <div v-if="success" class="alert alert-success">
                {{ success }}
            </div>
        </transition>

        <div class="form-group">
            <label>Faculté:</label>
            <select v-model="tempAffectation.nom" class="select-input"
                @change="chargerAnneesEtCours(tempAffectation.nom)">
                <option disabled value="">Choisir une faculté</option>
                <option v-for="fac in facultes" :key="fac.id" :value="fac.nomFac">
                    {{ fac.nomFac }}
                </option>
            </select>
        </div>

        <div v-if="tempAffectation.nom" class="form-group">
            <label>Années:</label>
            <div v-for="an in anneesDisponibles" :key="an" class="anneeAffectation">
                <div class="anneeAffectation-header">
                    <div class="check-box-input">
                        <input type="checkbox" :checked="tempAffectation.annees.some(a => a.annee === an)" @change="event => {
                            if (event.target.checked) {
                                addAnneeToTemp(an);
                            } else {
                                removeAnneeFromTemp(an);
                            }
                        }" />
                        <span>{{ formatAnnee(an) }}</span>
                    </div>
                    <button v-show="tempAffectation.annees.some(a => a.annee === an)" @click="removeAnneeFromTemp(an)"
                        class="delete-btn  bi-trash" title="Retirer l'année"></button>
                </div>
                <div v-if="tempAffectation.annees.some(a => a.annee === an)" class="block-tempAffectation">
                    <label>Cours pour la {{ formatAnnee(an) }} année:</label>
                    <select :value="tempAffectation.annees.find(a => a.annee === an).cours" multiple
                        class="select-input" @change="event => updateCoursSelection(an, event.target.selectedOptions)">
                        <option v-for="c in getCoursesForFacultyAndYear(tempAffectation.nom, an)" :key="c.id"
                            :value="c.nomCours">
                            {{ c.nomCours }}
                        </option>
                    </select>
                    <small v-if="getCoursesForFacultyAndYear(tempAffectation.nom, an).length === 0"
                        class="no-courses-message">
                        Aucun cours disponible pour cette année
                    </small>
                </div>
            </div>
        </div>

        <div class="checking-btns">
            <button @click="handleClose" class="cancel-btn bi-x-lg" title="Annuler"> Annuler</button>
            <button @click="handleSave" class="save-btn bi-check-lg" title="Confirmer"> Confirmer</button>
        </div>
    </ModalCmp>
</template>

<style scoped>
.modal-overlay h3 {
    /* margin: 0 0 1.5rem 0; */
    color: var(--color-text);
    font-size: 1.25rem;
    text-align: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

/* Form Styles */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.9rem;
}

.select-input {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--color-background);
    border: 2px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.select-input:focus {
    outline: none;
    border-color: var(--color-primary);
    background-color: var(--hover-lw);
}

.select-input[multiple] {
    min-height: 100px;
    resize: vertical;
}

/* Année Affectation Styles */
.anneeAffectation {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    font-size: 14px;
    margin-bottom: .5rem;
    padding: 0.75rem;
    background: var(--color-background);
    border-radius: 8px;
    border: 1px solid var(--color-border);
    transition: all .5s ease;
}

.anneeAffectation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.block-tempAffectation {
    display: flex;
    flex-direction: column;
    /* gap: 0.5rem; */
    padding: 0.5rem;
    background: var(--hover-lw);
    border-radius: 5px;
    /* margin-top: 0.5rem; */
    border: 1px solid var(--color-primary);
    border-left: 3px solid var(--color-primary);
}

.block-tempAffectation label {
    font-size: 14px;
    color: var(--color-text-secondary);
    /* margin-bottom: 0.25rem; */
}

/* .block-tempAffectation .select-input {
    border-left: 3px solid var(--color-primary);
} */

.block-tempAffectation .select-input option {
    margin-block-end: .3rem;
}

/* Button Styles */
.delete-btn,
.cancel-btn,
.save-btn {
    all: unset;
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    text-align: center;
    gap: 0.5rem;
}

.cancel-btn {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
}

.cancel-btn:hover {
    background: var(--color-danger);
    color: var(--color-text-light);
}

.save-btn {
    background: var(--color-primary);
    color: var(--color-text-light);
    border: 1px solid var(--color-primary);
}

.save-btn:hover {
    background: var(--color-primary-dark);
}

.delete-btn {
    padding: 0.5rem;
    border-radius: 5px;
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.delete-btn:hover {
    background: var(--color-danger);
    color: var(--color-text-light);
}

.alert {
    margin-block: .5rem;
}

.no-courses-message {
    color: var(--color-text-secondary);
    font-style: italic;
    font-size: 0.8rem;
    margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
    .modal-content {
        padding: 1rem;
        margin: 1rem;
        width: calc(100% - 2rem);
    }

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

@media (max-width: 480px) {
    .modal-content {
        padding: 0.75rem;
    }

    .block-tempAffectation {
        padding: 0.5rem;
    }

    .anneeAffectation {
        padding: 0.5rem;
    }

    .delete-btn,
    .cancel-btn,
    .save-btn {
        font-size: 12px;
    }
}
</style>
