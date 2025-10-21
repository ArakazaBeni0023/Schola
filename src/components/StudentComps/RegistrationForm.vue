<script>
export default {
    name: 'StudentRegistrationView',
    data() {
        return {
            studentForm: {
                nom: '',
                prenom: '',
                email: '',
                dateNaissance: '',
                sexe: '',
                telephone: '',
                motDePasse: '',
                motDePasseConfirmation: ''
            },
            facultes: [],
            availableAnnees: [],
            availableCours: [],
            academicForm: {
                faculteId: '',
                anneeEtude: '',
            }
        };
    },
    mounted() {
        const facultesData = JSON.parse(localStorage.getItem('schola.facultes')) || [];
        this.facultes = facultesData;
    },
    methods: {
        updateAnnees() {
            const facId = parseInt(this.academicForm.faculteId);
            const fac = this.facultes.find(f => f.id === facId);

            if (fac && fac.duree) {
                this.availableAnnees = Array.from({ length: fac.duree }, (_, i) => i + 1);
            } else {
                this.availableAnnees = [];
            }

            this.academicForm.anneeEtude = '';
            this.availableCours = [];
        },
        updateCours() {
            const fac = this.facultes.find(f => f.id === parseInt(this.academicForm.faculteId));
            if (fac) {
                this.availableCours = fac.courses.filter(c => c.anneeEtude === parseInt(this.academicForm.anneeEtude));
            }
            this.academicForm.coursSelectionnes = [];
        },
        submitStudentRegistration() {
            const users = JSON.parse(localStorage.getItem('schola.users')) || [];
            const inscriptions = JSON.parse(localStorage.getItem('schola.inscriptions')) || [];

            if (users.some(u => u.email === this.studentForm.email)) {
                alert("Cet email est déjà utilisé.");
                return;
            }

            const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordPattern.test(this.studentForm.motDePasse)) {
                alert("Mot de passe invalide (min 8 caractères, 1 majuscule, 1 chiffre).");
                return;
            }

            if (this.studentForm.motDePasse !== this.studentForm.motDePasseConfirmation) {
                alert("Les mots de passe ne correspondent pas.");
                return;
            }

            if (!this.academicForm.faculteId || !this.academicForm.anneeEtude) {
                alert("Veuillez compléter la section académique.");
                return;
            }

            const fac = this.facultes.find(f => f.id === parseInt(this.academicForm.faculteId));

            const fullRegistration = {
                ...this.studentForm,
                faculte: fac.nom,
                annee: this.academicForm.anneeEtude,
            };

            inscriptions.push(fullRegistration);
            localStorage.setItem('schola.inscriptions', JSON.stringify(inscriptions));
            this.$emit('registration-complete');
            alert("Inscription réussie!");
            this.resetForm();
        },
        resetForm() {
            this.studentForm = {
                nom: '', prenom: '', email: '', dateNaissance: '',
                sexe: '', telephone: '', motDePasse: '', motDePasseConfirmation: ''
            };
            this.academicForm = {
                faculteId: '', anneeEtude: '', coursSelectionnes: []
            };
            this.availableAnnees = [];
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
                <div class="form-group">
                    <label>Nom *</label>
                    <input v-model.trim="studentForm.nom" type="text" required class="input" />
                </div>
                <div class="form-group">
                    <label>Prénom *</label>
                    <input v-model.trim="studentForm.prenom" type="text" required class="input" />
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input v-model.trim="studentForm.email" type="email" required class="input" />
                </div>
                <div class="form-group">
                    <label>Date de naissance *</label>
                    <input v-model.trim="studentForm.dateNaissance" type="date" required class="input" />
                </div>
                <div class="form-group">
                    <label>Sexe *</label>
                    <select v-model="studentForm.sexe" required class="select-input">
                        <option value="">Sélectionner</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Téléphone</label>
                    <input v-model.trim="studentForm.telephone" type="tel" class="input" />
                </div>

                <div class="form-group">
                    <label>Mot de passe *</label>
                    <input v-model.trim="studentForm.motDePasse" type="password" required class="input"
                        placeholder="min 8 caractères, 1 majuscule, 1 chiffre" />
                </div>

                <div class="form-group">
                    <label>Confirmer le mot de passe *</label>
                    <input v-model.trim="studentForm.motDePasseConfirmation" type="password" required class="input"
                        placeholder="Répétez le mot de passe" />
                </div>

            </fieldset>

            <!-- Informations académiques -->
            <fieldset>
                <legend>Informations académiques</legend>
                <div class="form-group">
                    <label>Faculté *</label>
                    <select v-model="academicForm.faculteId" @change="updateAnnees" required class="select-input">
                        <option value="">Sélectionner une faculté</option>
                        <option v-for="faculte in facultes" :key="faculte.id" :value="faculte.id">
                            {{ faculte.nom }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Année d’étude *</label>
                    <select v-model="academicForm.anneeEtude" @change="updateCours" required class="select-input">
                        <option value="">Sélectionner une année</option>
                        <option v-for="annee in availableAnnees" :key="annee" :value="annee">
                            Année {{ annee }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Cours disponibles ({{ availableCours.length }})</label>
                    <div class="col">
                        <div v-for="cours in availableCours" :key="cours.id" class="cours-dispo">
                            {{ cours.nom }}
                        </div>
                    </div>
                </div>
            </fieldset>

            <button type="submit" class="submit-btn">Valider l'inscription</button>
        </form>
    </div>
</template>

<style scoped>
.container-form {
    width: 100%;
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
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-top: 20px;
    padding: 12px;
    border: 1px solid var(--color-primary);
    border-radius: 6px;
}

.container-form .form fieldset .form-group {
    display: flex;
    font-size: 12px;
    flex-direction: column;
    gap: .2rem;
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

.col {
    display: flex;
    gap: .5rem;
}

.cours-dispo {
    background: var(--hover-lw);
    border-radius: 5px;
    padding: 5px 10px;
}

.submit-btn {
    width: 100%;
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    padding: .8rem;
    font-family: "Poppins", sans-serif;
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

<!-- 


-->