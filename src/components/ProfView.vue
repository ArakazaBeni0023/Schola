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

            <h2 class="main-title">Espace Professeur</h2>

            <!-- Dashboard -->
            <Dashboard />

            <!-- Grade Management -->
            <NotesEditor />
        </div>

        <div class="right-side">
            <VCalendar class="calendrier" :attributes="attributes" />
            <UpcomingEvents />
            <NotesCmp />
        </div>
    </div>
</template>
