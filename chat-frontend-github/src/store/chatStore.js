import { defineStore } from "pinia";
import { socket } from "../socket";

export const chatStore  = defineStore('displays' ,  {
    state: () => {
        return {
            userRemovedCookie: false,
            darkMoodOn: false, 
            existingCookie: false,
            savedUsername: '',
            expDate: 'Tue, 30 Nov 2123 21:10:49 GMT',
            destroyCookieDate: 'Thu, 01 Jan 1970 21:10:49 GMT',

            descriptionOfOption: 'online users',
            
            showSendBtn: false,
            startChat: false,
            userFriends: [],
            usersInServer: [],
            userBackground: '',

            sendRequest: false,
            receiveRequest: false,
            deleteRequest: false,
            deleteUserRequest: false,

            userToRequest: {
                username: '',
                bgColor: ''
            },
            requestFromUser: {
                username: '',
                bgColor: ''
            },
            recipient:{
                username: '',
                bgColor: ''
            },
            deleteFriend:{
                username: '',
                bgColor: ''
            },
            noRecipientActive: true,
            currentChatWith: '',
            allUnreadMsg: 0,
        }
    },
    actions: {
        playNotification(){
            if(!this.existingCookie){
                const audio = new Audio('/audios/notification.mp3'); 
                audio.play();
            }
        },
        setCookie(arg){
                document.cookie = 'user=' +  JSON.stringify(arg)+';expires= ' + this.expDate;
                setTimeout(() => {
                    this.existingCookie = true;
                }, 3300);
        },
        destroyCookie(){
            document.cookie = 'user= "";expires= ' + this.destroyCookieDate;
            this.userRemovedCookie = true;
            this.existingCookie = false;
        },
        generateBackgroundColor(){
            return `rgb(${Array.from({ length: 3 }, () => Math.floor(Math.random() * 128)).join(',')})`;
        },
        firstLetter(username){
            if(username !== undefined && username !== ''){
                return username.split('')[0].toUpperCase();
            }
        },
        startChat(recipient) {
            let cookie = {
                username : this.savedUsername,
                bgColor  : this.userBackground,
                lastChatWith : recipient.username
            }
            this.setCookie(cookie);
            socket.emit('start chat', recipient.username);
            this.showChat = true;
            this.userRemovedCookie = false;
        },
        cutLongName(username){
            return username.substring(0,5) + '...';
        },
    }
})