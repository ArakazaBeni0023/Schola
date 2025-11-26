<script>
import ModalCmp from './ModalCmp.vue';
export default {
    components: {
        ModalCmp
    },
    methods: {
        close() {
            this.$emit('clsModal');
        },
        logout() {
            this.$emit('logout');
        }
    }
}
</script>

<template>
    <ModalCmp>
        <div class="modal-header">
            <h3>Se Déconnecter</h3>
            <p class="dsc">Voulez-vous vous déconnecter ?</p>
        </div>
        <div class="btn-grp">
            <button class="btn" @click="close">Annuler</button>
            <button class="btn delete-btn" @click="logout">Oui, déconnecter</button>
        </div>
    </ModalCmp>
</template>

<style scoped></style>