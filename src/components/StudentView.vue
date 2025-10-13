<script>
import RegistrationForm from './StudentComps/RegistrationForm.vue';
import ScheduleCmp from './StudentComps/ScheduleCmp.vue';
import GradesCmp from './StudentComps/GradesCmp.vue';
import UpcomingEvents from './UpcomingEvents.vue';
import HeaderCmp from './HeaderCmp.vue';

export default {
    name: 'StudentView',
    components: {
        RegistrationForm,
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
    }

}
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp />

            <h2 class="main-title">Espace Étudiant</h2>

            <!-- Registration Form  -->
            <RegistrationForm />

            <!-- Schedule -->
            <ScheduleCmp />

            <!-- Grades -->
            <GradesCmp />
            <!----------------------- displaying for mobile only -->
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents class="UpCommingEvents" :userEmail="currentUser?.email" :isProfesseur="true" />
        </div>
        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents class="UpCommingEvents" :userEmail="currentUser?.email" :isProfesseur="false" />
        </div>
    </div>
</template>