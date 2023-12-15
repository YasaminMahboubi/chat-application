<script setup>
    import { ref } from 'vue';

    import { chatStore } from '../store/chatStore';
    const chatStoreOn = chatStore();

    import { socket } from '../socket';

    import showUser from './chatRoomsComponents/showUser.vue';
    import chatRooms from './chatRoomsComponents/chatRooms.vue';
    import usersInServer from './chatRoomsComponents/usersInServer.vue';
    import userFriends from './chatRoomsComponents/userFriends.vue';
    import displayChat from './chatRoomsComponents/displayChat.vue';

    const chatRoomOff = ref(true);
    const showUsersOff = ref(false);
    const showFriendsOff = ref(true);
    const settingOff = ref(true);
    let displayOPtions =  [chatRoomOff, showUsersOff, showFriendsOff, settingOff];
            
    const chatInactive = ref(true); 
    const showFriendsInactive = ref(true);
    const showUsersInactive = ref(false);
    const settingInactive = ref(true); 
    let inactiveIcons  =  [chatInactive,showFriendsInactive,showUsersInactive,settingInactive]

    const basicsBtnChanges = (description) => {
        chatStoreOn.descriptionOfOption = description;
        deactivator(displayOPtions);
        deactivator(inactiveIcons);
    }
    const deactivator = (array) => {
        array.forEach(arg => {
             arg.value = true;
        });
    };

    const showChat = () => {
        basicsBtnChanges('chat');
        chatRoomOff.value = false;
        chatInactive.value = false;
        socket.emit('show user chatRooms' , chatStoreOn.savedUsername);
    }

    const showFriends = () => {
        basicsBtnChanges('your friends');
        showFriendsOff.value = false;
        showFriendsInactive.value = false;
    }

    const showUserInServer = () => {
        basicsBtnChanges('online users');
        showUsersOff.value = false;
        showUsersInactive.value = false;
    }

    const changeTheme = (state) => {
        chatStoreOn.darkMoodOn = state == 'night' ? true : false;
        let cookie = {
            username: chatStoreOn.savedUsername,
            bgColor: chatStoreOn.userBackground,
            lastChatWith: chatStoreOn.currentChatWith,
            darkMoodOn:  chatStoreOn.darkMoodOn
        }
        chatStoreOn.setCookie(cookie);
    }

    const showDeleteUserReq = () => {
        chatStoreOn.deleteUserRequest = true;
    }

    socket.on('chat rooms' , (friendData => {
            chatStoreOn.allUnreadMsg = 0;
            friendData.forEach(friend => {
                chatStoreOn.allUnreadMsg += friend.unreadMsg;
            })
    }))

    
</script>

