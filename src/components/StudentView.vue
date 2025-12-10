<script>
// import RegistrationForm from './StudentComps/RegistrationForm.vue';
import ScheduleCmp from './StudentComps/ScheduleCmp.vue';
import GradesCmp from './StudentComps/GradesCmp.vue';
import UpcomingEvents from './UpcomingEvents.vue';
import HeaderCmp from './HeaderCmp.vue';

export default {
    name: 'StudentView',
    components: {
        // RegistrationForm,
        ScheduleCmp,
        GradesCmp,
        UpcomingEvents,
        HeaderCmp
    },
    data() {
        return {
            currentUser: null,
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
            hasUsedRegistrationForm: false
        };
    },
    created() {
        const savedUser = localStorage.getItem('schola.currentUser');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedUser && savedUsers) {
            const minimalUser = JSON.parse(savedUser);
            const allUsers = JSON.parse(savedUsers);
            this.currentUser = allUsers.find(u => u.id === minimalUser.id && u.role === 'etudiant');
        }

        const registrationUsed = localStorage.getItem('schola.registrationUsed');
        this.hasUsedRegistrationForm = registrationUsed === 'true';
    },
    methods: {
        onRegistrationComplete() {
            this.hasUsedRegistrationForm = true;
            localStorage.setItem('schola.registrationUsed', 'true');
        }
    }

}
</script>

<template>
    <div class="global-container">
        <HeaderCmp />

        <h2 class="main-title">Espace Étudiant</h2>

        <VCalendar class="calendrier" :attributes="attributes" />
        <UpcomingEvents class="UpcomingEvents" :userEmail="currentUser?.email" :isProfesseur="false" :key="eventsKey" />

        <!-- Schedule -->
        <ScheduleCmp />

        <!-- Grades -->
        <GradesCmp />
        <!----------------------- displaying for mobile only -->
    </div>
</template>

<style scoped>
.global-container {
    display: flex;
    flex-direction: column;
    padding-block: 1rem;
    padding-inline-end: 1rem;
}

.UpcomingEvents {
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    padding: 1rem;
    border-radius: 15px;
}
</style>