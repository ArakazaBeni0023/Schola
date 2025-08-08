<script>
import ModalCmp from './ModalCmp.vue';
export default {
    components: { ModalCmp }
}
</script>

<template>
    <ModalCmp>
        <div class="modal-header">
            <h3>Voulez vous supprimer cette note ?</h3>
            <p class="dsc">Cette action aura pour effet de supprimer
                définitivement vos données notent</p>
        </div>
        <div class="btn-grp">
            <button class="btn" @click="$emit(close)">Annuler</button>
            <button class="btn delete-btn" @click="$emit('deleteNote')"><i class="bi bi-trash"></i>
                Supprimer</button>
        </div>
    </ModalCmp>
</template>