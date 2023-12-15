<script setup>
    import { ref , watchEffect } from 'vue';

    import { chatStore } from '../store/chatStore';
    const chatStoreOn = chatStore();

    import { socket } from '@/socket';

    const username = ref('');
    const pageLoadedWelcome = ref(false);
    const pageLoadedDescription = ref(false);
    const userSendUsernameMsg = ref(false);
    const welcomeUsername = ref(false);
    let msgArray = [pageLoadedWelcome,pageLoadedDescription,userSendUsernameMsg,welcomeUsername];

    const handleUserRemovedCookie = () => {
        if (chatStoreOn.userRemovedCookie) {
            msgArray.forEach(msg => {
            msg.value = false;
            });
        }
    }

    const handleExistingCookie = () => {
        if (!chatStoreOn.existingCookie) {
            pageLoadedWelcome.value = true;
            chatStoreOn.playNotification();
            setTimeout(() => {
                pageLoadedDescription.value = true;
                chatStoreOn.playNotification();
            }, 1500);
        }
    }

    watchEffect(() => {
        handleUserRemovedCookie();
        handleExistingCookie();
    });

    const addUsername = () => {
        chatStoreOn.savedUsername = username.value;

        let bgColor = chatStoreOn.generateBackgroundColor();
        chatStoreOn.userBackground = bgColor;

        let userCookie = {
            username: chatStoreOn.savedUsername,
            bgColor: bgColor,
            darkMoodOn: false,
        }

        socket.emit('add user', userCookie);
        chatStoreOn.setCookie(userCookie);

        chatStoreOn.playNotification();
        userSendUsernameMsg.value = true;

        setTimeout(() => {
            chatStoreOn.playNotification();
            welcomeUsername.value = true;
        }, 1200);
        username.value = "";
    }

</script>
<template>
    <main class="flexCenter">
       <div class="flexColumn">
           <div id="displayMsg" class="flexColumn">
                <button id="oldMsgSimulation" class="userMsg userMessages msg speechBubblesShadow"></button>

                <button :class="{'displayBubbles': pageLoadedWelcome}" class="unknownUsersMsg unknownUserMessages msg speechBubblesShadow">welcome</button>
                <button :class="{'displayBubbles': pageLoadedDescription}" class="unknownUsersMsg unknownUserMessages msg speechBubblesShadow">
                    Enter your name to start talking to your friends
                </button>
                <button :class="{'displayBubbles' : userSendUsernameMsg}" class="userMsg userMessages msg speechBubblesShadow">my name is {{ chatStoreOn.savedUsername }}</button>
                <button :class="{'displayBubbles': welcomeUsername }" class="unknownUsersMsg unknownUserMessages msg speechBubblesShadow">welcome {{ chatStoreOn.savedUsername }}</button>
            </div>

            <div class="flexCenter msgDiv">
                <input type="text" placeholder="Enter your username" v-model="username" @keydown.enter="addUsername">
                <button class="submitBtn" @click="addUsername"> add </button>
            </div>
       </div>
    </main>
</template>

<style scoped>
    main{
        background-color: #fcfcfc;
    }
    main > div{
        width: 50%;
        height: 80%;
        justify-content: space-between;
        background-color: #DBF2FF;
        border-radius: 0 0 1.5rem 1.5rem;
    }
    main > div > div {
        width: 100%;
    }
    #displayMsg{
        gap: 1rem;
        overflow: auto;
    }
    button:not(.submitBtn){
        width: 35%;
        font-size: 1.2rem;
    }
    #oldMsgSimulation{
        opacity: 1;
    }
    .msg{
        opacity: 0;
        padding: 1rem;
        text-wrap: wrap;
    }
    .userMsg{
        margin-left: 62%;
        border-radius: 100px 100px 0 100px;
    }
    .unknownUsersMsg{
        border-radius: 100px 100px 100px 0;
    }
    .displayBubbles{
        opacity: 1;
        animation: showMessageAnimation 3s;
    }
</style>

