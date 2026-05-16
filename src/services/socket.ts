import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initiateSocket = (chatId: string) => {
  socket = io(window.location.origin);
  if (socket && chatId) {
    socket.emit("join_chat", chatId);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const subscribeToChat = (callback: (err: any, msg: any) => void) => {
  if (!socket) return true;
  socket.on("receive_message", (msg) => {
    return callback(null, msg);
  });
};

export const sendMessage = (chatId: string, senderId: string, text: string) => {
  if (socket) {
    socket.emit("send_message", { chatId, senderId, text, timestamp: new Date() });
  }
};
