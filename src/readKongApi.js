'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _kongState = require('./kongState');

var _kongState2 = _interopRequireDefault(_kongState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

exports.default = (function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(adminApi) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', Promise.all([(0, _kongState2.default)(adminApi), adminApi.fetchPluginSchemas()]).then(function (_ref) {
                            var _ref2 = _slicedToArray(_ref, 2);

                            var state = _ref2[0];
                            var schemas = _ref2[1];

                            var prepareConfig = function prepareConfig(plugin, config) {
                                return stripConfig(config, schemas.get(plugin));
                            };
                            var parseApiPluginsForSchemes = function parseApiPluginsForSchemes(plugins) {
                                return parseApiPlugins(plugins, prepareConfig);
                            };

                            return {
                                apis: parseApis(state.apis, parseApiPluginsForSchemes),
                                consumers: parseConsumers(state.consumers)
                            };
                        }));

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return ref.apply(this, arguments);
    };
})();

function parseConsumers(consumers) {
    return consumers.map(function (_ref3) {
        var username = _ref3.username;
        var credentials = _ref3.credentials;
        var acls = _ref3.acls;

        //console.dir(credentials);
        //console.log("=== parseConsumers: " + JSON.stringify(credentials));
        // for(var x in consumers){
        //   console.log("Property: " + x);
        // }
        // console.log(Object.keys(credentials));

        var _info = _objectWithoutProperties(_ref3, ['username', 'credentials', 'acls']);
        return {
            username: username,
            _info: _info,
            acls: typeof acls == 'undefined' ? undefined : acls.map(function (_ref4) {
                var group = _ref4.group;

                var _info = _objectWithoutProperties(_ref4, ['group']);

                return { group: group, _info: _info };
            }),
            credentials: zip(Object.keys(credentials), Object.values(credentials)).map(parseCredential).reduce(function (acc, x) {
                return acc.concat(x);
            }, [])
        };
    });
}

function zip(a, b) {
    return a.map(function (n, index) {
        return [n, b[index]];
    });
}

function parseCredential(_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var credentialName = _ref6[0];
    var credentials = _ref6[1];
    //console.log("== : " + credentialName + " " + credentials);

    return typeof credentials == 'undefined' ? [] : credentials.map(function (_ref7) {
        var consumer_id = _ref7.consumer_id;
        var id = _ref7.id;
        var created_at = _ref7.created_at;

        var attributes = _objectWithoutProperties(_ref7, ['consumer_id', 'id', 'created_at']);
        if(attributes.algorithm && attributes.algorithm === "RS256") {
          console.log(consumer_id);
          console.log(id);
        }

        return {
            name: credentialName,
            attributes: attributes,
            _info: { id: id, consumer_id: consumer_id, created_at: created_at }
        };
    });
}

function parseApis(apis, parseApiPlugins) {
    return apis.map(function (_ref8) {
        var name = _ref8.name;
        var plugins = _ref8.plugins;
        var request_host = _ref8.request_host;
        var request_path = _ref8.request_path;
        var strip_request_path = _ref8.strip_request_path;
        var preserve_host = _ref8.preserve_host;
        var upstream_url = _ref8.upstream_url;
        var id = _ref8.id;
        var created_at = _ref8.created_at;

        return {
            name: name,
            plugins: parseApiPlugins(plugins),
            attributes: {
                request_host: request_host,
                request_path: request_path,
                strip_request_path: strip_request_path,
                preserve_host: preserve_host,
                upstream_url: upstream_url
            },
            _info: {
                id: id,
                created_at: created_at
            }
        };
    });
}

function parseApiPlugins(plugins, prepareConfig) {
    return plugins.map(function (_ref9) {
        var name = _ref9.name;
        var config = _ref9.config;
        var id = _ref9.id;
        var api_id = _ref9.api_id;
        var consumer_id = _ref9.consumer_id;
        var enabled = _ref9.enabled;
        var created_at = _ref9.created_at;

        return {
            name: name,
            attributes: {
                config: prepareConfig(name, config)
            },
            _info: {
                id: id,
                //api_id,
                consumer_id: consumer_id,
                enabled: enabled,
                created_at: created_at
            }
        };
    });
}

function stripConfig(config, schema) {
    var mutableConfig = _extends({}, config);

    if (false) {
        // strip default keys
        Object.keys(config).map(function (key) {
            if (schema[key].hasOwnProperty('default') && schema[key].default === config[key]) {
                delete mutableConfig[key];
            }
        });
    }

    // remove some cache values
    delete mutableConfig['_key_der_cache'];
    delete mutableConfig['_cert_der_cache'];

    return mutableConfig;
}
