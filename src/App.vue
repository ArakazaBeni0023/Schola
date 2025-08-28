<script>
import LoginView from './views/auth/LoginView.vue';
import ResetPassword from './views/auth/ResetPassword.vue';

export default {
  name: 'App',
  components: {
    LoginView,
    ResetPassword,
  },
  data() {
    return {
      isAuthenticated: false,
      showResetPassword: false,
    };
  },
  created() {
    this.checkAuthentication();
  },
  methods: {
    checkAuthentication() {
      const user = localStorage.getItem('schola.currentUser');
      this.isAuthenticated = !!user;
    },
    handleLoginSuccess() {
      this.isAuthenticated = true;
    },
    triggerResetPassword() {
      this.showResetPassword = true;
    },
    closeResetPassword() {
      this.showResetPassword = false;
    }
  }
};
</script>

<template>
  <div class="main-container">
    <router-view v-if="isAuthenticated" />
    <LoginView v-else-if="!showResetPassword" @login-success="handleLoginSuccess"
      @forgot-password="triggerResetPassword" />
    <ResetPassword v-if="showResetPassword" @close="closeResetPassword" />
  </div>
</template>


<style>
.main-container {
  position: relative;
}
</style>
