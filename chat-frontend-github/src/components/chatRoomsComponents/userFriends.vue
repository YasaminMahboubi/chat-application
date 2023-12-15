<script setup>
    import { ref } from 'vue';
    import { socket } from '../../socket';

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    const userFriends = ref([]);
    const showDeleteFriendBtn = ref(false);

    socket.on('user friends' , (friends) => {
        userFriends.value = friends;
    })

    const showDeleteOption = () => {
        showDeleteFriendBtn.value = true;
    }

    const deleteFriend = (deleteFriend) => {
        chatStoreOn.deleteFriend = {
            username: deleteFriend.username,
            bgColor: deleteFriend.bgColor
        }
        chatStoreOn.deleteRequest = true;
    }

</script>
<template>
    <div>
        <p v-if="userFriends.length !== 0">online | <span id="grayColor"> all</span></p>
    </div>
    <div class="displayUser flexColumn">
        <div class="emptyListMsg" v-if="userFriends.length == 0">
            <p> your friend list is empty</p>
            <img src="/images/sadFaceIcon.png" alt="sad face" :class="{'opacityLight': chatStoreOn.darkMoodOn}">
        </div>

        <div class="flexCenter showUsersDiv" v-if="userFriends.length !== 0" v-for="user in userFriends" :key="user.username" @mouseover="showDeleteOption" @click="chatStoreOn.startChat(user)" :title="user.username">
            <div class="userDiv flexCenter">
                <div class="flexCenter eachUser" :style="{'background-color' : user.bgColor}">
                    {{ chatStoreOn.firstLetter(user.username) }}
                </div>
                <p>{{ chatStoreOn.cutLongName(user.username) }}</p>
                <span class="status"></span>
            </div>
            <button class="removeFriend" :class="{'opacityZero': !showDeleteFriendBtn}" @click="deleteFriend(user)">X</button>
        </div>
    </div>
</template>

<style scoped>
    #grayColor{
        color: #666;
    }
    .removeFriend{
        color: #666;
        font-size: 1rem;
        transition-duration: 1s;
        background-color: transparent;
    }
    .removeFriend:hover{
        color: red;
    }
 
</style>