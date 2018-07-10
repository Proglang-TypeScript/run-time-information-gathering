/* global J$ */
/* global require */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        var FunctionContainer = require("../utils/functionContainer.js").FunctionContainer;
        var sMemoryInterface = new (require("../utils/sMemoryInterface.js")).SMemoryInterface(sandbox.smemory);

        var getTypeOf = require("../utils/getTypeOf.js").getTypeOf;
        var getHashForShadowIdAndFunctionIid = require("../utils/getHashForShadowIdAndFunctionIid.js").getHashForShadowIdAndFunctionIid;
        var getDeclarationEnclosingFunctionIdRequire = require("../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;

        function getRandomIdentifier() {
            var now = new Date();
            return Math.floor((Math.random() * 1000) + 1).toString() + now.getTime();
        }

        function getShadowIdOfObject(obj) {
            return sMemoryInterface.getShadowIdOfObject(obj);
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
            return getDeclarationEnclosingFunctionIdRequire(sandbox.RuntimeInfoTemp.functionsExecutionStack);
        }

        sandbox.RuntimeInfo = {
            functions: {}
        };

        sandbox.RuntimeInfoTemp = {
            functionsExecutionStack: new (require("../utils/functionsExecutionStack.js")).FunctionsExecutionStack(),
            mapShadowIds: {},
            mapMethodIdentifierInteractions: {},
            mapMethodCalls: {}
        };

        var callbacks = {
            functionEnter: new (require("./callbacks/functionEnter.js")).FunctionEnter(
                sandbox.RuntimeInfo.functions,
                sandbox.RuntimeInfoTemp.functionsExecutionStack
            ),
            functionExit: new (require("./callbacks/functionExit.js")).FunctionExit(
                sandbox.RuntimeInfoTemp.functionsExecutionStack
            ),
            declare: new (require("./callbacks/declare.js")).Declare(
                sandbox.RuntimeInfo.functions,
                sandbox.RuntimeInfoTemp.functionsExecutionStack,
                sandbox.RuntimeInfoTemp.mapShadowIds,
                sMemoryInterface
            )
        };

        this.functionEnter = function(iid, f) {
            return callbacks.functionEnter.runCallback(iid, f);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            return callbacks.functionExit.runCallback(iid, returnVal, wrappedExceptionVal);
        };

        this.declare = function(iid, name, val, isArgument, argumentIndex) {
            return callbacks.declare.runCallback(iid, name, val, isArgument, argumentIndex);
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
                    var currentActiveFiid = sandbox.RuntimeInfoTemp.functionsExecutionStack.getCurrentExecutingFunction();
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
            var functionIid = sandbox.RuntimeInfoTemp.functionsExecutionStack.getCurrentExecutingFunction();
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
            var functionIid = sandbox.RuntimeInfoTemp.functionsExecutionStack.getCurrentExecutingFunction();
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