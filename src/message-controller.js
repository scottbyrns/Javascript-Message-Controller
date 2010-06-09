(function (className) {
	var MessageController = function () {
		this.messagePool = {};
		this.currentUID = 0;
	};
	MessageController.prototype = {
		addListener: function (group, callback) {
			this.currentUID += 1;
			var listener = {
				group: group,
				UID: this.currentUID,
				sendMessage: (function (that) {
					return function (message, channel) {
						that.sendMessage(this.group, message, channel);
					};
				})(this),
				destroy: (function (that) {
					return function () {
						that.removeListener(this);
					};
				})(this)
			};
			
			this.messagePool[group] = this.messagePool[group] || {};
			this.messagePool[group][listener.UID] = callback;
			return listener;
		},
		removeListener: function (listener) {
			try {
				delete this.messagePool[listener.group][listener.UID];
			}
			catch (e) {}
		},
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
	};
	window[className] = new MessageController();
})('MessageController');