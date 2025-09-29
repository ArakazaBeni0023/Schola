<script>
export default {
    name: 'ScheduleComponent',
    data() {
        return {
            events: [
                {
                    subject: 'Biologie',
                    time: '9:00 am',
                    interval: '2h',
                },
                {
                    subject: 'Chimie',
                    time: '11:00 am',
                    interval: '1h',
                },
                {
                    subject: 'Physique',
                    time: '1:00 pm',
                    interval: '2h',
                }
            ],
            attributes: [
                {
                    highlight: true,
                    dates: new Date(),
                },
            ],
        };
    },
    computed: {
        formattedDate() {
            const date = this.attributes[0].dates;
            return this.formatDate(date);
        },
    },
    methods: {
        formatDate(date) {
            const mois = [
                'Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
            ];
            const jour = String(date.getDate()).padStart(2, '0');
            const moisTexte = mois[date.getMonth()];
            return `${jour} ${moisTexte}`;
        },
    },
};
</script>

<template>
    <div class="schedule">
        <h3 class="title">Événements à venir</h3>
        <div class="schedule-header">
            <h4>{{ formattedDate }}</h4>
            <hr>
            <div class="bi-three-dots-vertical"></div>
        </div>
        <div class="schedule-body">
            <div v-for="(event, index) in events" :key="index" class="event">
                <div class="time">
                    <h5> {{ event.time }}</h5>
                </div>
                <span class="saparator"></span>
                <div class="desc">
                    <h5>{{ event.subject }}</h5>
                    <p>{{ event.description }}</p>
                </div>
                <div class="interval">
                    <h5> {{ event.interval }}</h5>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.schedule {
    gap: 1rem;
}

.schedule-header h4 {
    text-align: center;
    color: var(--color-secondary);
    padding-block: .5rem;
}

.schedule-header hr {
    background: var(--color-primary);
    width: 180px;
}

.schedule-body {
    gap: 1rem;
}

.schedule-body .event {
    height: 65px;
    gap: .5rem;
}

.saparator {
    border-radius: 50px;
    width: 10px;
    height: 70%;
    background: var(--color-primary-dark);
}

.schedule-body .event .desc {
    width: 100%;
}

.schedule-body .event .desc p {
    font-size: 10px;
}

.schedule-body .event .time,
.schedule-body .event .interval {
    font-size: 12px;
    color: var(--color-muted);
}

.schedule-body .event .time {
    min-width: 45px;
}

.schedule-body .event .interval {
    min-width: 20px;
    text-align: end;
}

@media (max-width:768px) {
    .schedule {
        gap: 2rem;
        padding: 1rem;
        border-radius: 15px;
        border: 1px solid var(--hover-lw);
    }
}
</style>