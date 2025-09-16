<script>
import Dashboard from '@/components/ProfComps/DashboardCmp.vue';
import NotesEditor from '@/components/ProfComps/NotesEditor.vue';
import NotesCmp from './ProfComps/NotesCmp.vue';
import UpcomingEvents from './UpcomingEvents.vue';
import HeaderCmp from './HeaderCmp.vue';

export default {
    name: 'ProfessorView',
    components: {
        Dashboard,
        NotesEditor,
        NotesCmp,
        UpcomingEvents,
        HeaderCmp
    },
    data() {
        return {
            selectedCourse: null,
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
        };
    },
    methods: {
        handleCourseSelection(course) {
            this.selectedCourse = course;
        },
        addNotification(message) {
            alert(message); // ou utilise un système de notification
        }
    }
}
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp />
            <h2 class="main-title">Espace Professeur</h2>

            <!-- Dashboard -->
            <Dashboard :onSelectCourse="handleCourseSelection" />

            <!-- Notes Editor -->
            <NotesEditor v-if="selectedCourse" :course="selectedCourse" @notify="addNotification" />
        </div>

        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents class="UpCommingEvents" />
            <NotesCmp class="NotesCmp" />
        </div>
    </div>
</template>
