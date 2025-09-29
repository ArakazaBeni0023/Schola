<template>
    <transition name="fade">
        <div v-if="visible" class="toast" :class="type">
            <i :class="icon"></i>
            <span>{{ message }}</span>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'ToastMessage',
    props: {
        message: String,
        type: {
            type: String,
            default: 'info'
        },
        duration: {
            type: Number,
            default: 3000
        }
    },
    data() {
        return {
            visible: false
        };
    },
    computed: {
        icon() {
            switch (this.type) {
                case 'success': return 'bi-check-circle-fill';
                case 'error': return 'bi-x-circle-fill';
                case 'warning': return 'bi-exclamation-triangle-fill';
                default: return 'bi-info-circle-fill';
            }
        }
    },
    mounted() {
        this.visible = true;
        setTimeout(() => {
            this.visible = false;
            this.$emit('hide');
        }, this.duration);
    }
};
</script>

<style scoped>
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 18px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 1000;
}

.toast.success {
    background: #4caf50;
}

.toast.error {
    background: #f44336;
}

.toast.warning {
    background: #ff9800;
}

.toast.info {
    background: #2196f3;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
