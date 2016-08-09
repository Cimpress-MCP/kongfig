'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.consumerAclSchema = exports.consumerCredentialSchema = undefined;
exports.getSupportedCredentials = getSupportedCredentials;
exports.getCredentialSchema = getCredentialSchema;
exports.getAclSchema = getAclSchema;
exports.apis = apis;
exports.plugins = plugins;
exports.consumers = consumers;
exports.credentials = credentials;
exports.acls = acls;

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _kongState = require('./kongState');

var _kongState2 = _interopRequireDefault(_kongState);

var _utils = require('./utils');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var consumerCredentialSchema = exports.consumerCredentialSchema = {
    oauth2: {
        id: 'client_id'
    },
    'key-auth': {
        id: 'key'
    },
    'jwt': {
        id: 'key'
    },
    'basic-auth': {
        id: 'username'
    },
    'hmac-auth': {
        id: 'username'
    }
};

var consumerAclSchema = exports.consumerAclSchema = {
    id: 'group'
};

function getSupportedCredentials() {
    return Object.keys(consumerCredentialSchema);
}

function getCredentialSchema(name) {
    if (false === consumerCredentialSchema.hasOwnProperty(name)) {
        throw new Error('Unknown credential "' + name + '"');
    }

    return consumerCredentialSchema[name];
}

function getAclSchema() {
    return consumerAclSchema;
}

exports.default = (function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(config, adminApi) {
        var actions;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        actions = [].concat(_toConsumableArray(apis(config.apis)), _toConsumableArray(consumers(config.consumers)));
                        return _context.abrupt('return', actions.map(_bindWorldState(adminApi)).reduce(function (promise, action) {
                            return promise.then(_executeActionOnApi(action, adminApi));
                        }, Promise.resolve('')));

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    function execute(_x, _x2) {
        return ref.apply(this, arguments);
    }

    return execute;
})();

function apis() {
    var apis = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return apis.reduce(function (actions, api) {
        return [].concat(_toConsumableArray(actions), [_api(api)], _toConsumableArray(_apiPlugins(api)));
    }, []);
};

function plugins(apiName, plugins) {
    return plugins.reduce(function (actions, plugin) {
        return [].concat(_toConsumableArray(actions), [_plugin(apiName, plugin)]);
    }, []);
}

function consumers() {
    var consumers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    return consumers.reduce(function (calls, consumer) {
        return [].concat(_toConsumableArray(calls), [_consumer(consumer)], _toConsumableArray(_consumerCredentials(consumer)), _toConsumableArray(_consumerAcls(consumer)));
    }, []);
}

function credentials(username, credentials) {
    return credentials.reduce(function (actions, credential) {
        return [].concat(_toConsumableArray(actions), [_consumerCredential(username, credential)]);
    }, []);
}

function acls(username, acls) {
    return acls.reduce(function (actions, acl) {
        return [].concat(_toConsumableArray(actions), [_consumerAcl(username, acl)]);
    }, []);
}

function _executeActionOnApi(action, adminApi) {
    var _this = this;

    return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var params;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return action();

                    case 2:
                        params = _context2.sent;

                        if (!params.noop) {
                            _context2.next = 5;
                            break;
                        }

                        return _context2.abrupt('return', Promise.resolve('No-op'));

                    case 5:
                        return _context2.abrupt('return', adminApi.requestEndpoint(params.endpoint, params).then(function (response) {
                            console.info('\n' + params.method.blue, response.ok ? ('' + response.status).bold.green : ('' + response.status).bold.red, adminApi.router(params.endpoint).blue, "\n", params.body ? params.body : '');

                            if (!response.ok) {
                                if (params.endpoint.name == 'consumer' && params.method == 'DELETE') {
                                    console.log('Bug in Kong throws error, Consumer has still been removed will continue'.bold.green);

                                    return response;
                                }

                                return response.text().then(function (content) {
                                    throw new Error(response.statusText + '\n' + content);
                                });
                            } else {
                                response.text().then(function (content) {
                                    console.info(('Response status ' + response.statusText + ':').green, "\n", JSON.parse(content));
                                });
                            }

                            return response;
                        }));

                    case 6:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, _this);
    }));
}

