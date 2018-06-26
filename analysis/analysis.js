/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        function Stack() {
            this.s = [];

            this.push = function(data) {
                this.s.push(data);
            };

            this.pop = function() {
                return this.s.pop();
            };

            this.top = function() {
                if (this.s.length === 0) {
                    return null;
                }

                return this.s[this.s.length - 1];
            };
        }

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
                        val[key].declarationEnclosingFunctionId = sandbox.RuntimeInfoTemp.functionsStack.top();
                    }

                    val[key] = addDeclarationFunctionIdToFunctionsInsideObject(val[key]);
                }
            }

            return val;
        }

        sandbox.RuntimeInfo = {
            functions: {}
        };

        sandbox.RuntimeInfoTemp = {
            functionsStack: new Stack(),
            mapCallbacksDeclarations: {},
            mapShadowIds: {},
            mapMethodIdentifierInteractions: {},
            mapMethodCalls: {}
        };

        this.functionEnter = function (iid, f) {
            if (f.randomIdentifier in sandbox.RuntimeInfoTemp.mapCallbacksDeclarations) {
                var fIid = sandbox.RuntimeInfoTemp.mapCallbacksDeclarations[f.randomIdentifier];
                sandbox.RuntimeInfoTemp.functionsStack.push(fIid);
            } else {
                sandbox.RuntimeInfoTemp.functionsStack.push(iid);
            }
        };

        this.functionExit = function () {
            sandbox.RuntimeInfoTemp.functionsStack.pop();
        };

        this.declare = function (iid, name, val, isArgument, argumentIndex) {
            if (argumentIndex >= 0 && isArgument === true && sandbox.RuntimeInfoTemp.functionsStack.top()) {
                var functionIid = sandbox.RuntimeInfoTemp.functionsStack.top();
                var functionContainer = sandbox.RuntimeInfo.functions[functionIid];

                if (functionContainer) {
                    var argumentContainer = new sandbox.Constructors.ArgumentContainer(argumentIndex, name);
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
                val.declarationEnclosingFunctionId = sandbox.RuntimeInfoTemp.functionsStack.top();
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
                if (typeof args[argIndex] == "function") {
                    var randomIdentifier = getRandomIdentifier();

                    args[argIndex].randomIdentifier = randomIdentifier;

                    var lastFunctionIid = sandbox.RuntimeInfoTemp.functionsStack.top();

                    if (lastFunctionIid) {
                        sandbox.RuntimeInfoTemp.mapCallbacksDeclarations[randomIdentifier] = lastFunctionIid;
                    }

                }
            }

            if (functionIid && !(functionIid in sandbox.RuntimeInfo.functions)) {
                var functionContainer = new sandbox.Constructors.FunctionContainer(functionIid, functionName);
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
                val.declarationEnclosingFunctionId = sandbox.RuntimeInfoTemp.functionsStack.top();
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