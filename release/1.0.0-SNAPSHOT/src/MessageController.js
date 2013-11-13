
com.scottbyrns["MessageController"].MessageController({
		
	setup: function () {},
	constructor: function () {

        /**
         * Object to store the message handlers.
         * @property
         */
        this.messagePool = {};
        /**
         * Unique ID counter
         * @property
         */
        this.currentUID = 0;
		
    },
	
	prototype: {
		
            /**
             * Add an event listener
             * @param {String} group Listener group to add the callback to.
             * @param {Function} callback callback to register to a listener group.
             */
            addListener: function (group, callback) {
                    this.currentUID += 1;
                    var listener = {
                            group: group,
                            UID: this.currentUID,
                            sendMessage: (function (that) {
                                    return function (message, channel) {
                                            return that.sendMessage(this.group, message, channel);
                                    };
                            })(this),
                            destroy: (function (that) {
                                    return function () {
                                            return that.removeListener(this);
                                    };
                            })(this)
                    };

                    this.messagePool[group] = this.messagePool[group] || {};
                    this.messagePool[group][listener.UID] = callback;
                    return listener;
            },
			
            /**
             * Remove a registered callback
             * @param {Listener} listener Listener resource object
             */
            removeListener: function (listener) {
                    try {
                            delete this.messagePool[listener.group][listener.UID];
                    }
                    catch (e) {}
            },
			
            /**
             * Send a message to a listener group.
             * @param {String} group Listener group reference by name
             * @param {Any} message Message to be send to the specified listener group
             * @param {String} channel Message channel to allow listener callback to filter messages
             * targeted at specific listeners.
             */
            sendMessage: function (group, message, channel) {
                    var messageGroup = this.messagePool[group],
                    exceptions = [];
                    for (callback in messageGroup) {
                            if (messageGroup.hasOwnProperty(callback)) {
                                    try {
                                            messageGroup[callback](message, channel);
                                    }
                                    catch (e) {
                                            exceptions.push({
                                                    message: 'Callback failed for' + callback,
                                                    exception: e
                                            });
                                    }
                            }
                    }
                    return exceptions;
            }
        }
	
});
