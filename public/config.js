// 143.42.165.77
// veggietunes.com

const config = {
    WEBSOCKET_URL: 'ws://localhost:3000', // Default to localhost for development
};

if (window.location.hostname !== 'localhost') {
    config.WEBSOCKET_URL = 'ws://143.42.165.77:3000'; // Replace with your server's IP or domain
}

export default config;
