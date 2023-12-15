<script setup>
    import { ref , onMounted , watchEffect } from 'vue';

    import { chatStore } from '../../store/chatStore';
    const chatStoreOn = chatStore();

    import { socket } from '../../socket';

    const chatRooms = ref([]);

    const emptyChatList = () => {
        if(chatStoreOn.userRemovedCookie){
            chatRooms.value = [];
        }
    }
    watchEffect(() => {
        emptyChatList();
    })

    onMounted(() => {
        socket.emit('show user chatRooms' , chatStoreOn.savedUsername);
    })

    socket.on('chat rooms' , (friendData => {
            chatRooms.value = friendData;
            chatStoreOn.allUnreadMsg = 0;
            friendData.forEach(friend => {
                chatStoreOn.allUnreadMsg += friend.unreadMsg;
            })
    }))

    socket.on('ask for chat rooms' , () => {
        console.log("ask for rooms");
        socket.emit('show user chatRooms' , chatStoreOn.savedUsername);
    })

</script>
<template>
        <p class="emptyListMsg" v-if="chatRooms.length == 0">your chat list is empty</p>
        <div class="flexCenter mainUserDiv" v-if="chatRooms.length !== 0" v-for="user in chatRooms" :key="user.username" @click="chatStoreOn.startChat(user)" :class="{'backgroundLight': chatStoreOn.currentChatWith == user.username && !chatStoreOn.darkMoodOn , 'backgroundDark': chatStoreOn.currentChatWith == user.username && chatStoreOn.darkMoodOn}" :title="user.username">
            <div class="flexCenter">
                <div class="userDiv">
                    <div class="flexCenter eachUser" :style="{'background-color' : user.bgColor}">
                        {{ chatStoreOn.firstLetter(user.username) }}
                    </div>
                </div>
                <p>{{ chatStoreOn.cutLongName(user.username) }}</p>
                <span class="status statusInChatRoom"></span>
            </div>
            <span class="flexCenter unreadMsg" :class="{'displayNone' : user.unreadMsg == 0}">{{ user.unreadMsg }}</span>
        </div>
</template>

<style scoped>
    .mainUserDiv{
        width: 100%;
        padding: .5rem;
        justify-content: space-between !important;
    }
    .mainUserDiv > div:first-child {
        justify-content: flex-start;
        gap: .5rem;
    }
    .statusInChatRoom{
        left: 10% !important;
    }
    .backgroundLight{
        background-color: rgba(253, 254, 255 , .5);
    }
    .backgroundDark{
        background-color: #2a2a34;
    }
</style>