function _bindWorldState(adminApi) {
    var _this2 = this;

    return function (f) {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            var state;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return (0, _kongState2.default)(adminApi);

                        case 2:
                            state = _context3.sent;
                            return _context3.abrupt('return', f(_createWorld(state)));

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this2);
        }));
    };
}

function _createWorld(_ref) {
    var apis = _ref.apis;
    var consumers = _ref.consumers;

    var world = {
        hasApi: function hasApi(apiName) {
            return apis.some(function (api) {
                return api.name === apiName;
            });
        },
        getApi: function getApi(apiName) {
            var api = apis.find(function (api) {
                return api.name === apiName;
            });

            if (!api) {
                throw new Error('Unable to find api ' + apiName);
            }

            return api;
        },
        getPlugin: function getPlugin(apiName, pluginName) {
            var plugin = world.getApi(apiName).plugins.find(function (plugin) {
                return plugin.name == pluginName;
            });

            if (!plugin) {
                throw new Error('Unable to find plugin ' + pluginName);
            }

            return plugin;
        },
        getPluginId: function getPluginId(apiName, pluginName) {
            return world.getPlugin(apiName, pluginName).id;
        },
        getPluginAttributes: function getPluginAttributes(apiName, pluginName) {
            return world.getPlugin(apiName, pluginName).config;
        },
        hasPlugin: function hasPlugin(apiName, pluginName) {
            return apis.some(function (api) {
                return api.name === apiName && api.plugins.some(function (plugin) {
                    return plugin.name == pluginName;
                });
            });
        },
        hasConsumer: function hasConsumer(username) {
            return consumers.some(function (consumer) {
                return consumer.username === username;
            });
        },
        hasConsumerCredential: function hasConsumerCredential(username, name, attributes) {
            var schema = getCredentialSchema(name);

            return consumers.some(function (c) {
                return c.username === username && c.credentials[name].some(function (oa) {
                    return oa[schema.id] == attributes[schema.id];
                });
            });
        },
        hasConsumerAcl: function hasConsumerAcl(username, groupName) {
            var schema = getAclSchema();

            return consumers.some(function (consumer) {
                if(typeof consumer.acls == 'undefined'){
                  return;
                }
                return consumer.acls.some(function (acl) {
                    return consumer.username === username && acl[schema.id] == groupName;
                });
            });
        },

        getConsumerCredential: function getConsumerCredential(username, name, attributes) {
            var consumer = consumers.find(function (c) {
                return c.username === username;
            });

            if (!consumer) {
                throw new Error('Unable to find consumer ' + username);
            }

            var credential = extractCredentialId(consumer.credentials, name, attributes);

            if (!credential) {
                throw new Error('Unable to find credential');
            }

            return credential;
        },

        getConsumerAcl: function getConsumerAcl(username, groupName) {
            var consumer = consumers.find(function (c) {
                return c.username === username;
            });

            if (!consumer) {
                throw new Error('Unable to find consumer ' + username);
            }

            var acl = extractAclId(consumer.acls, groupName);

            if (!acl) {
                throw new Error('Unable to find acl');
            }

            return acl;
        },

        getConsumerCredentialId: function getConsumerCredentialId(username, name, attributes) {
            return world.getConsumerCredential(username, name, attributes).id;
        },

        getConsumerAclId: function getConsumerAclId(username, groupName) {
            return world.getConsumerAcl(username, groupName).id;
        },

        isApiUpToDate: function isApiUpToDate(api) {
            var current = world.getApi(api.name);

            var different = Object.keys(api.attributes).filter(function (key) {
                return api.attributes[key] !== current[key];
            });

            return different.length == 0;
        },

        isApiPluginUpToDate: function isApiPluginUpToDate(apiName, plugin) {
            if (false == plugin.hasOwnProperty('attributes')) {
                // of a plugin has no attributes, and its been added then it is up to date
                return true;
            }

            var diff = function diff(a, b) {
                return Object.keys(a).filter(function (key) {
                    return JSON.stringify(a[key]) !== JSON.stringify(b[key]);
                });
            };

            var current = world.getPlugin(apiName, plugin.name);

            var _normalizeAttributes = (0, _utils.normalize)(plugin.attributes);

            var config = _normalizeAttributes.config;

            var rest = _objectWithoutProperties(_normalizeAttributes, ['config']);

            return diff(config, current.config).length === 0 && diff(rest, current).length === 0;
        },

        isConsumerCredentialUpToDate: function isConsumerCredentialUpToDate(username, credential) {
            var current = world.getConsumerCredential(username, credential.name, credential.attributes);

            var different = Object.keys(credential.attributes).filter(function (key) {
                return JSON.stringify(credential.attributes[key]) !== JSON.stringify(current[key]);
            });

            return different.length === 0;
        }
    };

    return world;
}

