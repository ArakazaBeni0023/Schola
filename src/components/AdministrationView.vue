<script>
import HeaderCmp from './HeaderCmp.vue';
import UserManagement from './AdminComps/UserManagement.vue';
import FacultyManagement from './AdminComps/FacultyManagement.vue';
import StudentOverview from './AdminComps/StudentOverview.vue';
import ProfOverview from './AdminComps/ProfOverview.vue';

export default {
    name: 'AdministrationView',
    components: {
        HeaderCmp,
        UserManagement,
        FacultyManagement,
        ProfOverview,
        StudentOverview,
    },

    data() {
        return {
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
        }
    },
}
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp class="navbar-fixed" />

            <h2 class="main-title">Espace Administration</h2>

            <!-- User Management -->
            <UserManagement />

            <!-- Faculty Management -->
            <FacultyManagement />

            <!-- Professor Overview -->
            <ProfOverview />

            <!-- Student Overview -->
            <StudentOverview />

            <!----------------------- displaying for mobile only -->
            <VCalendar class="calendrier" :attributes="attributes" />
        </div>
        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
        </div>
    </div>
</template>