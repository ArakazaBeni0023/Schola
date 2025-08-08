<script>
export default {
    data() {
        return {
            facultes: [
                {
                    id: 1,
                    nom: 'Sciences et Technologies',
                    classes: [
                        { id: 1, nom: 'L1 Informatique' },
                        { id: 2, nom: 'L2 Informatique' },
                        { id: 3, nom: 'L3 Informatique' }
                    ]
                },
                {
                    id: 2,
                    nom: 'Lettres et Sciences Humaines',
                    classes: [
                        { id: 4, nom: 'L1 Littérature' },
                        { id: 5, nom: 'L2 Littérature' }
                    ]
                }
            ],
            // Faculty management
            newFacultyName: '',
            selectedFacultyFilter: '',
        }
    },
    methods: {
        addFaculty() {
            if (this.newFacultyName.trim()) {
                this.facultes.push({
                    id: this.facultes.length + 1,
                    nom: this.newFacultyName.trim(),
                    classes: []
                });
                this.newFacultyName = '';
                // this.addNotification('Faculté ajoutée avec succès');
            }
        },
    }
}
</script>

<template>
    <div class="facuty-management-container">
        <h3 class="title">Gestion des facultés</h3>
        <div class="facuty-management-container-header">
            <input v-model="newFacultyName" type="text" placeholder="Nom de la faculté" class="input">
            <button @click="addFaculty" class="add-btn"><i class="bi-plus"></i> Ajouter</button>
        </div>
        <div class="faculties-container">
            <div v-for="faculte in facultes" :key="faculte.id" class="faculty">
                <h4>{{ faculte.nom }}</h4>
                <p>{{ faculte.classes?.length || 0 }} classes</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.facuty-management-container {
    background: var(--color-surface);
    padding: 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    gap: .5rem;
}

.facuty-management-container-header {
    gap: .5rem;
    padding: 0;
}

.facuty-management-container-header .input {
    /* all: unset; */
    background: var(--hover-lw);
    border: 1px solid #00000000;
    height: 100%;
    padding: .8rem;
    flex-grow: 1;
    border-radius: 7px;
    font-size: 12px;
    transition: all .5s ease;
}

.facuty-management-container-header .input:focus {
    border: 1px solid var(--color-secondary);
}

.add-btn {
    all: unset;
    background: var(--color-primary);
    color: var(--color-text-light);
    padding: .8rem;
    border-radius: 8px;
    font-size: 12px;
    transition: all .5s ease;
    cursor: pointer;
}

.add-btn:hover {
    background: var(--color-primary-dark);
}

.faculties-container {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: auto;
    gap: .5rem;
    padding-block-start: 1rem;
}

.faculty {
    background: var(--hover-lw);
    border: 1px solid var(--color-secondary);
    padding: .5rem;
    border-radius: .5rem;
}

.faculty p {
    font-size: 12px;
}

@media (max-width:768px) {
    .faculties-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>