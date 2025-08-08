<script>
export default {
    data() {
        return {
            resetEmail: ''
        }
    },
    methods: {
        resetPassword() {
            this.addNotification(`Instructions de réinitialisation envoyées à ${this.resetEmail}`)
            this.showPasswordReset = false
            this.resetEmail = ''
        },
    }
}
</script>

<template>
    <div class="form-container">
        <form class="form" @submit.prevent="resetPassword">
            <div class="logo">
                <img src="" alt="">
            </div>
            <h1 class="form-title">Réinitialisation du mot de passe</h1>
            <div class="form-group">
                <label class="label">Email</label>
                <input v-model="resetEmail" type="email" required class="input" placeholder="Votre email">
            </div>
            <div class="btns-group">
                <button type="button" class="cancel-btn">Annuler</button>
                <button type="submit" class="submit-btn">Envoyer</button>
            </div>
        </form>
    </div>
</template>