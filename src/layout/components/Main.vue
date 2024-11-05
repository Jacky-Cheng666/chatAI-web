<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
    <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
        </transition>
    </router-view>
</template>

