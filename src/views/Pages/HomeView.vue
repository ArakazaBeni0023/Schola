<script>
import PlatformCmp from '@/components/PlatformCmp.vue';
import AdministrationView from '@/components/AdministrationView.vue';
import StudentView from '@/components/StudentView.vue';
import ProfView from '@/components/ProfView.vue';

export default {
    name: 'HomeView',
    components: {
        PlatformCmp,
        AdministrationView,
        ProfView,
        StudentView
    },
    data() {
        return {
            currentUserRole: null
        };
    },
    created() {
        const savedUser = localStorage.getItem('schola.currentUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);

            this.currentUserRole = userData.role;
        } else {
            this.$router.push('/auth/login');
        }
    },
};
</script>

<template>
    <PlatformCmp v-if="currentUserRole">
        <AdministrationView v-if="currentUserRole === 'admin'" />
        <ProfView v-else-if="currentUserRole === 'professeur'" />
        <StudentView v-else-if="currentUserRole === 'etudiant'" />
    </PlatformCmp>
</template>