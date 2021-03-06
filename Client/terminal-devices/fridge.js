let Client = require('./base-client');

//Services
const RAISE_TEMPERATURE = "RAISE_TEMPERATURE";
const LOWER_TEMPERATURE = "LOWER_TEMPERATURE";
const STATUS = "STATUS";
const TURN_ON = "TURN_ON";
const TURN_OFF = "TURN_OFF";


class Fridge extends Client {
    constructor(MAC, IP, port, name) {
        let MAC_prefix = "01:03";
        let regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!regex.test(MAC)) {
            throw new Error('Not a MAC Address');
        }
        if (!MAC.startsWith(MAC_prefix)) {
            throw new Error('MAC address does not corresponds to a Fridge device');
        }
        super(MAC, IP, port, name, (socket) => {
            this.temperature = 0;
            this.state = "on";
            this.milkRequests = 0;
            this.startServices(socket);
        });
    }

    getStatus() {
        return  {
            temperature: this.temperature,
            state: this.state,
            milkRequests: this.milkRequests,
            requestErrors: this.requestErrors,
            requestSuccesses: this.requestSuccesses
        }
    }

    startServices(socket) {
        //lets build the services

        socket.on(STATUS, (data) => {
            socket.emit(data.replyTo, {
                status: this.getStatus()
            });
        });

        socket.on(RAISE_TEMPERATURE, (data) => {
            this.temperature++;
            socket.emit(data.replyTo, {
                status: this.getStatus()
            });
        });

        socket.on(LOWER_TEMPERATURE, (data) => {
            this.temperature--;
            socket.emit(data.replyTo, {
                status: this.getStatus()
            });
        });

        socket.on(TURN_ON, (data) => {
            this.state = 'on';
            socket.emit(data.replyTo, {
                status: this.getStatus()
            });
        });

        socket.on(TURN_OFF, (data) => {
            this.state = 'off';
            socket.emit(data.replyTo, {
                status: this.getStatus()
            });
        });



        console.log(`MAC ${this.MAC}: has started its services`);
    }



    userBuyMilkOnlineRequest() {
        let request = {
            url: 'http:www.google.pt',
            requestID: this.latestRequestID ++
        };
        this.pendingRequest.push(request);
        this.milkRequests ++;
    }

}

module.exports = Fridge;
