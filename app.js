const express = require('express');
const app = express();

const cors = require('cors');

const http = require('http');
const server = http.createServer(app);

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { Server } = require('socket.io');
const io = new Server(server , {
    cors: {
        origin: 'http://localhost:5173', 
      }
});

const fs = require('fs');
const path = require('path');

const userFile = path.join(__dirname , 'users.json');
const chatRoomFile = path.join(__dirname , 'chatrooms.json');

const findUser = (jsonUsers , searchKey , value) => {
    let user = searchKey == 'id' ? jsonUsers.users.find(user => user.userId == value) : jsonUsers.users.find(user => user.username == value);
    return user;
}

const returnUserObject = (arrayOfUser) => {
        return arrayOfUser.map(user => ({
            username: user.username,
            bgColor: user.bgColor,
            unreadMsg: user.unreadMsg ? user.unreadMsg : 0
        }))
}
const userFriendsName = (jsonUsers , userUsername) => {
    let user = jsonUsers.users.find(user => user.username == userUsername);
    let userFriendsName = [];
    user.friends.forEach(friend => {
        userFriendsName.push(friend.name);
    })
    return userFriendsName;
}

const usersInServer = (jsonUsers , userFriendsName , userUsername) => {
    let notFriendData = jsonUsers.users.filter(user => userFriendsName.indexOf(user.username) == -1 && user.username !== userUsername);
    notFriendData = returnUserObject(notFriendData);
    return notFriendData;
}
const userFriends = (jsonUsers , userFriendsName ,  userUsername) => {
    let user = jsonUsers.users.find(user => user.username == userUsername);
    let userFriends = jsonUsers.users.filter(user => userFriendsName.indexOf(user.username) !== -1 && user.username !== userUsername);

    userFriends.forEach(friend => {
        friend.unreadMsg = user.friends.find(user => user.name == friend.username).unreadMsg;
    })

    userFriends = returnUserObject(userFriends);

    return userFriends;
}

const chatRoomKey = (senderName , recipientName) => {
    return new RegExp(`^(${senderName}\/${recipientName}|${recipientName}\/${senderName})$`);
}

const findChatRoom = (jsonChatRooms , sender , recipient) => {
    if(recipient !== ''){
        const keyPattern = chatRoomKey(sender.username , recipient.username);
        let chatRoom = jsonChatRooms.chatRooms.find(chatRoom => keyPattern.test(chatRoom.key));
        return chatRoom;
    }else{
        let chatRooms = jsonChatRooms.chatRooms.filter(chatRoom => chatRoom.key.includes(sender.username));
        return chatRooms;
    }
}

const createChatRoom = (jsonChatRoom , sender , recipient) => {
    let chatRoomData = {
        id :  jsonChatRoom.id,
        key: sender.username+'/'+recipient.username,
        messages: []
    }
    jsonChatRoom.id++;
    jsonChatRoom.chatRooms.push(chatRoomData);
    fs.writeFile(chatRoomFile , JSON.stringify(jsonChatRoom) , (err) => {
        if(err){
            console.error(err);
            return;
        }
    });
    return chatRoomData;
}

