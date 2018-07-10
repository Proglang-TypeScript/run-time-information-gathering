/* global J$ */
/* global require */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        var sMemoryInterface = new (require("../utils/sMemoryInterface.js")).SMemoryInterface(sandbox.smemory);

        var getTypeOf = require("../utils/getTypeOf.js").getTypeOf;
        var getDeclarationEnclosingFunctionIdRequire = require("../utils/getDeclarationEnclosingFunctionId.js").getDeclarationEnclosingFunctionId;
        var getRandomIdentifier = require("../utils/getRandomIdentifier.js").getRandomIdentifier;

        function getShadowIdOfObject(obj) {
            return sMemoryInterface.getShadowIdOfObject(obj);
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

        var argumentContainerFinder = new (require("../utils/argumentContainerFinder.js")).ArgumentContainerFinder(
            sandbox.RuntimeInfo.functions,
            sandbox.RuntimeInfoTemp.mapShadowIds
        );

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
            ),
            invokeFunPre: new (require("./callbacks/invokeFunPre.js")).InvokeFunPre(
                sandbox.RuntimeInfo.functions,
                sandbox.RuntimeInfoTemp.functionsExecutionStack,
                sandbox.RuntimeInfoTemp.mapMethodIdentifierInteractions,
                sMemoryInterface,
                argumentContainerFinder
            ),
            getFieldPre: new (require("./callbacks/getFieldPre.js")).GetFieldPre(
                sandbox.RuntimeInfoTemp.functionsExecutionStack,
                sandbox.RuntimeInfoTemp.mapMethodIdentifierInteractions,
                sMemoryInterface,
                argumentContainerFinder
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
            return callbacks.invokeFunPre.runCallback(
                iid,
                f,
                base,
                args,
                isConstructor,
                isMethod,
                functionIid
            );
        };

        this.getFieldPre = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
        ) {
            return callbacks.getFieldPre.runCallback(
                iid,
                base,
                offset,
                isComputed,
                isOpAssign,
                isMethodCall
            );
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

                var argumentContainer = argumentContainerFinder.findArgumentContainer(shadowId, functionIid);

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