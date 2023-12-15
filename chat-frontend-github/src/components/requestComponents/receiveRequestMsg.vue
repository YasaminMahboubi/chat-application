<script setup>
    import { ref , onMounted } from 'vue';
    import { socket } from '../../socket';

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    const rejectRequest = () => {
        chatStoreOn.receiveRequest = false;
    }
    const acceptRequest = () => {
        socket.emit('accept request', { acceptedReqFrom : chatStoreOn.savedUsername, acceptedUser : chatStoreOn.requestFromUser});
        chatStoreOn.receiveRequest = false;
    }
</script>
<template>
    <div class="reqMsgContainer flexCenter" :class="{'reqMsg': !chatStoreOn.darkMoodOn  , 'reqMsgDark': chatStoreOn.darkMoodOn}">
        <div  class="flexColumn userDivReq">
            <div class="flexCenter eachUser" :style="{'background-color' : chatStoreOn.requestFromUser.bgColor}">{{ chatStoreOn.firstLetter(chatStoreOn.requestFromUser.username) }}</div>
            <p>{{ chatStoreOn.requestFromUser.username }}</p>
        </div>
        <div>
            <p>sent a friend request to you</p>
            <p>do you want to accept it?</p>
        </div>
        <div class="btnDiv flexCenter">
            <button class="sendRequest" @click="acceptRequest">Yes</button>
            <button class="cancelRequest"  @click="rejectRequest">No</button>
        </div>
    </div>
</template>