io.on('connection' , (socket) => {
    console.log("user is connected");

    socket.on('existing cookie' , (usernameFromCookie) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            let oldUser = findUser(jsonUsers , 'username' , usernameFromCookie);
            oldUser.userId = socket.id;
            fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                if(err){
                    console.error(err);
                    return;
                }
            })
            if(oldUser.friends.length !== 0){
                let oldUserFriendsName = userFriendsName(jsonUsers, oldUser.username);
                let usersInServerToShow = usersInServer(jsonUsers , oldUserFriendsName , oldUser.username);
                socket.emit('show all users' , usersInServerToShow);
                let userFriendsToShow = userFriends(jsonUsers,oldUserFriendsName,oldUser.username)
                socket.emit('user friends' , userFriendsToShow);
            }
            else{
                let users = returnUserObject(jsonUsers.users);
                socket.emit('show all users' , users);
            }
        })
    })

    socket.on('add user' , (userData) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            let userExist = findUser(jsonUsers , 'username' , userData.username);
            if(userExist){
                socket.emit('username exist' , 'username already exist!');
            }else{
                let user = {
                    userId   : socket.id,
                    username : userData.username,
                    bgColor  : userData.bgColor,
                    friends  : [],
                }
                jsonUsers.users.push(user);
                fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                })
                console.log("welcome " + userData.username);
                let usersInServer = returnUserObject(jsonUsers.users);
                io.emit('show all users' , usersInServer);
            }
        })
    })

    socket.on('show last chat' , (userInLastChat) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            fs.readFile(chatRoomFile , 'utf-8' , (err , data) => {
                if(err){
                    console.error(err);
                    return;
                }
                let jsonChatRoom = JSON.parse(data);

                let user = findUser(jsonUsers , 'username' , userInLastChat.user);
                let lastChatWith = findUser(jsonUsers , 'username' , userInLastChat.lastChatWith)

                let chatRoom = findChatRoom(jsonChatRoom , user , lastChatWith);
                if(chatRoom){
                    socket.emit('chat' , {chatRoom: chatRoom.messages , resp: {username: lastChatWith.username, bgColor: lastChatWith.bgColor}});
                }
            })
        })
    })

    socket.on('friendship request' , (userData) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            let reqTo = findUser(jsonUsers , 'username' , userData.reqTo);
            let reqFrom = findUser(jsonUsers , 'username' , userData.reqFrom);
            socket.to(reqTo.userId).emit('request' , {username: reqFrom.username, bgColor: reqFrom.bgColor});
        })
        
    })

    socket.on('accept request' , (usersData) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);

            let acceptedUser = findUser(jsonUsers , 'username' , usersData.acceptedUser.username);
            acceptedUser.friends.push({name: usersData.acceptedReqFrom, unreadMsg: 0});
            
            let acceptReqFrom = findUser(jsonUsers , 'username' , usersData.acceptedReqFrom);
            acceptReqFrom.friends.push({name: usersData.acceptedUser.username , unreadMsg: 0});

            fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                if(err){
                    console.error(err);
                    return;
                }
                let friendsNameReqSender  = userFriendsName(jsonUsers , acceptedUser.username);
                let friendsNameReqRecipient  = userFriendsName(jsonUsers , acceptReqFrom.username);
    
                let acceptedUserFriends    = userFriends(jsonUsers , friendsNameReqSender , acceptedUser.username);
    
                let userAcceptedReqFriends = userFriends(jsonUsers , friendsNameReqRecipient , acceptReqFrom.username);
    
                let serverUserForReqSender = usersInServer(jsonUsers , friendsNameReqSender , acceptedUser.username);
    
                let serverUserForReqRecipient = usersInServer(jsonUsers , friendsNameReqRecipient , acceptReqFrom.username);
    
                socket.to(acceptedUser.userId).emit('show all users' , serverUserForReqSender);
                socket.to(acceptedUser.userId).emit('user friends' ,  acceptedUserFriends);
        
                socket.emit('show all users',  serverUserForReqRecipient);
                socket.emit('user friends',  userAcceptedReqFriends);
            })
        })
    })

    socket.on('start chat' , (recipient) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            fs.readFile(chatRoomFile , 'utf-8' , (err , data) => {
                if(err){
                    console.error(err);
                    return;
                }
                let jsonChatRoom = JSON.parse(data);
                let chatRooms  = jsonChatRoom.chatRooms;

                let sender =  findUser(jsonUsers , 'id' , socket.id);
                let recipientObj = findUser(jsonUsers , 'username' , recipient);

                let recipientInFriendList = sender.friends.find(friend => friend.name == recipientObj.username);
                recipientInFriendList.unreadMsg = 0;
                socket.emit('chat rooms' , sender.friends);

                fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    let userFriendsForChatRoom = userFriends(jsonUsers , userFriendsName(jsonUsers , sender.username) , sender.username);
                socket.emit('chat rooms' , userFriendsForChatRoom);

                if(chatRooms.length !== 0){
                    let chatRoomExist = findChatRoom(jsonChatRoom , sender , recipientObj);
                    if(chatRoomExist){
                        socket.emit('chat' , {chatRoom: chatRoomExist.messages , resp: {username: recipientObj.username, bgColor: recipientObj.bgColor}})
                    }else{
                        let chatRoomData = createChatRoom(jsonChatRoom , sender , recipientObj);
                        socket.emit('chat' , {chatRoom: chatRoomData.messages , resp: {username: recipientObj.username, bgColor: recipientObj.bgColor}});
                    }
                }else{
                    let chatRoomData = createChatRoom(jsonChatRoom , sender , recipientObj);
                    socket.emit('chat' , {chatRoom: chatRoomData.messages , resp: {username: recipientObj.username, bgColor: recipientObj.bgColor}});
                }
                })
                
            })
        })

    })

    socket.on('private message' , (msgData) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);

            let sender =  findUser(jsonUsers , 'id' , socket.id);
            let recipientObj = findUser(jsonUsers , 'username' , msgData.recipient);

            fs.readFile(chatRoomFile , 'utf-8' , (err , data) => {
                if(err){
                    console.error(err);
                    return;
                }
                let jsonChatRoom = JSON.parse(data);

                let chatRoom = findChatRoom(jsonChatRoom , sender , recipientObj);

                let newMessage = {
                    from: sender.username,
                    to: recipientObj.username,
                    msg: msgData.message
                };
                chatRoom.messages.push(newMessage);

                fs.writeFile(chatRoomFile , JSON.stringify(jsonChatRoom) , (err) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    socket.emit('chat' , {chatRoom: chatRoom.messages , resp: {username: recipientObj.username, bgColor: recipientObj.bgColor}});
                    socket.to(recipientObj.userId).emit('current chatRoom to send msg' , sender.username);
                })
            })
        })
    })

    socket.on('current chatRoom' , (usersData) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);

            let user = findUser(jsonUsers , 'username' , usersData.username);
            let sender = findUser(jsonUsers , 'username' , usersData.senderUsername);

            fs.readFile(chatRoomFile ,  'utf-8' , (err , data) => {
                if(err){
                    console.error(err);
                    return;
                }
                let jsonChatRoom = JSON.parse(data);
                let chatRoom = findChatRoom(jsonChatRoom , user , sender);
                socket.emit('chat' , {chatRoom: chatRoom.messages , resp: {username: sender.username, bgColor: sender.bgColor}});
            })
            
        })
    })
    socket.on('increase unreadMsg' , (username) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);
            let user = findUser(jsonUsers , 'id' , socket.id);
            let friend = user.friends.find(friend => friend.name == username);
            friend.unreadMsg++;

            fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err)=> {
                if(err){
                   console.error(err);
                   return;
                }
                let userFriendsData = userFriends(jsonUsers , userFriendsName(jsonUsers , user.username) , user.username);
                socket.emit('chat rooms' , userFriendsData);
            })
          
        })
    })

    socket.on('show user chatRooms' , (username) => {
        if(username){
            fs.readFile(userFile , 'utf-8' , (err , data) => {
                if(err){
                    console.error(err);
                    return;
                }
                let jsonUsers = JSON.parse(data);
                let user = findUser(jsonUsers , 'username' , username);
    
                fs.readFile(chatRoomFile ,  'utf-8' , (err , data) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    let jsonChatRoom = JSON.parse(data);
                    if(jsonChatRoom.chatRooms.length !== 0){
                        let chatRooms = findChatRoom(jsonChatRoom , user , '');
                        let userFriendsName = [];
                        chatRooms.forEach(chatRoom => {
                            userFriendsName.push(chatRoom.key.split('/').find(user => user !== username));
                        })
                    let userFriendsData = userFriends(jsonUsers , userFriendsName , user.username);
                    socket.emit('chat rooms' , userFriendsData);
                    }
                })
            })
        }
        
    })

    socket.on('delete friend' , (deletedFriend) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);

            let user   = findUser(jsonUsers , 'id' , socket.id);
            let friend = findUser(jsonUsers , 'username' , deletedFriend.username);

            user.friends   =  user.friends.filter(friend => friend.name !== deletedFriend.username);
            friend.friends =  friend.friends.filter(userFriend => userFriend.name !== user.username);

            fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                if(err){
                    console.error(err);
                    return;
                }

                fs.readFile(chatRoomFile , 'utf-8' , (err , data) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    let jsonChatRoom = JSON.parse(data);

                    const keyPattern = chatRoomKey(user.username , deletedFriend.username);

                    jsonChatRoom.chatRooms = jsonChatRoom.chatRooms.filter(chatRoom => !keyPattern.test(chatRoom.key));

                    fs.writeFile(chatRoomFile , JSON.stringify(jsonChatRoom) , (err) => {
                        if(err){
                            console.error(err);
                            return;
                        }
                        let userFriendsData   = userFriends(jsonUsers , userFriendsName(jsonUsers , user.username) , user.username);
                        let friendFriendsData = userFriends(jsonUsers , userFriendsName(jsonUsers , friend.username) , friend.username);

                        let serverUserForUser   = usersInServer(jsonUsers , userFriendsName(jsonUsers , user.username) , user.username);
                        let serverUserForFriend = usersInServer(jsonUsers , userFriendsName(jsonUsers , friend.username) , friend.username)

                        if(deletedFriend.emitChat){
                            socket.emit('chat' , '');
                        }

                        socket.emit('user friends' , userFriendsData);
                        socket.emit('show all users', serverUserForUser)
                
                        socket.to(friend.userId).emit('user friends' , friendFriendsData);
                        socket.to(friend.userId).emit('show all users' , serverUserForFriend);
                
                        socket.to(friend.userId).emit('current chatRoom to delete', user.username);
                    })
                })
            })

           
            
        })
    })

    socket.on('delete chat' , (username) => {
        socket.emit('chat' , '');
    })

    socket.on('delete user' , (username) => {
        fs.readFile(userFile , 'utf-8' , (err , data) => {
            if(err){
                console.error(err);
                return;
            }
            let jsonUsers = JSON.parse(data);

            let user = findUser(jsonUsers , 'username' , username);

            let userFriends = userFriendsName(jsonUsers , username);

            let userFriendsArray = [];
            userFriends.forEach(friend => {
                let userFriend  = jsonUsers.users.find(user => user.username == friend);
                userFriend.friends = userFriend.friends.filter(friendName => friendName.name !== user.username)
                userFriendsArray.push(userFriend);
                jsonUsers.users = jsonUsers.users.filter(user => user.username !== friend)
            })

            userFriendsArray.forEach(userFriend => {
                jsonUsers.users.push(userFriend)
            })

            let updatedUsers = jsonUsers.users.filter(user => user.username !== username);
            jsonUsers.users = updatedUsers;

            socket.broadcast.emit('friend Log out' , username)
            fs.writeFile(userFile , JSON.stringify(jsonUsers) , (err) => {
                if(err){
                    console.error(err);
                    return;
                }
                fs.readFile(chatRoomFile ,  'utf-8' , (err , data) => {
                    if(err){
                        console.error(err);
                        return;
                    }
                    let jsonChatRoom = JSON.parse(data);
                    let findUserChatRooms = findChatRoom(jsonChatRoom , user , '');
    
                    findUserChatRooms.forEach(chatRoom => {
                        jsonChatRoom.chatRooms = jsonChatRoom.chatRooms.filter(chatRoomInJson => chatRoomInJson !== chatRoom);
                    })
                    fs.writeFile(chatRoomFile , JSON.stringify(jsonChatRoom) , (err) => {
                        if(err){
                            console.error(err);
                            return;
                        }
                    })
                    jsonUsers.users.forEach(user => {
                        let usersInServerData = usersInServer(jsonUsers , userFriendsName(jsonUsers , user.username) , user.username);
                        socket.to(user.userId).emit('show all users' , usersInServerData);
                        socket.to(user.userId).emit('ask for chat rooms' , true);
                    })
                })
            })
        })
    })
})
server.listen('3000' , () => {
    console.log("server is running on port 3000");
})