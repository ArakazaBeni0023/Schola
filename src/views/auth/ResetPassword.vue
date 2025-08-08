<script>
export default {
    data() {
        return {
            formInputs: [
                {
                    label: 'Mot de passe',
                    type: 'password',
                    placeholder: 'Votre mot de passe',
                    value: ''
                },
                {
                    label: 'Confirmation Mot de passe',
                    type: 'password',
                    placeholder: 'Confirmation du mot de passe',
                    value: ''
                },
            ],
        }
    },
    methods: {

    }
}
</script>

<template>
    <div class="form-container">
        <form class="auth-form" @submit.prevent="login">
            <div class="logo">
                <img src="" alt="">
            </div>
            <h1 class="form-title">Réinitialisation du mot de passe</h1>
            <div class="form-group" v-for="input in formInputs" :key="input">
                <label class="label">{{ input.label }}</label>
                <input v-model="input.value" :type="input.type" required class="input" :placeholder="input.placeholder">
            </div>
            <div class="btns-group">
                <button  class="cancel-btn" @click="$emit('close')">Fermer</button>
                <button type="submit" class="submit-btn">Envoyer</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.form{
    padding: 3rem 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    box-shadow: var(--shadow-4);
}

.inline {
    display: flex;
    justify-content: space-between;
}
</style>