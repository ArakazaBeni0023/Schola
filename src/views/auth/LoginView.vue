<script>
export default {
    name: "LoginView",
    data() {
        return {
            email: "",
            password: "",
            rememberMe: false,
        };
    },
    methods: {
        login() {
            const storedUsers = JSON.parse(localStorage.getItem("schola.users")) || [{ id: "s_12bsxdftThGkkH", nom:"admin", prenom:"", email: "admin@schola.com", password:"Test123!", role:"admin"} ];

            const user = storedUsers.find(
                u => u.email === this.email && u.password === this.password
            );

            if (user) {
                if (this.rememberMe) {
                    localStorage.setItem("schola.currentUser", JSON.stringify(user));
                } else {
                    sessionStorage.setItem("schola.currentUser", JSON.stringify(user));
                }

                alert("Login successful");
                this.$emit("login-success");
            } else {
                alert("Invalid email or password ");
            }
        }
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
                <input type="email" v-model.trim="email" required placeholder="Votre adresse email" class="input" />
            </div>

            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" v-model.trim="password" required placeholder="Votre mot de passe"
                    class="input" />
            </div>

            <div class="inline">
                <label class="check-box-input">
                    <input type="checkbox" v-model.trim="rememberMe" />
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
.auth-form {
    padding: 3rem 1rem;
    border-radius: 15px;
    border: 2px solid var(--color-primary);
    box-shadow: var(--shadow-4);
}

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
