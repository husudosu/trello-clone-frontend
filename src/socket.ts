import SocketIO from 'socket.io-client';

const options = { withCredentials: true, debug: true };

// export const socket = new VueSocketIO({
//     debug: true,
//     connection: SocketIO(process.env.VUE_APP_SOCKET_SERVER, options)
// });

export const useSocketIO = () => {
    const socket = SocketIO(process.env.VUE_APP_SOCKET_SERVER + "/board", options);
    return {
        socket,
    };
};