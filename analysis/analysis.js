/* global J$ */
/* global require */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        function getTypeOf(val) {
            if (val === null) {
                return "null";
            }

            if (typeof val === "object" && val instanceof Array) {
                return "array";
            }

            return typeof val;
        }

        function getRandomIdentifier() {
            var now = new Date();
            return Math.floor((Math.random() * 1000) + 1).toString() + now.getTime();
        }

        function getShadowIdOfObject(obj) {
            if (getTypeOf(obj) !== "object") {
                return null;
            }

            var shadowObj = sandbox.smemory.getShadowObjectOfObject(obj);
            return sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj);
        }

        function getHashForShadowIdAndFunctionIid(shadowId, functionIid) {
            return shadowId + " - " + functionIid;
        }

        function getArgumentContainer(shadowId, functionIid) {
            var fIid = functionIid;
            var argumentContainer = sandbox.RuntimeInfoTemp.mapShadowIds[
                getHashForShadowIdAndFunctionIid(shadowId, fIid)
            ];

            var functionContainer = null;
            while(!argumentContainer && fIid) {
                functionContainer = sandbox.RuntimeInfo.functions[fIid];

                argumentContainer = sandbox.RuntimeInfoTemp.mapShadowIds[
                    getHashForShadowIdAndFunctionIid(shadowId, fIid)
                ];

                if (!functionContainer) {
                    fIid = null;
                } else {
                    fIid = functionContainer.declarationEnclosingFunctionId;
                }
            }

            return argumentContainer;
        }

        function addDeclarationFunctionIdToFunctionsInsideObject(val) {
            if (getTypeOf(val) == "object") {
                for (var key in val) {
                    if (getTypeOf(val[key]) == "function") {
                        val[key].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
                    }

                    val[key] = addDeclarationFunctionIdToFunctionsInsideObject(val[key]);
                }
            }

            return val;
        }

        function getDeclarationEnclosingFunctionId() {
            if (sandbox.RuntimeInfoTemp.functionsStack.isEmpty()) {
                return -1;
            }

            return sandbox.RuntimeInfoTemp.functionsStack.top();
        }

        sandbox.RuntimeInfo = {
            functions: {}
        };

        var Stack = require("../utils/stack.js").Stack;
        var FunctionContainer = require("../utils/functionContainer.js").FunctionContainer;
        var ArgumentContainer = require("../utils/argumentContainer.js").ArgumentContainer;

        sandbox.RuntimeInfoTemp = {
            functionsStack: new Stack(),
            mapShadowIds: {},
            mapMethodIdentifierInteractions: {},
            mapMethodCalls: {}
        };

        this.functionEnter = function (iid, f) {
            if (iid && !(iid in sandbox.RuntimeInfo.functions)) {
                var functionContainer = new FunctionContainer(iid, f.name);
                functionContainer.iid = iid;
                functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;

                sandbox.RuntimeInfo.functions[iid] = functionContainer;
            }

            sandbox.RuntimeInfoTemp.functionsStack.push(iid);
        };

        this.functionExit = function () {
            sandbox.RuntimeInfoTemp.functionsStack.pop();
        };

        this.declare = function (iid, name, val, isArgument, argumentIndex) {
            if (argumentIndex >= 0 && isArgument === true && sandbox.RuntimeInfoTemp.functionsStack.top()) {
                var functionIid = sandbox.RuntimeInfoTemp.functionsStack.top();
                var functionContainer = sandbox.RuntimeInfo.functions[functionIid];

                if (functionContainer) {
                    var argumentContainer = new ArgumentContainer(argumentIndex, name);
                    argumentContainer.shadowId = getShadowIdOfObject(val);

                    var inputValueInteraction = {
                        code: "inputValue",
                        typeof: getTypeOf(val)
                    };

                    argumentContainer.addInteraction(inputValueInteraction);
                    functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

                    if (argumentContainer.shadowId) {
                        sandbox.RuntimeInfoTemp.mapShadowIds[
                            getHashForShadowIdAndFunctionIid(
                                argumentContainer.shadowId,
                                functionIid
                            )
                        ] = functionContainer.getArgumentContainer(argumentIndex);
                    }
                }
            }

            if (typeof val == "function") {
                val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
            }

            return {
                result: val
            };
        };

        this.invokeFunPre = function(
            iid,
            f,
            base,
            args,
            isConstructor,
            isMethod,
            functionIid
        ) {
            var functionName = f.name;

            if (f.methodName) {
                functionName = f.methodName;
            }

            if (f.methodIdentifier in sandbox.RuntimeInfoTemp.mapMethodIdentifierInteractions) {
                var interaction = sandbox.RuntimeInfoTemp.mapMethodIdentifierInteractions[f.methodIdentifier];
                interaction.functionIid = functionIid;
            }

            for (var argIndex in args) {
                if (getTypeOf(args[argIndex]) == "function") {
                    if (!args[argIndex].declarationEnclosingFunctionId) {
                        args[argIndex].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
                    }
                }

                if (getTypeOf(args[argIndex]) == "object") {
                    var currentActiveFiid = sandbox.RuntimeInfoTemp.functionsStack.top();
                    var shadowId = getShadowIdOfObject(args[argIndex]);

                    var argumentContainer = getArgumentContainer(shadowId, currentActiveFiid);
                    if (currentActiveFiid && argumentContainer) {
                        var usedAsArgumentInteraction = {
                            code: 'usedAsArgument',
                            enclosingFunctionId: currentActiveFiid,
                            targetFunctionId: functionIid,
                            argumentIndexInTargetFunction: argIndex
                        };

                        argumentContainer.addInteraction(usedAsArgumentInteraction);
                    }
                }
            }

            if (functionIid && !(functionIid in sandbox.RuntimeInfo.functions)) {
                var functionContainer = new FunctionContainer(functionIid, functionName);
                functionContainer.iid = iid;
                functionContainer.isConstructor = isConstructor;
                functionContainer.isMethod = isMethod;
                functionContainer.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;

                sandbox.RuntimeInfo.functions[functionIid] = functionContainer;
            }

            return {
                f: f,
                base: base,
                args: args,
                skip: false
            };
        };

        this.getFieldPre = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
        ) {
            var functionIid = sandbox.RuntimeInfoTemp.functionsStack.top();
            var shadowId = getShadowIdOfObject(base);

            var argumentContainer = getArgumentContainer(shadowId, functionIid);

            var interaction = {};

            if (isMethodCall === true) {
                base[offset].methodName = offset;
            }

            if (functionIid && argumentContainer) {
                if (isMethodCall === false) {
                    interaction = {
                        code: 'getField',
                        field: offset,
                        isComputed: isComputed,
                        isOpAssign: isOpAssign,
                        isMethodCall: isMethodCall,
                        enclosingFunctionId: functionIid
                    };
                } else {
                    interaction = {
                        code: 'methodCall',
                        methodName: offset,
                        isComputed: isComputed,
                        isOpAssign: isOpAssign,
                        isMethodCall: isMethodCall,
                        functionIid: null,
                        enclosingFunctionId: functionIid
                    };

                    var randomIdentifier = getRandomIdentifier();
                    base[offset].methodIdentifier = randomIdentifier;
                    sandbox.RuntimeInfoTemp.mapMethodIdentifierInteractions[randomIdentifier] = interaction;
                }

                argumentContainer.addInteraction(interaction);
            }

            return {
                skip: false,
                base: base,
                offset: offset
            };
        };

        this.putFieldPre = function (iid, base, offset, val, isComputed, isOpAssign) {
            var functionIid = sandbox.RuntimeInfoTemp.functionsStack.top();
            if (getTypeOf(val) == "function") {
                val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId();
            } else {
                val = addDeclarationFunctionIdToFunctionsInsideObject(val);
            }

            if (functionIid) {
                var shadowId = getShadowIdOfObject(base);

                var argumentContainer = getArgumentContainer(shadowId, functionIid);

                if (argumentContainer) {
                    if (offset !== undefined) {
                        var putFieldInteraction = {
                            code: 'setField',
                            field: offset,
                            typeof: getTypeOf(val),
                            isComputed: isComputed,
                            isOpAssign: isOpAssign,
                            enclosingFunctionId: functionIid
                        };

                        argumentContainer.addInteraction(putFieldInteraction);
                    }
                }
            }

            return {
                base: base,
                offset: offset,
                val: val,
                skip: false
            };
        };

        this.write = function (iid, name, val) {
            val = addDeclarationFunctionIdToFunctionsInsideObject(val);

            return {
                result: val
            };
        };

        this.endExecution = function() {
            console.log(JSON.stringify(sandbox.RuntimeInfo.functions, null, 4));
        };
    }

    sandbox.analysis = new Analysis();
}(J$));