function extractCredentialId(credentials, name, attributes) {
    var idName = getCredentialSchema(name).id;

    return credentials[name].find(function (x) {
        return x[idName] == attributes[idName];
    });
}

function extractAclId(acls, groupName) {
    var idName = getAclSchema().id;
    return acls.find(function (x) {
        return x[idName] == groupName;
    });
}

function _api(api) {
    validateEnsure(api.ensure);
    validateApiRequiredAttributes(api);

    return function (world) {
        if (api.ensure == 'removed') {
            return world.hasApi(api.name) ? (0, _actions.removeApi)(api.name) : (0, _actions.noop)();
        }

        if (world.hasApi(api.name)) {
            if (world.isApiUpToDate(api)) {
                console.log("api", ('' + api.name).bold, "is up-to-date");

                return (0, _actions.noop)();
            }

            return (0, _actions.updateApi)(api.name, api.attributes);
        }

        return (0, _actions.createApi)(api.name, api.attributes);
    };
}

function _apiPlugins(api) {
    return api.plugins && api.ensure != 'removed' ? plugins(api.name, api.plugins) : [];
}

function validateEnsure(ensure) {
    if (!ensure) {
        return;
    }

    if (['removed', 'present'].indexOf(ensure) === -1) {
        throw new Error('Invalid ensure "' + ensure + '"');
    }
}

function validateApiRequiredAttributes(api) {
    if (false == api.hasOwnProperty('attributes')) {
        throw Error('"' + api.name + '" api has to declare "upstream_url" attribute');
    }

    if (false == api.attributes.hasOwnProperty('upstream_url')) {
        throw Error('"' + api.name + '" api has to declare "upstream_url" attribute');
    }
}

function _plugin(apiName, plugin) {
    validateEnsure(plugin.ensure);

    return function (world) {
        if (plugin.ensure == 'removed') {
            if (world.hasPlugin(apiName, plugin.name)) {
                return (0, _actions.removeApiPlugin)(apiName, world.getPluginId(apiName, plugin.name));
            }

            return (0, _actions.noop)();
        }

        if (world.hasPlugin(apiName, plugin.name)) {
            if (world.isApiPluginUpToDate(apiName, plugin)) {
                console.log("  - plugin", ('' + plugin.name).bold, "is up-to-date".green);

                return (0, _actions.noop)();
            }

            return (0, _actions.updateApiPlugin)(apiName, world.getPluginId(apiName, plugin.name), plugin.attributes);
        }

        return (0, _actions.addApiPlugin)(apiName, plugin.name, plugin.attributes);
    };
}

