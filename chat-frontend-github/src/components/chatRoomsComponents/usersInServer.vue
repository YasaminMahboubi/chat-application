<script setup>
    import { ref } from 'vue';
    import { socket } from '../../socket';

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    const usersInServer = ref([]);

    socket.on('show all users', (users) => {
        usersInServer.value = users.filter(user => user.username !== chatStoreOn.savedUsername);
    }); 

    const startFriendRequest = (user) => {
        chatStoreOn.userToRequest = user;
        chatStoreOn.sendRequest = true;
    }
</script>
<template>
    <b><p v-if="usersInServer.length !== 0">online users</p></b>
    <div class="displayUser flexColumn">
        <div class="emptyListMsg" v-if="usersInServer.length == 0">
            <p>no one is online</p>
            <img src="/images/sadFaceIcon.png" alt="sad face" :class="{'opacityLight': chatStoreOn.darkMoodOn}">
        </div>

        <div class="flexCenter showUsersDiv"  v-if="usersInServer.length !== 0" v-for="user in usersInServer" :key="user.username" @click="startFriendRequest(user)" :title="user.username">
            <div class="userDiv flexCenter ">
                <div class="flexCenter eachUser" :style="{'background-color' : user.bgColor}">{{ chatStoreOn.firstLetter(user.username) }}</div>
                <p>{{ chatStoreOn.cutLongName(user.username) }}</p>
                <span class="status" v-if="usersInServer.length !== 0"></span>
            </div>
        </div>
    </div>
</template>
