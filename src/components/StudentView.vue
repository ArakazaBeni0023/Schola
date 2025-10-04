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
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
        };
    },
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
            <UpcomingEvents class="UpCommingEvents" />

        </div>
        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents class="UpCommingEvents" />
        </div>
    </div>
</template>