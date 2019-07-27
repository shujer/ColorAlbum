function isType(obj, type) {
    return Object.prototype.toString.call(obj).includes(type)
}

class Event {
    constructor() {
        this.events = {}
    }
    on(name, callback) { 
        if(!isType(name, 'String') || !isType(callback, 'Function')) {
            return;
        }
        if(this.events[name]) {
            this.events[name].push(callback)
        } else {
            this.events[name] = [callback]
        }
    }
    emit(name, data) {
        if(!isType(name, 'String') || !this.events[name]) {
            return;
        }
        let callbacks = this.events[name];
        callbacks.forEach(callback => {
            callback(data)
        });
    }
    remove(name, callback) {
        if(!isType(name, 'String') || !this.events[name]) {
            return;
        }
        let callbacks = this.events[name];
        this.events[name] = callbacks.filter(call => call !== callback)
    }
}

module.exports = Event;