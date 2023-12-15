<script setup>
  import { onMounted } from 'vue';

  import { chatStore } from './store/chatStore';
  const chatStoreOn = chatStore();

  import { socket } from '@/socket';

  import landingPage from './components/landingPage.vue';
  import home from './components/home.vue';
  import sendRequestMsg from './components/requestComponents/sendRequestMsg.vue';
  import receiveRequestMsg from './components/requestComponents/receiveRequestMsg.vue'
  import deleteFriendRequest from './components/requestComponents/deleteFriendRequest.vue'
  import deleteUserRequest from './components/requestComponents/deleteUserRequest.vue'
  

    onMounted(() => {
      let cookie = document.cookie.split('=');
      if(cookie[0] == 'user'){
        let userObjFromCookie = JSON.parse(cookie[1]);

        chatStoreOn.savedUsername = userObjFromCookie.username;
        chatStoreOn.userBackground = userObjFromCookie.bgColor;
        chatStoreOn.darkMoodOn = userObjFromCookie.darkMoodOn;

        socket.emit('existing cookie' , chatStoreOn.savedUsername );

        if(userObjFromCookie.lastChatWith && userObjFromCookie.lastChatWith !== ''){
          socket.emit('show last chat' , {user: userObjFromCookie.username , lastChatWith: userObjFromCookie.lastChatWith});
          chatStoreOn.recipient = userObjFromCookie.lastChatWith;
          chatStoreOn.noRecipientActive = false;
        }
        chatStoreOn.existingCookie = true;
      }
    })

    socket.on('request' , (data) => {
      chatStoreOn.requestFromUser = data;
      chatStoreOn.receiveRequest = true;
    });

    socket.on('friend Log out' , (username) => {
      if(chatStoreOn.currentChatWith == username){
        let cookie = {
          username: chatStoreOn.savedUsername,
          bgColor: chatStoreOn.userBackground,
          lastChatWith: '',
          darkMoodOn : chatStoreOn.darkMoodOn
        }
        chatStoreOn.setCookie(cookie);
        chatStoreOn.currentChatWith = '';
        window.location.href = 'http://localhost:5173';
      }
    })

</script>

<template >
  <landingPage v-show="!chatStoreOn.existingCookie"></landingPage>
  <home        v-show="chatStoreOn.existingCookie"></home>
  <sendRequestMsg      v-if="chatStoreOn.sendRequest"></sendRequestMsg>
  <receiveRequestMsg   v-if="chatStoreOn.receiveRequest"></receiveRequestMsg>
  <deleteFriendRequest v-if="chatStoreOn.deleteRequest"></deleteFriendRequest>
  <deleteUserRequest   v-if="chatStoreOn.deleteUserRequest"></deleteUserRequest>
</template>