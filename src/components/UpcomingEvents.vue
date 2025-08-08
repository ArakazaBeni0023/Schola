<script>
export default {
    name: 'ScheduleComponent',
    data() {
        return {
            events: [
                {
                    subject: 'Biologie',
                    time: '9:00 am',
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste eum culpa quas.',
                    interval: '9:00 am - 10:00 am',
                },
                {
                    subject: 'Chimie',
                    time: '11:00 am',
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste eum culpa quas.',
                    interval: '11:00 am - 12:00 pm',
                },
                {
                    subject: 'Physique',
                    time: '1:00 pm',
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste eum culpa quas.',
                    interval: '1:00 pm - 2:00 pm',
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
}

.schedule-header hr {
    background: var(--color-primary);
    width: 180px;
}

.schedule-body {
    gap: 1rem;
}

.schedule-body .event {
    height: 50px;
    gap: .5rem;
}

.saparator {
    border-radius: 50px;
    width: 10px;
    height: 100%;
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
    min-width: 100px;
    text-align: end;
}
</style>
