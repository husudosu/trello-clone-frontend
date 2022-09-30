import VueSocketIO from 'vue-3-socket.io';
import SocketIO from 'socket.io-client';

const options = { withCredentials: true };

export const socket = new VueSocketIO({
    debug: true,
    connection: SocketIO(process.env.VUE_APP_SOCKET_SERVER, options)
});