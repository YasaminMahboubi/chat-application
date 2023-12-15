<script setup>
    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    import { socket } from '../../socket';

    const cancelRemovingFriend = () => {
        chatStoreOn.deleteRequest = false;
    }

    const removeFriend = () => {
        let cookie = document.cookie.split('=');
        let userObjFromCookie = JSON.parse(cookie[1]);
        let data = {
            username: chatStoreOn.deleteFriend.username
        }
        if(userObjFromCookie.lastChatWith == chatStoreOn.deleteFriend.username){
            let cookie = {
                username: chatStoreOn.savedUsername,
                bgColor: chatStoreOn.userBackground,
                lastChatWith: ''
            }
            chatStoreOn.setCookie(cookie);
            data.emitChat = true;
        }
        socket.emit('delete friend' , data);
        chatStoreOn.deleteRequest = false;    
    }
</script>

<template>
    <div class="reqMsgContainer flexCenter" :class="{'reqMsg': !chatStoreOn.darkMoodOn  , 'reqMsgDark': chatStoreOn.darkMoodOn}">
        <div class="flexColumn userDivReq">
            <p>are you sure you want to delete </p>
            <div class="flexCenter eachUser" :style="{'background-color' : chatStoreOn.deleteFriend.bgColor}">{{ chatStoreOn.firstLetter(chatStoreOn.deleteFriend.username) }}</div>
            <p>{{ chatStoreOn.deleteFriend.username }}</p>
        </div>
        <div>
            <p>from your friend list?</p>
            <p>all messages will be deleted!</p>
        </div>
        <div class="btnDiv flexCenter">
            <button class="sendRequest" @click="removeFriend">Yes</button>
            <button class="cancelRequest" @click="cancelRemovingFriend">No</button>
        </div>
    </div>
</template>