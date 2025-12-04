import mqtt from 'mqtt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brokerUrl = 'mqtts://172.236.95.200:8883';

// Read the CA certificate
const caPath = path.join(__dirname, '../../certs/mqtt-ca.crt');
const ca = fs.readFileSync(caPath);

const options = {
    username: 'admin',
    password: 'admin123',
    ca: ca,
    rejectUnauthorized: true // Now we can properly verify with our CA certificate
};

// The prompt says "Protocol: MQTT + TLS", which is mqtts.
// "TLS Mode: CA signed server certificate" implies we don't need client certs, just trust the server.

let client;

try {
    client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
    });

    client.on('error', (err) => {
        console.error('MQTT connection error:', err);
    });
} catch (error) {
    console.error('Failed to initialize MQTT client:', error);
}

export const publishTripUpdate = (tripData) => {
    if (client && client.connected) {
        const topic = 'trip_update';
        const message = JSON.stringify(tripData);
        client.publish(topic, message, (err) => {
            if (err) {
                console.error('Failed to publish trip update:', err);
            } else {
                console.log(`Published trip update to ${topic}`);
            }
        });
    } else {
        console.warn('MQTT client not connected. Skipping publish.');
    }
};
