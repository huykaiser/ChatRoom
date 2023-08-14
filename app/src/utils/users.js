let userList = [
    {
        id: "1",
        username: "Huy Kaiser",
        room: "fe02"
    },
    {
        id: "2",
        username: "Jun Naive",
        room: "fe01"
    },
];

const addUser = (newUser) => {
    userList = [...userList, newUser];
};

const getUserList = (room) => userList.filter((user) => user.room === room);

const removeUser = (id) => (userList = userList.filter((user) => user.id !== id));

const findUser = (id) => userList.find((user) => user.id === id);


module.exports = {
    getUserList,
    addUser,
    removeUser,
    findUser
};