<template>
    <main :class="{'grayMain': chatStoreOn.darkMoodOn}">
        <div id="menu" class="sectionsShadow flexColumn" :class="{'grayBackground': chatStoreOn.darkMoodOn , 'grayBackgroundBoxShadow':chatStoreOn.darkMoodOn}">
            <div id="showUser" class="flexCenter headersBgColor" :class="{'lightGrayBackground': chatStoreOn.darkMoodOn}">
                <showUser></showUser>
            </div>
            <div id="options" class="flexColumn" :class="{'grayBackground': chatStoreOn.darkMoodOn}">
                <button @click="showChat">
                    <i class="fa-regular fa-comments" alt="chat" :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn , 'btnActive': !chatInactive && !chatStoreOn.darkMoodOn , 'darkBtnActive' : chatStoreOn.darkMoodOn && !chatInactive}"></i>
                </button>
                <span class="flexCenter unreadMsg allUnreadMsg" :class="{'allUnreadMsgDark' : chatStoreOn.darkMoodOn}" v-if="chatStoreOn.allUnreadMsg !== 0">{{ chatStoreOn.allUnreadMsg }}</span>
                <button @click="showFriends">
                    <i class="fa-solid fa-users" alt="friends" :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn , 'btnActive': !showFriendsInactive && !chatStoreOn.darkMoodOn , 'darkBtnActive' : chatStoreOn.darkMoodOn && !showFriendsInactive }"></i>
                </button>
                <button @click="showUserInServer">
                    <i class="fa-solid fa-user-plus" alt="users in server" :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn , 'btnActive': !showUsersInactive && !chatStoreOn.darkMoodOn , 'darkBtnActive' : chatStoreOn.darkMoodOn && !showUsersInactive }"></i>
                </button>
                <button>
                    <i class="fa-solid fa-moon " :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn , 'displayNone': chatStoreOn.darkMoodOn}" @click="changeTheme('night')"></i>
                    <i class="fa-solid fa-sun " :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn , 'displayNone' : !chatStoreOn.darkMoodOn}" @click="changeTheme('day')"></i>
                </button>
            </div>
            <div id="logOut" class="flexCenter" :class="{'icons': !chatStoreOn.darkMoodOn ,'darkIcons' : chatStoreOn.darkMoodOn}" @click="showDeleteUserReq">log out</div>

        </div>
        <div id="displayOptions" class="sectionsShadow flexColumn" :class="{'grayBackground': chatStoreOn.darkMoodOn , 'grayBackgroundBoxShadow':chatStoreOn.darkMoodOn}">
            <header class="flexCenter headersBgColor" :class="{'lightGrayBackground': chatStoreOn.darkMoodOn}">{{ chatStoreOn.descriptionOfOption }}</header>
            <div id="chatRooms" class="flexColumn" :class="{'displayNone': chatRoomOff}">
                <chatRooms></chatRooms>
            </div>
            <div id="userFriends" class="flexColumn showUsers" :class="{'displayNone': showFriendsOff}">
                <userFriends></userFriends>
            </div>
            <div id="usersInServer" class="flexColumn showUsers" :class="{'displayNone': showUsersOff}">
                <usersInServer></usersInServer>
            </div>
        </div>
        <div id="chat" class="flexColumn sectionsShadow" :class="{'grayBackgroundBoxShadow':chatStoreOn.darkMoodO , 'grayChatBackground': chatStoreOn.darkMoodOn}">
            <displayChat :class="{'displayNone': chatStoreOn.deleteRequest}"></displayChat>
        </div>
    </main>
</template>

<style scoped>
    main{
        overflow: hidden;
        padding: .5rem;
        padding-right: 0;
        gap: .3rem;
        display: grid;
        grid-template-areas: 'menu displayOptions chat';
        grid-template-columns: 7% 20% 73%;
        grid-template-rows: repeat(3 , 100%);
    }
    .sectionsShadow{
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
    }
    #menu{
        grid-area: menu;
        gap: .5rem;
        border-radius: .5rem;
        background-color:  #dbf2ff;
    }
    #showUser{
        width: 100%;
        height: 10% !important;
        border-radius: .5rem .5rem 0 0;
    }
    #options{
        width: 100%;
        height: 40%;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    #options > button{
        width: 90%;
        height: 20%;
        background-color: transparent;
    }
    #options > button > i{
        font-size: 1.5rem;
    }
    .icons{
        color: rgb(56, 89, 142) !important;
    }
    .icons:hover{
        color: #F75E56 !important;
    }
    #logOut{
        width: 100%;
        height: 100px;
        margin-top: 15rem;
        font-size: 1rem !important;
    }
    #displayOptions{
        grid-area: displayOptions;
        gap: 1.5rem;
        position: relative;
        border-radius: .5rem;
        background-color: #dbf2ff;
    }
    #displayOptions > header{
        width: 100%;
        height: 10% !important;
        justify-content: flex-start;
        font-size: 1.5rem;
        padding-left: 1rem;
        color: rgb(56, 89, 142);
        border-radius: .5rem .5rem 0 0;
    }
    #displayOptions > div {
        width: 100%;
        gap: .5rem;
        position: relative;
    }
    #chat{
        grid-area: chat;
        padding-right: .1rem;
        border-radius: .5rem;
        background-color: #DBF2FF;
    }
    main > div > div {
        width: 100%;
        border-radius: .5rem;
    }
    .showUsers{
        height: 40%;
        gap: 1rem;
        padding-left: 1rem;
    }
    .btnActive{
        color: #F75E56 !important;
    }
    .allUnreadMsg{
        top: 20%;
        margin-left: 4rem;
        position: absolute;
    }
</style>