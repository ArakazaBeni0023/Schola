<script>
export default {
    data() {
        return {
            email: '',
            password: '',
            rememberMe: false,
            users: [
                { email: 'etudiant@test.com', password: 'Test123!', role: 'etudiant' },
                { email: 'prof@test.com', password: 'Test123!', role: 'professeur' },
                { email: 'admin@test.com', password: 'Test123!', role: 'admin' },
            ],
            currentUser: null
        };
    },
    mounted() {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            const user = JSON.parse(remembered);
            this.email = user.email;
            this.role = user.role;
            this.rememberMe = true;
        }
    },
    methods: {
        login() {
            const user = this.users.find(u =>
                u.email === this.email && u.password === this.password
            );

            if (user) {
                this.currentUser = user;

                if (this.rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify({ email: user.email, role: user.role }));
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                // this.addNotification('Connexion réussie');
                this.$emit('login-success');
            } else {
                // this.addNotification('Email ou mot de passe incorrect');
            }
        },
        /*
        addNotification(message) {
            alert(message);
        } */
    }
};
</script>

<template>
    <div class="form-container">
        <form class="auth-form" @submit.prevent="login">
            <div class="logo">
                <img src="" alt="">
            </div>
            <h1 class="form-title">Connexion</h1>

            <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="email" required placeholder="Votre adresse email" class="input" />
            </div>

            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" v-model="password" required placeholder="Votre mot de passe" class="input" />
            </div>

            <div class="inline">
                <label class="check-box-input">
                    <input type="checkbox" v-model="rememberMe" />
                    Se souvenir de moi
                </label>
                <p class="forgot" @click="$emit('forgot-password')">Mot de passe oublié ?</p>
            </div>

            <div class="btns-group">
                <button type="submit" class="submit-btn">Se connecter</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.input {
    width: 100%;
    padding: 10px;
    margin: 6px 0 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
