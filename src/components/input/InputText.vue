<template>
    <div class="w-full space-y-1">
        <label :for="labelFor" class="font-semibold text-base" v-if="labelText">{{ labelText }}</label>
        <input type="text" :disabled="disabled" :name="labelFor" :placeholder="placeholder" v-model="text" @blur="leave"
            :class="{ 'border-red-500': validation && validation.length > 0 }" :maxlength="maxlength" @keypress.enter="$emit('enter')"
            class="disabled:bg-gray-100 bg-white border border-gray-100 w-full p-3 rounded-lg text-lg text-gray-700 outline-0" />
        <p class="text-sm text-red-500" v-if="validation && validation.length > 0">{{ validation }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps(["labelFor", "placeholder", "labelText", "modelValue", "disabled", "validation", "maxlength"]);
const emit = defineEmits(["update:modelValue", "leave", "enter"]);

const text = computed({
    get() {
        return props.modelValue;
    },
    set(newValue: string) {
        emit("update:modelValue", newValue);
    }
});

function leave(): void {
    emit("leave");
}
</script>