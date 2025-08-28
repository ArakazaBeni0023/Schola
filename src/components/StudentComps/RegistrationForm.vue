<script>
export default {
    name: 'StudentRegistrationView',
    data() {
        return {
            // Données personnelles
            studentForm: {
                nom: '',
                prenom: '',
                email: '',
                dateNaissance: '',
                sexe: '',
                telephone: '',
                motDePasse: ''
            },

            // Données académiques
            facultes: [
                { id: 1, nom: 'Sciences' },
                { id: 2, nom: 'Lettres' }
            ],
            availableClasses: [],
            availableCours: [],
            academicForm: {
                faculte: '',
                classe: '',
                coursSelectionnes: []
            }
        };
    },
    methods: {
        updateClasses() {
            if (this.academicForm.faculte === 1) {
                this.availableClasses = [
                    { id: 101, nom: 'Licence 1' },
                    { id: 102, nom: 'Licence 2' }
                ];
            } else if (this.academicForm.faculte === 2) {
                this.availableClasses = [
                    { id: 201, nom: 'Lettres Modernes' },
                    { id: 202, nom: 'Lettres Classiques' }
                ];
            } else {
                this.availableClasses = [];
            }
            this.academicForm.classe = '';
            this.availableCours = [];
        },
        updateCours() {
            if (this.academicForm.classe === 101) {
                this.availableCours = [
                    { id: 1, nom: 'Mathématiques' },
                    { id: 2, nom: 'Physique' }
                ];
            } else if (this.academicForm.classe === 201) {
                this.availableCours = [
                    { id: 3, nom: 'Philosophie' },
                    { id: 4, nom: 'Latin' }
                ];
            } else {
                this.availableCours = [];
            }
            this.academicForm.coursSelectionnes = [];
        },
        submitStudentRegistration() {
            const passwordPattern = /^(?=.[A-Z])(?=.\d).{8,}$/;
            if (!passwordPattern.test(this.studentForm.motDePasse)) {
                alert("Mot de passe invalide (min 8 caractères, 1 majuscule, 1 chiffre).");
                return;
            }

            if (!this.academicForm.faculte || !this.academicForm.classe || this.academicForm.coursSelectionnes.length === 0) {
                alert("Veuillez compléter la section académique.");
                return;
            }

            const fullRegistration = {
                ...this.studentForm,
                faculte: this.academicForm.faculte,
                classe: this.academicForm.classe,
                coursSelectionnes: this.academicForm.coursSelectionnes
            };

            const saved = JSON.parse(localStorage.getItem('studentRegistrations')) || [];
            saved.push(fullRegistration);
            localStorage.setItem('studentRegistrations', JSON.stringify(saved));

            alert("Inscription complète réussie!");


            this.studentForm = {
                nom: '', prenom: '', email: '', dateNaissance: '',
                sexe: '', telephone: '', motDePasse: ''
            };
            this.academicForm = {
                faculte: '', classe: '', coursSelectionnes: []
            };
            this.availableClasses = [];
            this.availableCours = [];
        }
    }
};
</script>

<template>
    <div class="container-form ">
        <h2>Inscription de l'étudiant</h2>
        <form @submit.prevent="submitStudentRegistration" class="form">

            <!-- Informations personnelles -->
            <fieldset>
                <legend>Informations personnelles</legend>

                <label>Nom *</label>
                <input v-model.trim="studentForm.nom" type="text" required class="input" />

                <label>Prénom *</label>
                <input v-model.trim="studentForm.prenom" type="text" required class="input" />

                <label>Email *</label>
                <input v-model.trim="studentForm.email" type="email" required class="input" />

                <label>Date de naissance *</label>

                <input v-model.trim="studentForm.dateNaissance" type="date" required class="input" />

                <label>Sexe *</label>
                <select v-model="studentForm.sexe" required class="select-input">
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                </select>

                <label>Téléphone</label>
                <input v-model.trim="studentForm.telephone" type="tel" class="input" />

                <label>Mot de passe *</label>
                <input v-model.trim="studentForm.motDePasse" type="password" required class="input"
                    placeholder="min 8 caractères, 1 majuscule, 1 chiffre" />
            </fieldset>

            <!-- Informations académiques -->
            <fieldset>
                <legend>Informations académiques</legend>

                <label>Faculté *</label>
                <select v-model="academicForm.faculte" @change="updateClasses" required class="select-input">
                    <option value="">Sélectionner une faculté</option>
                    <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.id">
                        {{ faculte.nom }}
                    </option>
                </select>

                <label>Classe *</label>
                <select v-model="academicForm.classe" @change="updateCours" required class="select-input">
                    <option value="">Sélectionner une classe</option>
                    <option v-for="classe in availableClasses" :key="classe.id" :value="classe.id">
                        {{ classe.nom }}
                    </option>
                </select>

                <label>Cours disponibles *</label>
                <div class="col">
                    <div v-for="cours in availableCours" :key="cours.id" class="check-box-input">
                        <input v-model="academicForm.coursSelectionnes" :value="cours.id" type="checkbox" class="" />
                        <span>{{ cours.nom }}</span>
                    </div>
                </div>

            </fieldset>

            <button type="submit" class="submit-btn">Valider l'inscription</button>
        </form>
    </div>
</template>

<style scoped>
.container-form {
    /* max-width: 600px; */
    background-color: var(--color-surface);
    margin: auto;
    gap: 1rem;
    color: var(--color-primary);
    padding: 1rem;
    border-radius: 10px;
    border: 2px solid var(--color-primary);
}

.container-form .form {
    gap: .5rem;
}

.container-form .form fieldset {
    margin-top: 20px;
    padding: 12px;
    border: 1px solid var(--color-primary);
    border-radius: 6px;
}

.container-form .form legend {
    font-weight: bold;
    margin-bottom: 10px;
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

.input:focus,
.select-input:focus {
    border: 1px solid var(--color-primary);
}

label {
    font-size: 14px;
}

.checkbox {
    display: flex;
    align-items: center;
    /* justify-content: start; */
    border: 1px solid #000;
}

.submit-btn {
    width: 100%;
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    padding: .8rem;
    font-family: "Poppins", sans-serif;
    font-size: 14px;
    border: none;
    border-radius: 50px;
    font-weight: bold;
    cursor: pointer;
    transition: all .5s;
}

.submit-btn:hover {
    background-color: var(--color-primary);
}
</style>