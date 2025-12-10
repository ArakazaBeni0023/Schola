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
            calendarAttributes: [],
            calendarEvents: [],
            notifications: [],
            notificationId: 0,
            eventsKey: 0
        };
    },
    created() {
        const savedUser = localStorage.getItem('schola.currentUser');
        const savedUsers = localStorage.getItem('schola.users');

        if (savedUser && savedUsers) {
            const minimalUser = JSON.parse(savedUser);
            const allUsers = JSON.parse(savedUsers);
            this.currentUser = allUsers.find(u => u.id === minimalUser.id && u.role === 'professeur');

            if (this.currentUser) {
                this.loadCalendarEvents();
            }
        }
    },
    methods: {
        refreshUpcomingEvents() {
            this.eventsKey += 1;
        },

        loadCalendarEvents() {
            try {
                const savedEvents = localStorage.getItem('schola.horaires');
                if (!savedEvents) return;

                const allEvents = JSON.parse(savedEvents);

                this.calendarEvents = allEvents.filter(event =>
                    event.professeurId === this.currentUser?.id ||
                    event.participants?.includes(this.currentUser?.email)
                );

                this.calendarAttributes = this.calendarEvents.map(event => ({
                    key: event.id,
                    highlight: {
                        color: this.getEventColor(event.type),
                        fillMode: 'light'
                    },
                    dates: new Date(event.date),
                    popover: {
                        label: `${event.title} - ${event.description || ''}`,
                        visibility: 'hover'
                    },
                    customData: event
                }));

            } catch (error) {
                console.error('Erreur chargement calendrier:', error);
            }
        },

        getEventColor(eventType) {
            const colors = {
                cours: 'blue',
                examen: 'red',
                reunion: 'green',
                deadline: 'orange',
                default: 'gray'
            };
            return colors[eventType] || colors.default;
        },

        handleCourseSelection(course) {
            this.selectedCourse = course;
        },

        addNotification(message, type = 'info') {
            const notification = {
                id: ++this.notificationId,
                message,
                type,
                timestamp: new Date()
            };

            this.notifications.push(notification);

            setTimeout(() => {
                this.removeNotification(notification.id);
            }, 5000);
        },

        removeNotification(id) {
            this.notifications = this.notifications.filter(n => n.id !== id);
        },

        closeNotesViewer() {
            this.selectedCourse = null;
            if (this.$refs.dashboard) {
                this.$refs.dashboard.refresh();
            }
        },

        getNotificationIcon(type) {
            const icons = {
                info: 'bi-info-circle',
                success: 'bi-check-circle',
                error: 'bi-exclamation-circle',
                warning: 'bi-exclamation-triangle'
            };
            return icons[type] || 'bi-info-circle';
        },

        handleNotesValidated(course) {
            if (this.$refs.dashboard) {
                this.$refs.dashboard.loadAndCalculateCourseStats();
            }
            this.addNotification(`Notes validées pour ${course.nom}`, 'success');
        }
    }

};
</script>

<template>
    <div class="global-container">
        <div class="left-side">
            <HeaderCmp />
            <h2 class="main-title">Espace Professeur</h2>

            <VCalendar v-if="!selectedCourse" class="calendrier" :attributes="calendarAttributes"
                @dayclick="handleDayClick" />
            <UpcomingEvents v-if="!selectedCourse" class="UpcomingEvents" :userEmail="currentUser?.email"
                :isProfesseur="true" :key="eventsKey" />
            <NotesCmp v-if="!selectedCourse" class="NotesCmp" />
            <Dashboard v-if="!selectedCourse" :onSelectCourse="handleCourseSelection" ref="dashboard" />
            <NotesEditor v-if="selectedCourse" :course="selectedCourse" :currentUser="currentUser"
                @notify="addNotification" @closeNotesViewer="closeNotesViewer" @notesValidated="handleNotesValidated" />
        </div>

        <div class="right-side">
            <VCalendar class="calendrier" :attributes="calendarAttributes" @dayclick="handleDayClick" />

            <UpcomingEvents class="UpcomingEvents" :userEmail="currentUser?.email" :isProfesseur="true"
                :key="eventsKey" />

            <NotesCmp class="NotesCmp" />
        </div>
    </div>
</template>

<style scoped>
.left-side .calendrier,
.left-side .UpcomingEvents {
    display: none;
    background: var(--color-surface);
    border: 2px solid var(--hover-lw)
}

.notifications-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
}

.notification {
    padding: 12px 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: slideIn 0.3s ease;
    border-left: 4px solid #3b82f6;
}

.notification-info {
    border-left-color: #3b82f6;
}

.notification-success {
    border-left-color: var(--color-success);
}

.notification-error {
    border-left-color: var(--color-danger);
}

.notification-warning {
    border-left-color: var(--color-warning);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.notification-close:hover {
    background: #f3f4f6;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (max-width:768px) {
    .left-side .UpcomingEvents {
        display: flex;
    }
}
</style>