function _consumer(consumer) {
    validateEnsure(consumer.ensure);
    validateConsumer(consumer);

    return function (world) {
        if (consumer.ensure == 'removed') {
            if (world.hasConsumer(consumer.username)) {
                return (0, _actions.removeConsumer)(consumer.username);
            }

            return (0, _actions.noop)();
        }

        if (!world.hasConsumer(consumer.username)) {
            return (0, _actions.createConsumer)(consumer.username);
        }

        console.log("consumer", ('' + consumer.username).bold);

        return (0, _actions.noop)();
    };

    var _credentials = [];

    if (consumer.credentials && consumer.ensure != 'removed') {
        _credentials = consumerCredentials(consumer.username, consumer.credentials);
    }

    var _acls = [];

    if (consumer.acls && consumer.ensure != 'removed') {
        _acls = consumerAcls(consumer.username, consumer.acls);
    }

    return [consumerAction].concat(_toConsumableArray(_credentials), _toConsumableArray(_acls));
}

function validateConsumer(_ref2) {
    var username = _ref2.username;

    if (!username) {
        throw new Error("Consumer username must be specified");
    }
}

function _consumerCredentials(consumer) {
    if (!consumer.credentials || consumer.ensure == 'removed') {
        return [];
    }

    return credentials(consumer.username, consumer.credentials);
}

function _consumerCredential(username, credential) {
    validateEnsure(credential.ensure);
    validateCredentialRequiredAttributes(credential);

    return function (world) {
        if (credential.ensure == 'removed') {
            if (world.hasConsumerCredential(username, credential.name, credential.attributes)) {
                var credentialId = world.getConsumerCredentialId(username, credential.name, credential.attributes);

                return (0, _actions.removeConsumerCredentials)(username, credential.name, credentialId);
            }

            return (0, _actions.noop)();
        }

        if (world.hasConsumerCredential(username, credential.name, credential.attributes)) {
            var _credentialId = world.getConsumerCredentialId(username, credential.name, credential.attributes);

            if (world.isConsumerCredentialUpToDate(username, credential)) {
                var credentialIdName = getCredentialSchema(credential.name).id;
                console.log("  - credential", ('' + credential.name).bold, 'with ' + credentialIdName + ':', ('' + credential.attributes[credentialIdName]).bold, "is up-to-date".green);

                return (0, _actions.noop)();
            }

            return (0, _actions.updateConsumerCredentials)(username, credential.name, _credentialId, credential.attributes);
        }

        return (0, _actions.addConsumerCredentials)(username, credential.name, credential.attributes);
    };
}

function validateCredentialRequiredAttributes(credential) {
    var credentialIdName = getCredentialSchema(credential.name).id;

    if (false == credential.hasOwnProperty('attributes')) {
        throw Error(credential.name + ' has to declare attributes.' + credentialIdName);
    }

    if (false == credential.attributes.hasOwnProperty(credentialIdName)) {
        throw Error(credential.name + ' has to declare attributes.' + credentialIdName);
    }
}

function validateAclRequiredAttributes(acl) {
    var aclIdName = getAclSchema().id;

    if (false == acl.hasOwnProperty(aclIdName)) {
        throw Error('ACLs has to declare property ' + aclIdName);
    }
}

function _consumerAcls(consumer) {
    if (!consumer.acls || consumer.ensure == 'removed') {
        return [];
    }

    return acls(consumer.username, consumer.acls);
}

function _consumerAcl(username, acl) {

    validateEnsure(acl.ensure);
    validateAclRequiredAttributes(acl);

    return function (world) {
        if (acl.ensure == 'removed') {
            if (world.hasConsumerAcl(username, acl.group)) {
                var aclId = world.getConsumerAclId(username, acl.group);

                return (0, _actions.removeConsumerAcls)(username, aclId);
            }

            return (0, _actions.noop)();
        }

        if (world.hasConsumerAcl(username, acl.group)) {
            return (0, _actions.noop)();
        }

        return (0, _actions.addConsumerAcls)(username, acl.group);
    };
}
