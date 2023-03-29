const config = {
    WEBSOCKET_URL: 'ws://localhost:3000', // Default to localhost for development
};

if (window.location.hostname !== 'localhost') {
    config.WEBSOCKET_URL = 'ws://veggietunes.com:3000'; // Replace with your server's IP or domain
}

export default config;
