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
            this.currentUser = allUsers.find(u => u.id === minimalUser.id && u.role === 'professeur');
        }
    },
    methods: {
        handleCourseSelection(course) {
            this.selectedCourse = course;
        },
        addNotification(message) {
            alert(message);
        }
    }
};
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp />
            <h2 class="main-title">Espace Professeur</h2>

            <Dashboard :onSelectCourse="handleCourseSelection" />

            <NotesEditor v-if="selectedCourse" :course="selectedCourse" :currentUser="currentUser"
                @notify="addNotification" />

            <UpcomingEvents class="UpCommingEvents" :userEmail="currentUser?.email" :isProfesseur="true" />
        </div>

        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents class="UpCommingEvents" :userEmail="currentUser?.email" :isProfesseur="true" />
            <NotesCmp class="NotesCmp" />
        </div>
    </div>
</template>
