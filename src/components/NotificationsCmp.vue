<script>
export default {
    props: {
        message: String
    },
    data() {
        return {
            notifications: [],
        }
    },
    methods: {
        addNotification(message) {
            const notification = {
                id: Date.now(),
                message
            }
            this.notifications.push(notification)

            setTimeout(() => {
                this.dismissNotification(notification.id)
            }, 5000)
        },
        dismissNotification(id) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        },
    }
}
</script>

<template>
    <div class="">
        <div class="container">
            <div v-for="notification in notifications" :key="notification.id" class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-yellow-700"><i class="bi-exclamation-triangle-fill"></i> {{ notification.message
                        }}</span>
                </div>
                <button @click="dismissNotification(notification.id)" class="text-yellow-700 hover:text-yellow-900">
                    <i class="bi-x"></i>
                </button>
            </div>
        </div>
    </div>
</template>