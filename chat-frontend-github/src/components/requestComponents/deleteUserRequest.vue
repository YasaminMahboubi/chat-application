<script setup>
    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    import { socket } from '../../socket';

    const cancelRemoveAccount = () => {
        chatStoreOn.deleteUserRequest = false;
    }
    const removeAccount = () => {
        socket.emit('delete user' , chatStoreOn.savedUsername);
        chatStoreOn.destroyCookie();
        chatStoreOn.deleteUserRequest = false;
        chatStoreOn.existingCookie = false;
        chatStoreOn.savedUsername = '';
        chatStoreOn.userBackground = '';
        chatStoreOn.darkMoodOn = false;
        chatStoreOn.allUnreadMsg = 0;
    }

</script>
<template>
     <div id="reqContainer" class="reqMsgContainer flexCenter" :class="{'reqMsg': !chatStoreOn.darkMoodOn  , 'reqMsgDark': chatStoreOn.darkMoodOn}">
        <p id="deleteUserP">By logging out, all of your data will be removed, and you will have no access to your friends and chat messages.</p>
        <div class="btnDiv flexCenter">
            <button class="sendRequest" @click="removeAccount">Continue</button>
            <button class="cancelRequest" @click="cancelRemoveAccount">Cancel</button>
        </div>
    </div>
</template>
