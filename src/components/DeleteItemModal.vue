<script>
import ModalCmp from './ModalCmp.vue';
export default {
    components: { ModalCmp },
    methods: {
        close() {
            this.$emit('closeUsrDltMdl');
        }
    }
}
</script>

<template>
    <ModalCmp>
        <div class="modal-header">
            <h3>Voulez vous supprimer cette élément ?</h3>
            <p class="dsc">Cette action aura pour effet de supprimer
                définitivement cette élément.</p>
        </div>
        <div class="btn-grp">
            <button class="btn" @click="close">Annuler</button>
            <button class="btn delete-btn" @click="$emit('deleteItem')">
                Supprimer</button>
        </div>
    </ModalCmp>
</template>
