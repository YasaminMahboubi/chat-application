<script setup>
    import { socket } from '../../socket';

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    const cancelRequest = () => {
        chatStoreOn.sendRequest = false;
    }
    
    const sendRequest = () => {
        let requestData = {
            reqFrom: chatStoreOn.savedUsername,
            reqTo:  chatStoreOn.userToRequest.username
        }
        socket.emit('friendship request' , requestData);
            chatStoreOn.sendRequest = false;
    }

</script>
<template>
    <div class="reqMsgContainer flexCenter" :class="{'reqMsg': !chatStoreOn.darkMoodOn  , 'reqMsgDark': chatStoreOn.darkMoodOn}">
        <p>do you want to send a friend request to</p>
        <div  class="flexColumn userDivReq">
            <div class="flexCenter eachUser" :style="{'background-color' : chatStoreOn.userToRequest.bgColor}">{{ chatStoreOn.firstLetter(chatStoreOn.userToRequest.username) }}</div>
            <p>{{ chatStoreOn.userToRequest.username }}</p>
        </div>
        <div class="btnDiv flexCenter">
            <button class="sendRequest" @click="sendRequest">Yes</button>
            <button class="cancelRequest" @click="cancelRequest">No</button>
        </div>
    </div>
</template>