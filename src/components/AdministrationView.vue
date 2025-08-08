<script>
import UserManagement from './AdminComps/UserManagement.vue';
import FacultyManagement from './AdminComps/FacultyManagement.vue';
import StudentOverview from './AdminComps/StudentOverview.vue';
import HeaderCmp from './HeaderCmp.vue';

export default {
    name: 'AdministrationView',
    components: {
        UserManagement,
        FacultyManagement,
        StudentOverview,
        HeaderCmp
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

    computed: {

    },

    methods: {

    },

    mounted() {

    },

}
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp />

            <h2 class="main-title">Espace Administration</h2>

            <!-- User Management -->
            <UserManagement />

            <!-- Faculty Management -->
            <FacultyManagement />

            <!-- Student Overview -->
            <StudentOverview />
        </div>
        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
        </div>
    </div>
</template>
