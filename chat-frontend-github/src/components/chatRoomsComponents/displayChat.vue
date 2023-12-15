<script setup>
    import { ref , onMounted , watchEffect} from 'vue';
    import { socket } from '../../socket';

    const message = ref('');

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    const messagesArray = ref([]);
    const recipientData = ref({
        username: '',
        bgColor: ''
    });

    watchEffect(() => {
        if(chatStoreOn.userRemovedCookie){
            messagesArray.value = [];
        }
    })

    onMounted(() => {
        socket.on('chat' , (data) => {
            if(data !== ''){
                chatStoreOn.currentChatWith = data.resp.username;
                messagesArray.value = data.chatRoom;
                recipientData.value.username  = data.resp.username;
                recipientData.value.bgColor   = data.resp.bgColor;
            }else{
                chatStoreOn.currentChatWith = '';
                messagesArray.value = '';
                recipientData.value.username = '';
                recipientData.value.bgColor = '';
            }
        });
        socket.on('current chatRoom to delete' , (deletedUserName) => {
            if(deletedUserName == chatStoreOn.currentChatWith){
                socket.emit('delete chat' , chatStoreOn.savedUsername);
            }
        })
        socket.on('current chatRoom to send msg' , (userUsername) => {
            if(userUsername == chatStoreOn.currentChatWith){
                socket.emit('current chatRoom' , {username: chatStoreOn.savedUsername , senderUsername: userUsername});
            }else{
                socket.emit('increase unreadMsg' , userUsername);
            }
        })

    })
    const sendMsg = () => {
            if(message.value !== ''){
                socket.emit('private message' , {recipient: recipientData.value.username, message: message.value});
                message.value = '';
            }
    }
    
    const messageClasses = (message) => {
      const isCurrentUser = message.from === chatStoreOn.savedUsername;
      const isDarkMode    = chatStoreOn.darkMoodOn;

      return {
        'usersMsg': true,
        'speechBubblesShadow': true,
        'userMessages': isCurrentUser,
        'userMsgInChat': isCurrentUser,
        'unknownUserMessages': !isCurrentUser,
        'unknownUserMsgInChat': !isCurrentUser,
        'userMessagesDark': isCurrentUser && isDarkMode,
        'unknownUserDark': !isCurrentUser && isDarkMode
      };
    }

</script>
<template>
   <header class="flexCenter headersBgColor" :class="{'lightGrayBackground' : chatStoreOn.darkMoodOn}">
    <div class="userDiv flexCenter">
            <div class="flexCenter eachUser" :style="{'background-color' : recipientData.bgColor}">
                {{ chatStoreOn.firstLetter(recipientData.username) }}
            </div>
            <p>{{ recipientData.username }}</p>
            <span class="status" v-if="recipientData.username !== ''"></span>
        </div>
   </header>
   <section id="messages">
        <div v-if="messagesArray.length !== 0" v-for="message in messagesArray.slice().reverse()" :key="message.msg" 
        :class="messageClasses(message)">

            {{ message.msg }}

        </div>
   </section>
   <footer>
        <div class="flexCenter msgDiv" :class="{'msgDivDark': chatStoreOn.darkMoodOn}">
            <input type="text" placeholder="Enter your message" v-model="message" @keydown.enter="sendMsg" :class="{'lightGrayBackground' : chatStoreOn.darkMoodOn}">
            <button class="submitBtn sendMsg" @click="sendMsg"> send </button>
        </div>
   </footer>
</template>

<style scoped>
    .userMsgInChat{
        margin-left: 68%;
        border-radius: 20px 20px 0 20px;    
    }
    .unknownUserMsgInChat{
        border-radius: 20px 20px 20px 0;
    }
    header , #messages , footer{
        width: 100%;
    }
    header , footer{
        height: 10%;
    }
    header{
        padding-left: 1rem;
        justify-content: flex-start !important;
        border-top-left-radius: .5rem;
    }
    #messages{
        height: 80%;
        display: flex;
        flex-direction: column-reverse;
        gap: 1rem;
        padding: .5rem;
        overflow-y: auto;
        background-color: transparent;
    }
    #messages > div {
        width: 30%;
        padding: .5rem;
        word-wrap: break-word;
    }
</style>