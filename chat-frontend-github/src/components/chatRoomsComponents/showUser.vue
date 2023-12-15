<script setup>
    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();
</script>

<template>
    <div id="usernameAvatar" class="flexCenter" :style="{'background-color': chatStoreOn.userBackground}">{{ chatStoreOn.firstLetter(chatStoreOn.savedUsername) }}</div>
</template>

<style>
    #usernameAvatar{
        width: 50px;
        height: 50px;
        color: #fff;
        font-size: 1.5rem;
        border-radius: 50%;
    }
</style>