<script>
import HeaderCmp from './HeaderCmp.vue';
import UserManagement from './AdminComps/UserManagement.vue';
import FacultyManagement from './AdminComps/FacultyManagement.vue';
import CoursesManagement from './AdminComps/CoursesManagement.vue';
import StudentOverview from './AdminComps/StudentOverview.vue';
import ProfOverview from './AdminComps/ProfOverview.vue';
import ValidatedCourses from './AdminComps/ValidatedCourses.vue';

export default {
    name: 'AdministrationView',
    components: {
        HeaderCmp,
        UserManagement,
        FacultyManagement,
        CoursesManagement,
        ProfOverview,
        StudentOverview,
        ValidatedCourses
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

            <!-- Courses Management -->
            <CoursesManagement />

            <!-- Professor Overview -->
            <ProfOverview />

            <!-- Student Overview -->
            <StudentOverview />

            <!-- Validated Courses -->
            <ValidatedCourses />

            <!----------------------- displaying for mobile only -->
            <VCalendar class="calendrier" :attributes="attributes" />
        </div>
        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
        </div>
    </div>
</template>