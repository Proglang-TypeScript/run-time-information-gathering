/*
 Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>
 Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
 Copyright (C) 2012-2013 Michael Ficarra <escodegen.copyright@michael.ficarra.me>
 Copyright (C) 2012-2013 Mathias Bynens <mathias@qiwi.be>
 Copyright (C) 2013 Irakli Gozalishvili <rfobic@gmail.com>
 Copyright (C) 2012 Robert Gust-Bardon <donate@robert.gust-bardon.org>
 Copyright (C) 2012 John Freeman <jfreeman08@gmail.com>
 Copyright (C) 2011-2012 Ariya Hidayat <ariya.hidayat@gmail.com>
 Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
 Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
 Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function (global) {

    'use strict';

    var isArray,
        json,
        renumber,
        hexadecimal,
        quotes,
        escapeless,
        parentheses,
        semicolons,
        safeConcatenation,
        directive,
        extra,
        parse,
        FORMAT_MINIFY,
        FORMAT_DEFAULTS;

    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportBatchSpecifier: 'ExportBatchSpecifier',
        ExportDeclaration: 'ExportDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        ForOfStatement: 'ForOfStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        GeneratorExpression: 'GeneratorExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportSpecifier: 'ImportSpecifier',
        ImportDeclaration: 'ImportDeclaration',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MethodDefinition: 'MethodDefinition',
        ModuleDeclaration: 'ModuleDeclaration',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    var Precedence = {
        Sequence: 0,
        Yield: 1,
        Assignment: 1,
        Conditional: 2,
        ArrowFunction: 2,
        LogicalOR: 3,
        LogicalAND: 4,
        BitwiseOR: 5,
        BitwiseXOR: 6,
        BitwiseAND: 7,
        Equality: 8,
        Relational: 9,
        BitwiseSHIFT: 10,
        Additive: 11,
        Multiplicative: 12,
        Unary: 13,
        Postfix: 14,
        Call: 15,
        New: 16,
        TaggedTemplate: 17,
        Member: 18,
        Primary: 19
    };

    var BinaryPrecedence = {
        '||': Precedence.LogicalOR,
        '&&': Precedence.LogicalAND,
        '|': Precedence.BitwiseOR,
        '^': Precedence.BitwiseXOR,
        '&': Precedence.BitwiseAND,
        '==': Precedence.Equality,
        '!=': Precedence.Equality,
        '===': Precedence.Equality,
        '!==': Precedence.Equality,
        'is': Precedence.Equality,
        'isnt': Precedence.Equality,
        '<': Precedence.Relational,
        '>': Precedence.Relational,
        '<=': Precedence.Relational,
        '>=': Precedence.Relational,
        'in': Precedence.Relational,
        'instanceof': Precedence.Relational,
        '<<': Precedence.BitwiseSHIFT,
        '>>': Precedence.BitwiseSHIFT,
        '>>>': Precedence.BitwiseSHIFT,
        '+': Precedence.Additive,
        '-': Precedence.Additive,
        '*': Precedence.Multiplicative,
        '%': Precedence.Multiplicative,
        '/': Precedence.Multiplicative
    };

    function getDefaultOptions() {
        // default options
        return {
            indent: null,
            base: null,
            parse: null,
            format: {
                indent: {
                    style: '    ',
                    base: 0
                },
                newline: '\n',
                space: ' ',
                json: false,
                renumber: false,
                hexadecimal: false,
                quotes: 'single',
                escapeless: false,
                compact: false,
                parentheses: true,
                semicolons: true,
                safeConcatenation: false
            },
            directive: false,
            raw: true,
            verbatim: null
        };
    }

//-------------------------------------------------===------------------------------------------------------
//                                            Lexical utils
//-------------------------------------------------===------------------------------------------------------

//Const
    var NON_ASCII_WHITESPACES = [
        0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
        0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000,
        0xFEFF
    ];

//Regular expressions
    var NON_ASCII_IDENTIFIER_CHARACTERS_REGEXP = new RegExp(
        '[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376' +
        '\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-' +
        '\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA' +
        '\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-' +
        '\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0\u08A2-\u08AC\u08E4-\u08FE\u0900-' +
        '\u0963\u0966-\u096F\u0971-\u0977\u0979-\u097F\u0981-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-' +
        '\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-' +
        '\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38' +
        '\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83' +
        '\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9' +
        '\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-' +
        '\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-' +
        '\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E' +
        '\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-' +
        '\u0BEF\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D-\u0C44\u0C46-' +
        '\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C82\u0C83\u0C85-\u0C8C\u0C8E-' +
        '\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE' +
        '\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44' +
        '\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-' +
        '\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E01-\u0E3A' +
        '\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-' +
        '\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9' +
        '\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84' +
        '\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-' +
        '\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5' +
        '\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-' +
        '\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F0\u1700-\u170C\u170E-' +
        '\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD' +
        '\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191C\u1920-\u192B' +
        '\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E' +
        '\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-' +
        '\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1D00-\u1DE6\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-' +
        '\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-' +
        '\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F' +
        '\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115' +
        '\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188' +
        '\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-' +
        '\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-' +
        '\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A' +
        '\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5' +
        '\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA697' +
        '\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA827\uA840-\uA873' +
        '\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-' +
        '\uA9D9\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7B\uAA80-\uAAC2\uAADB-\uAADD\uAAE0-' +
        '\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABEA\uABEC' +
        '\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-' +
        '\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D' +
        '\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE26\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74' +
        '\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-' +
        '\uFFD7\uFFDA-\uFFDC]'
    );


//Methods
    function isIdentifierCh(cp) {
        if (cp < 0x80) {
            return cp >= 97 && cp <= 122 ||      // a..z
                   cp >= 65 && cp <= 90 ||       // A..Z
                   cp >= 48 && cp <= 57 ||       // 0..9
                   cp === 36 || cp === 95 ||     // $ (dollar) and _ (underscore)
                   cp === 92;                    // \ (backslash)
        }

        var ch = String.fromCharCode(cp);

        return NON_ASCII_IDENTIFIER_CHARACTERS_REGEXP.test(ch);
    }

    function isLineTerminator(cp) {
        return cp === 0x0A || cp === 0x0D || cp === 0x2028 || cp === 0x2029;
    }

    function isWhitespace(cp) {
        return cp === 0x20 || cp === 0x09 || isLineTerminator(cp) || cp === 0x0B || cp === 0x0C || cp === 0xA0 ||
               (cp >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(cp) >= 0);
    }

    function isDecimalDigit(cp) {
        return cp >= 48 && cp <= 57;
    }

    function stringRepeat(str, num) {
        var result = '';

        for (num |= 0; num > 0; num >>>= 1, str += str) {
            if (num & 1) {
                result += str;
            }
        }

        return result;
    }

    isArray = Array.isArray;
    if (!isArray) {
        isArray = function isArray(array) {
            return Object.prototype.toString.call(array) === '[object Array]';
        };
    }


    function updateDeeply(target, override) {
        var key, val;

        function isHashObject(target) {
            return typeof target === 'object' && target instanceof Object && !(target instanceof RegExp);
        }

        for (key in override) {
            if (override.hasOwnProperty(key)) {
                val = override[key];
                if (isHashObject(val)) {
                    if (isHashObject(target[key])) {
                        updateDeeply(target[key], val);
                    } else {
                        target[key] = updateDeeply({}, val);
                    }
                } else {
                    target[key] = val;
                }
            }
        }
        return target;
    }

    function generateNumber(value) {
        var result, point, temp, exponent, pos;

        if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
        }

        result = '' + value;
        if (!renumber || result.length < 3) {
            return result;
        }

        point = result.indexOf('.');
        //NOTE: 0x30 == '0'
        if (!json && result.charCodeAt(0) === 0x30 && point === 1) {
            point = 0;
            result = result.slice(1);
        }
        temp = result;
        result = result.replace('e+', 'e');
        exponent = 0;
        if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
        }
        if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
        }
        pos = 0;

        //NOTE: 0x30 == '0'
        while (temp.charCodeAt(temp.length + pos - 1) === 0x30) {
            --pos;
        }
        if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
        }
        if (exponent !== 0) {
            temp += 'e' + exponent;
        }
        if ((temp.length < result.length ||
             (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length
                                                                            < result.length)) &&
            +temp === value) {
            result = temp;
        }

        return result;
    }

// Generate valid RegExp expression.
// This function is based on https://github.com/Constellation/iv Engine

    function escapeRegExpCharacter(ch, previousIsBackslash) {
        // not handling '\' and handling \u2028 or \u2029 to unicode escape sequence
        if ((ch & ~1) === 0x2028) {
            return (previousIsBackslash ? 'u' : '\\u') + ((ch === 0x2028) ? '2028' : '2029');
        } else if (ch === 10 || ch === 13) {  // \n, \r
            return (previousIsBackslash ? '' : '\\') + ((ch === 10) ? 'n' : 'r');
        }
        return String.fromCharCode(ch);
    }

    function generateRegExp(reg) {
        var match, result, flags, i, iz, ch, characterInBrack, previousIsBackslash;

        result = reg.toString();

        if (reg.source) {
            // extract flag from toString result
            match = result.match(/\/([^/]*)$/);
            if (!match) {
                return result;
            }

            flags = match[1];
            result = '';

            characterInBrack = false;
            previousIsBackslash = false;
            for (i = 0, iz = reg.source.length; i < iz; ++i) {
                ch = reg.source.charCodeAt(i);

                if (!previousIsBackslash) {
                    if (characterInBrack) {
                        if (ch === 93) {  // ]
                            characterInBrack = false;
                        }
                    } else {
                        if (ch === 47) {  // /
                            result += '\\';
                        } else if (ch === 91) {  // [
                            characterInBrack = true;
                        }
                    }
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    previousIsBackslash = ch === 92;  // \
                } else {
                    // if new RegExp("\\\n') is provided, create /\n/
                    result += escapeRegExpCharacter(ch, previousIsBackslash);
                    // prevent like /\\[/]/
                    previousIsBackslash = false;
                }
            }

            return '/' + result + '/' + flags;
        }

        return result;
    }

    function escapeAllowedCharacter(code, next) {
        var hex, result = '\\';

        switch (code) {
            case 0x08:          // \b
                result += 'b';
                break;
            case 0x0C:          // \f
                result += 'f';
                break;
            case 0x09:          // \t
                result += 't';
                break;
            default:
                hex = code.toString(16).toUpperCase();
                if (json || code > 0xFF) {
                    result += 'u' + '0000'.slice(hex.length) + hex;
                }

                else if (code === 0x0000 && !isDecimalDigit(next)) {
                    result += '0';
                }

                else if (code === 0x000B) {     // \v
                    result += 'x0B';
                }

                else {
                    result += 'x' + '00'.slice(hex.length) + hex;
                }
                break;
        }

        return result;
    }

    function escapeDisallowedCharacter(code) {
        var result = '\\';
        switch (code) {
            case 0x5C       // \
            :
                result += '\\';
                break;
            case 0x0A       // \n
            :
                result += 'n';
                break;
            case 0x0D       // \r
            :
                result += 'r';
                break;
            case 0x2028:
                result += 'u2028';
                break;
            case 0x2029:
                result += 'u2029';
                break;
        }

        return result;
    }

    function escapeDirective(str) {
        var i, iz, code, quote;

        quote = quotes === 'double' ? '"' : '\'';
        for (i = 0, iz = str.length; i < iz; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27) {            // '
                quote = '"';
                break;
            } else if (code === 0x22) {     // "
                quote = '\'';
                break;
            } else if (code === 0x5C) {     // \
                ++i;
            }
        }

        return quote + str + quote;
    }

    function escapeString(str) {
        var result = '', i, len, code, singleQuotes = 0, doubleQuotes = 0, single, quote;
        //TODO http://jsperf.com/character-counting/8
        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if (code === 0x27) {           // '
                ++singleQuotes;
            } else if (code === 0x22) { // "
                ++doubleQuotes;
            } else if (code === 0x2F && json) { // /
                result += '\\';
            } else if (isLineTerminator(code) || code === 0x5C) { // \
                result += escapeDisallowedCharacter(code);
                continue;
            } else if ((json && code < 0x20) ||                                     // SP
                       !(json || escapeless || (code >= 0x20 && code <= 0x7E))) {   // SP, ~
                result += escapeAllowedCharacter(code, str.charCodeAt(i + 1));
                continue;
            }
            result += String.fromCharCode(code);
        }

        single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
        quote = single ? '\'' : '"';

        if (!(single ? singleQuotes : doubleQuotes)) {
            return quote + result + quote;
        }

        str = result;
        result = quote;

        for (i = 0, len = str.length; i < len; ++i) {
            code = str.charCodeAt(i);
            if ((code === 0x27 && single) || (code === 0x22 && !single)) {    // ', "
                result += '\\';
            }
            result += String.fromCharCode(code);
        }

        return result + quote;
    }


    function join(l, r) {
        if (!l.length)
            return r;

        if (!r.length)
            return l;

        var lCp = l.charCodeAt(l.length - 1),
            rCp = r.charCodeAt(0);

        if (isIdentifierCh(lCp) && isIdentifierCh(rCp) ||
            lCp === rCp && (lCp === 0x2B || lCp === 0x2D) ||   // + +, - -
            lCp === 0x2F && rCp === 0x69) {                    // /re/ instanceof foo
            return l + _.space + r;
        }

        else if (isWhitespace(lCp) || isWhitespace(rCp))
            return l + r;

        return l + _.optSpace + r;
    }

    function shiftIndent() {
        var prevIndent = _.indent;

        _.indent += _.indentUnit;
        return prevIndent;
    }

    function adoptionPrefix($stmt) {
        if ($stmt.type === Syntax.BlockStatement)
            return _.optSpace;

        if ($stmt.type === Syntax.EmptyStatement)
            return '';

        return _.newline + _.indent + _.indentUnit;
    }

    function adoptionSuffix($stmt) {
        if ($stmt.type === Syntax.BlockStatement)
            return _.optSpace;

        return _.newline + _.indent;
    }

//Subentities generators
    function generateVerbatim($expr, flags, ctxPrecedence) {
        var verbatim = $expr[extra.verbatim],
            strVerbatim = typeof verbatim === 'string',
            precedence = !strVerbatim && verbatim.precedence !== void 0 ? verbatim.precedence : Precedence.Sequence,
            parenthesize = precedence < ctxPrecedence,
            content = strVerbatim ? verbatim : verbatim.content,
            chunks = content.split(/\r\n|\n/),
            chunkCount = chunks.length;

        if (parenthesize)
            _.js += '(';

        _.js += chunks[0];

        for (var i = 1; i < chunkCount; i++)
            _.js += _.newline + _.indent + chunks[i];

        if (parenthesize)
            _.js += ')';
    }

    function generateFunctionParams($node) {
        var $params = $node.params,
            $rest = $node.rest,
            $defaults = $node.defaults,
            paramCount = $params.length,
            lastParamIdx = paramCount - 1,
            hasDefaults = !!$defaults,
            arrowFuncWithSingleParam = $node.type === Syntax.ArrowFunctionExpression && !$rest &&
                                       (!hasDefaults || $defaults.length === 0) &&
                                       paramCount === 1 &&
                                       $params[0].type === Syntax.Identifier;

        //NOTE: arg => { } case
        if (arrowFuncWithSingleParam)
            _.js += $params[0].name;

        else {
            _.js += '(';

            for (var i = 0; i < paramCount; ++i) {
                var $param = $params[i];

                if (hasDefaults && $defaults[i]) {
                    var $fakeAssign = {
                        left: $param,
                        right: $defaults[i],
                        operator: '='
                    };

                    ExprGen.AssignmentExpression($fakeAssign, E_TTT, Precedence.Assignment);
                }

                else {
                    if ($params[i].type === Syntax.Identifier)
                        _.js += $param.name;

                    else
                        ExprGen[$param.type]($param, E_TTT, Precedence.Assignment);
                }

                if (i !== lastParamIdx)
                    _.js += ',' + _.optSpace;
            }

            if ($rest) {
                if (paramCount)
                    _.js += ',' + _.optSpace;

                _.js += '...' + $rest.name;
            }

            _.js += ')';
        }
    }

    function generateFunctionBody($node) {
        var $body = $node.body;

        generateFunctionParams($node);

        if ($node.type === Syntax.ArrowFunctionExpression)
            _.js += _.optSpace + '=>';

        if ($node.expression) {
            _.js += _.optSpace;

            var exprJs = exprToJs($body, E_TTT, Precedence.Assignment);

            if (exprJs.charAt(0) === '{')
                exprJs = '(' + exprJs + ')';

            _.js += exprJs;
        }

        else {
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, S_TTFF);
        }
    }


    function canUseRawLiteral($expr) {
        if ($expr.hasOwnProperty('raw')) {
            try {
                var raw = parse($expr.raw).body[0].expression;

                return raw.type === Syntax.Literal && raw.value === $expr.value;
            } catch (e) {
                //NOTE: not use raw property
            }
        }

        return false;
    }


//-------------------------------------------------===------------------------------------------------------
//                                           Generator flags
//-------------------------------------------------===------------------------------------------------------

//Flags
    var F_ALLOW_IN = 1,
        F_ALLOW_CALL = 1 << 1,
        F_ALLOW_UNPARATH_NEW = 1 << 2,
        F_FUNC_BODY = 1 << 3,
        F_DIRECTIVE_CTX = 1 << 4,
        F_SEMICOLON_OPT = 1 << 5;


//Expression flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_ALLOW_CALL
// F_ALLOW_UNPARATH_NEW
    var E_FTT = F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TTF = F_ALLOW_IN | F_ALLOW_CALL,
        E_TTT = F_ALLOW_IN | F_ALLOW_CALL | F_ALLOW_UNPARATH_NEW,
        E_TFF = F_ALLOW_IN,
        E_FFT = F_ALLOW_UNPARATH_NEW,
        E_TFT = F_ALLOW_IN | F_ALLOW_UNPARATH_NEW;


//Statement flag sets
//NOTE: Flag order:
// F_ALLOW_IN
// F_FUNC_BODY
// F_DIRECTIVE_CTX
// F_SEMICOLON_OPT
    var S_TFFF = F_ALLOW_IN,
        S_TFFT = F_ALLOW_IN | F_SEMICOLON_OPT,
        S_FFFF = 0x00,
        S_TFTF = F_ALLOW_IN | F_DIRECTIVE_CTX,
        S_TTFF = F_ALLOW_IN | F_FUNC_BODY;

//-------------------------------------------------===-------------------------------------------------------
//                                             Expressions
//-------------------------------------------------===-------------------------------------------------------

//Regular expressions
    var FLOATING_OR_OCTAL_REGEXP = /[.eExX]|^0[0-9]+/,
        LAST_DECIMAL_DIGIT_REGEXP = /[0-9]$/;


//Common expression generators
    function generateLogicalOrBinaryExpression($expr, flags, ctxPrecedence) {
        var op = $expr.operator,
            precedence = BinaryPrecedence[$expr.operator],
            parenthesize = precedence < ctxPrecedence,
            allowIn = flags & F_ALLOW_IN || parenthesize,
            operandFlags = allowIn ? E_TTT : E_FTT,
            exprJs = exprToJs($expr.left, operandFlags, precedence);

        parenthesize |= op === 'in' && !allowIn;

        if (parenthesize)
            _.js += '(';

        // 0x2F = '/'
        if (exprJs.charCodeAt(exprJs.length - 1) === 0x2F && isIdentifierCh(op.charCodeAt(0)))
            exprJs = exprJs + _.space + op;

        else
            exprJs = join(exprJs, op);

        precedence++;

        var rightJs = exprToJs($expr.right, operandFlags, precedence);

        //NOTE: If '/' concats with '/' or `<` concats with `!--`, it is interpreted as comment start
        if (op === '/' && rightJs.charAt(0) === '/' || op.slice(-1) === '<' && rightJs.slice(0, 3) === '!--')
            exprJs += _.space + rightJs;

        else
            exprJs = join(exprJs, rightJs);

        _.js += exprJs;

        if (parenthesize)
            _.js += ')';
    }

    function generateArrayPatternOrExpression($expr) {
        var $elems = $expr.elements,
            elemCount = $elems.length;

        if (elemCount) {
            var lastElemIdx = elemCount - 1,
                multiline = elemCount > 1,
                prevIndent = shiftIndent(),
                itemPrefix = _.newline + _.indent;

            _.js += '[';

            for (var i = 0; i < elemCount; i++) {
                var $elem = $elems[i];

                if (multiline)
                    _.js += itemPrefix;

                if ($elem)
                    ExprGen[$elem.type]($elem, E_TTT, Precedence.Assignment);

                if (i !== lastElemIdx || !$elem)
                    _.js += ',';
            }

            _.indent = prevIndent;

            if (multiline)
                _.js += _.newline + _.indent;

            _.js += ']';
        }

        else
            _.js += '[]';
    }

    function generateImportOrExportSpecifier($expr) {
        _.js += $expr.id.name;

        if ($expr.name)
            _.js += _.space + 'as' + _.space + $expr.name.name;
    }

    function generateGeneratorOrComprehensionExpression($expr) {
        //NOTE: GeneratorExpression should be parenthesized with (...), ComprehensionExpression with [...]
        var $blocks = $expr.blocks,
            $filter = $expr.filter,
            isGenerator = $expr.type === Syntax.GeneratorExpression,
            exprJs = isGenerator ? '(' : '[',
            bodyJs = exprToJs($expr.body, E_TTT, Precedence.Assignment);

        if ($blocks) {
            var prevIndent = shiftIndent(),
                blockCount = $blocks.length;

            for (var i = 0; i < blockCount; ++i) {
                var blockJs = exprToJs($blocks[i], E_TTT, Precedence.Sequence);

                exprJs = i > 0 ? join(exprJs, blockJs) : (exprJs + blockJs);
            }

            _.indent = prevIndent;
        }

        if ($filter) {
            var filterJs = exprToJs($filter, E_TTT, Precedence.Sequence);

            exprJs = join(exprJs, 'if' + _.optSpace);
            exprJs = join(exprJs, '(' + filterJs + ')');
        }

        exprJs = join(exprJs, bodyJs);
        exprJs += isGenerator ? ')' : ']';

        _.js += exprJs;
    }


//Expression raw generator dictionary
    var ExprRawGen = {
        SequenceExpression: function generateSequenceExpression($expr, flags, ctxPrecedence) {
            var $children = $expr.expressions,
                childrenCount = $children.length,
                lastChildIdx = childrenCount - 1,
                parenthesize = Precedence.Sequence < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                exprFlags = allowIn ? E_TTT : E_FTT;

            if (parenthesize)
                _.js += '(';

            for (var i = 0; i < childrenCount; i++) {
                var $child = $children[i];

                ExprGen[$child.type]($child, exprFlags, Precedence.Assignment);

                if (i !== lastChildIdx)
                    _.js += ',' + _.optSpace;
            }

            if (parenthesize)
                _.js += ')';
        },

        AssignmentExpression: function generateAssignmentExpression($expr, flags, ctxPrecedence) {
            var $left = $expr.left,
                $right = $expr.right,
                parenthesize = Precedence.Assignment < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                operandFlags = allowIn ? E_TTT : E_FFT;

            if (parenthesize)
                _.js += '(';

            ExprGen[$left.type]($left, operandFlags, Precedence.Call);
            _.js += _.optSpace + $expr.operator + _.optSpace;
            ExprGen[$right.type]($right, operandFlags, Precedence.Assignment);

            if (parenthesize)
                _.js += ')';
        },

        ArrowFunctionExpression: function generateArrowFunctionExpression($expr, flags, ctxPrecedence) {
            var parenthesize = Precedence.ArrowFunction < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            generateFunctionBody($expr);

            if (parenthesize)
                _.js += ')';
        },

        ConditionalExpression: function generateConditionalExpression($expr, flags, ctxPrecedence) {
            var $test = $expr.test,
                $conseq = $expr.consequent,
                $alt = $expr.alternate,
                parenthesize = Precedence.Conditional < ctxPrecedence,
                allowIn = flags & F_ALLOW_IN || parenthesize,
                descFlags = allowIn ? E_TTT : E_FFT;

            if (parenthesize)
                _.js += '(';

            ExprGen[$test.type]($test, descFlags, Precedence.LogicalOR);
            _.js += _.optSpace + '?' + _.optSpace;
            ExprGen[$conseq.type]($conseq, descFlags, Precedence.Assignment);
            _.js += _.optSpace + ':' + _.optSpace;
            ExprGen[$alt.type]($alt, descFlags, Precedence.Assignment);

            if (parenthesize)
                _.js += ')';
        },

        LogicalExpression: generateLogicalOrBinaryExpression,

        BinaryExpression: generateLogicalOrBinaryExpression,

        CallExpression: function generateCallExpression($expr, flags, ctxPrecedence) {
            var $callee = $expr.callee,
                $args = $expr['arguments'],
                argCount = $args.length,
                lastArgIdx = argCount - 1,
                parenthesize = ~flags & F_ALLOW_CALL || Precedence.Call < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            ExprGen[$callee.type]($callee, E_TTF, Precedence.Call);
            _.js += '(';

            for (var i = 0; i < argCount; ++i) {
                var $arg = $args[i];

                ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);

                if (i !== lastArgIdx)
                    _.js += ',' + _.optSpace;
            }

            _.js += ')';

            if (parenthesize)
                _.js += ')';
        },

        NewExpression: function generateNewExpression($expr, flags, ctxPrecedence) {
            var $args = $expr['arguments'],
                parenthesize = Precedence.New < ctxPrecedence,
                argCount = $args.length,
                lastArgIdx = argCount - 1,
                withCall = ~flags & F_ALLOW_UNPARATH_NEW || parentheses || argCount > 0,
                calleeFlags = withCall ? E_TFF : E_TFT,
                calleeJs = exprToJs($expr.callee, calleeFlags, Precedence.New);

            if (parenthesize)
                _.js += '(';

            _.js += join('new', calleeJs);

            if (withCall) {
                _.js += '(';

                for (var i = 0; i < argCount; ++i) {
                    var $arg = $args[i];

                    ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);

                    if (i !== lastArgIdx)
                        _.js += ',' + _.optSpace;
                }

                _.js += ')';
            }

            if (parenthesize)
                _.js += ')';
        },

        MemberExpression: function generateMemberExpression($expr, flags, ctxPrecedence) {
            var $obj = $expr.object,
                $prop = $expr.property,
                parenthesize = Precedence.Member < ctxPrecedence,
                descFlags = flags & F_ALLOW_CALL ? E_TTF : E_TFF,
                isNumObj = !$expr.computed && $obj.type === Syntax.Literal && typeof $obj.value === 'number';

            if (parenthesize)
                _.js += '(';

            if (isNumObj) {
                //NOTE: When the following conditions are all true:
                //   1. No floating point
                //   2. Don't have exponents
                //   3. The last character is a decimal digit
                //   4. Not hexadecimal OR octal number literal
                // then we should add a floating point.

                var numJs = exprToJs($obj, descFlags, Precedence.Call),
                    withPoint = LAST_DECIMAL_DIGIT_REGEXP.test(numJs) && !FLOATING_OR_OCTAL_REGEXP.test(numJs);

                _.js += withPoint ? (numJs + '.') : numJs;
            }

            else
                ExprGen[$obj.type]($obj, descFlags, Precedence.Call);

            if ($expr.computed) {
                _.js += '[';
                ExprGen[$prop.type]($prop, descFlags, Precedence.Sequence);
                _.js += ']';
            }

            else
                _.js += '.' + $prop.name;

            if (parenthesize)
                _.js += ')';
        },

        UnaryExpression: function generateUnaryExpression($expr, flags, ctxPrecedence) {
            var parenthesize = Precedence.Unary < ctxPrecedence,
                op = $expr.operator,
                argJs = exprToJs($expr.argument, E_TTT, Precedence.Unary);

            if (parenthesize)
                _.js += '(';

            //NOTE: delete, void, typeof
            // get `typeof []`, not `typeof[]`
            if (_.optSpace === '' || op.length > 2)
                _.js += join(op, argJs);

            else {
                _.js += op;

                //NOTE: Prevent inserting spaces between operator and argument if it is unnecessary
                // like, `!cond`
                var leftCp = op.charCodeAt(op.length - 1),
                    rightCp = argJs.charCodeAt(0);

                // 0x2B = '+', 0x2D =  '-'
                if (leftCp === rightCp && (leftCp === 0x2B || leftCp === 0x2D) ||
                    isIdentifierCh(leftCp) && isIdentifierCh(rightCp)) {
                    _.js += _.space;
                }

                _.js += argJs;
            }

            if (parenthesize)
                _.js += ')';
        },

        YieldExpression: function generateYieldExpression($expr, flags, ctxPrecedence) {
            var $arg = $expr.argument,
                js = $expr.delegate ? 'yield*' : 'yield',
                parenthesize = Precedence.Yield < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            if ($arg) {
                var argJs = exprToJs($arg, E_TTT, Precedence.Assignment);

                js = join(js, argJs);
            }

            _.js += js;

            if (parenthesize)
                _.js += ')';
        },

        UpdateExpression: function generateUpdateExpression($expr, flags, ctxPrecedence) {
            var $arg = $expr.argument,
                $op = $expr.operator,
                prefix = $expr.prefix,
                precedence = prefix ? Precedence.Unary : Precedence.Postfix,
                parenthesize = precedence < ctxPrecedence;

            if (parenthesize)
                _.js += '(';

            if (prefix) {
                _.js += $op;
                ExprGen[$arg.type]($arg, E_TTT, Precedence.Postfix);

            }

            else {
                ExprGen[$arg.type]($arg, E_TTT, Precedence.Postfix);
                _.js += $op;
            }

            if (parenthesize)
                _.js += ')';
        },

        FunctionExpression: function generateFunctionExpression($expr) {
            var isGenerator = !!$expr.generator;

            _.js += isGenerator ? 'function*' : 'function';

            if ($expr.id) {
                _.js += isGenerator ? _.optSpace : _.space;
                _.js += $expr.id.name;
            }
            else
                _.js += _.optSpace;

            generateFunctionBody($expr);
        },

        ExportBatchSpecifier: function generateExportBatchSpecifier() {
            _.js += '*';
        },

        ArrayPattern: generateArrayPatternOrExpression,

        ArrayExpression: generateArrayPatternOrExpression,

        ClassExpression: function generateClassExpression($expr) {
            var $id = $expr.id,
                $super = $expr.superClass,
                $body = $expr.body,
                exprJs = 'class';

            if ($id) {
                var idJs = exprToJs($id, E_TTT);

                exprJs = join(exprJs, idJs);
            }

            if ($super) {
                var superJs = exprToJs($super, E_TTT, Precedence.Assignment);

                superJs = join('extends', superJs);
                exprJs = join(exprJs, superJs);
            }

            _.js += exprJs + _.optSpace;
            StmtGen[$body.type]($body, S_TFFT);
        },

        MethodDefinition: function generateMethodDefinition($expr) {
            var exprJs = $expr['static'] ? 'static' + _.optSpace : '',
                keyJs = exprToJs($expr.key, E_TTT, Precedence.Sequence);

            if ($expr.computed)
                keyJs = '[' + keyJs + ']';

            if ($expr.kind === 'get' || $expr.kind === 'set') {
                keyJs = join($expr.kind, keyJs);
                _.js += join(exprJs, keyJs);
            }

            else {
                if ($expr.value.generator)
                    _.js += exprJs + '*' + keyJs;

                else
                    _.js += join(exprJs, keyJs);
            }

            generateFunctionBody($expr.value);
        },

        Property: function generateProperty($expr) {
            var $val = $expr.value,
                $kind = $expr.kind,
                keyJs = exprToJs($expr.key, E_TTT, Precedence.Sequence);

            if ($expr.computed)
                keyJs = '[' + keyJs + ']';

            if ($kind === 'get' || $kind === 'set') {
                _.js += $kind + _.space + keyJs;
                generateFunctionBody($val);
            }

            else {
                if ($expr.shorthand)
                    _.js += keyJs;

                else if ($expr.method) {
                    _.js += $val.generator ? ('*' + keyJs) : keyJs;
                    generateFunctionBody($val)
                }

                else {
                    _.js += keyJs + ':' + _.optSpace;
                    ExprGen[$val.type]($val, E_TTT, Precedence.Assignment);
                }
            }
        },

        ObjectExpression: function generateObjectExpression($expr) {
            var $props = $expr.properties,
                propCount = $props.length;

            if (propCount) {
                var lastPropIdx = propCount - 1,
                    prevIndent = shiftIndent();

                _.js += '{';

                for (var i = 0; i < propCount; i++) {
                    var $prop = $props[i],
                        propType = $prop.type || Syntax.Property;

                    _.js += _.newline + _.indent;
                    ExprGen[propType]($prop, E_TTT, Precedence.Sequence);

                    if (i !== lastPropIdx)
                        _.js += ',';
                }

                _.indent = prevIndent;
                _.js += _.newline + _.indent + '}';
            }

            else
                _.js += '{}';
        },

        ObjectPattern: function generateObjectPattern($expr) {
            var $props = $expr.properties,
                propCount = $props.length;

            if (propCount) {
                var lastPropIdx = propCount - 1,
                    multiline = false;

                if (propCount === 1)
                    multiline = $props[0].value.type !== Syntax.Identifier;

                else {
                    for (var i = 0; i < propCount; i++) {
                        if (!$props[i].shorthand) {
                            multiline = true;
                            break;
                        }
                    }
                }

                _.js += multiline ? ('{' + _.newline) : '{';

                var prevIndent = shiftIndent(),
                    propSuffix = ',' + (multiline ? _.newline : _.optSpace);

                for (var i = 0; i < propCount; i++) {
                    var $prop = $props[i];

                    if (multiline)
                        _.js += _.indent;

                    ExprGen[$prop.type]($prop, E_TTT, Precedence.Sequence);

                    if (i !== lastPropIdx)
                        _.js += propSuffix;
                }

                _.indent = prevIndent;
                _.js += multiline ? (_.newline + _.indent + '}') : '}';
            }
            else
                _.js += '{}';
        },

        ThisExpression: function generateThisExpression() {
            _.js += 'this';
        },

        Identifier: function generateIdentifier($expr) {
            _.js += $expr.name;
        },

        ImportSpecifier: generateImportOrExportSpecifier,

        ExportSpecifier: generateImportOrExportSpecifier,

        Literal: function generateLiteral($expr) {
            if (parse && extra.raw && canUseRawLiteral($expr))
                _.js += $expr.raw;

            else if ($expr.value === null)
                _.js += 'null';

            else {
                var valueType = typeof $expr.value;

                if (valueType === 'string')
                    _.js += escapeString($expr.value);

                else if (valueType === 'number')
                    _.js += generateNumber($expr.value);

                else if (valueType === 'boolean')
                    _.js += $expr.value ? 'true' : 'false';

                else
                    _.js += generateRegExp($expr.value);
            }
        },

        GeneratorExpression: generateGeneratorOrComprehensionExpression,

        ComprehensionExpression: generateGeneratorOrComprehensionExpression,

        ComprehensionBlock: function generateComprehensionBlock($expr) {
            var $left = $expr.left,
                leftJs = void 0,
                rightJs = exprToJs($expr.right, E_TTT, Precedence.Sequence);

            if ($left.type === Syntax.VariableDeclaration)
                leftJs = $left.kind + _.space + stmtToJs($left.declarations[0], S_FFFF);

            else
                leftJs = exprToJs($left, E_TTT, Precedence.Call);

            leftJs = join(leftJs, $expr.of ? 'of' : 'in');

            _.js += 'for' + _.optSpace + '(' + join(leftJs, rightJs) + ')';
        },

        SpreadElement: function generateSpreadElement($expr) {
            var $arg = $expr.argument;

            _.js += '...';
            ExprGen[$arg.type]($arg, E_TTT, Precedence.Assignment);
        },

        TaggedTemplateExpression: function generateTaggedTemplateExpression($expr, flags, ctxPrecedence) {
            var $tag = $expr.tag,
                $quasi = $expr.quasi,
                parenthesize = Precedence.TaggedTemplate < ctxPrecedence,
                tagFlags = flags & F_ALLOW_CALL ? E_TTF : E_TFF;

            if (parenthesize)
                _.js += '(';

            ExprGen[$tag.type]($tag, tagFlags, Precedence.Call);
            ExprGen[$quasi.type]($quasi, E_FFT, Precedence.Primary);

            if (parenthesize)
                _.js += ')';
        },

        TemplateElement: function generateTemplateElement($expr) {
            //NOTE: Don't use "cooked". Since tagged template can use raw template
            // representation. So if we do so, it breaks the script semantics.
            _.js += $expr.value.raw;
        },

        TemplateLiteral: function generateTemplateLiteral($expr) {
            var $quasis = $expr.quasis,
                $childExprs = $expr.expressions,
                quasiCount = $quasis.length,
                lastQuasiIdx = quasiCount - 1;

            _.js += '`';

            for (var i = 0; i < quasiCount; ++i) {
                var $quasi = $quasis[i];

                ExprGen[$quasi.type]($quasi, E_TTT, Precedence.Primary);

                if (i !== lastQuasiIdx) {
                    var $childExpr = $childExprs[i];

                    _.js += '${' + _.optSpace;
                    ExprGen[$childExpr.type]($childExpr, E_TTT, Precedence.Sequence);
                    _.js += _.optSpace + '}';
                }
            }

            _.js += '`';
        }
    };


//-------------------------------------------------===------------------------------------------------------
//                                              Statements
//-------------------------------------------------===------------------------------------------------------


//Regular expressions
    var EXPR_STMT_UNALLOWED_EXPR_REGEXP = /^{|^class(?:\s|{)|^function(?:\s|\*|\()/;


//Common statement generators
    function generateTryStatementHandlers(stmtJs, $finalizer, handlers) {
        var handlerCount = handlers.length,
            lastHandlerIdx = handlerCount - 1;

        for (var i = 0; i < handlerCount; ++i) {
            var handlerJs = stmtToJs(handlers[i], S_TFFF);

            stmtJs = join(stmtJs, handlerJs);

            if ($finalizer || i !== lastHandlerIdx)
                stmtJs += adoptionSuffix(handlers[i].body);
        }

        return stmtJs;
    }

    function generateForStatementIterator($op, $stmt, flags) {
        var $body = $stmt.body,
            $left = $stmt.left,
            bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
            prevIndent1 = shiftIndent(),
            stmtJs = 'for' + _.optSpace + '(';

        if ($left.type === Syntax.VariableDeclaration) {
            var prevIndent2 = shiftIndent();

            stmtJs += $left.kind + _.space + stmtToJs($left.declarations[0], S_FFFF);
            _.indent = prevIndent2;
        }

        else
            stmtJs += exprToJs($left, E_TTT, Precedence.Call);

        stmtJs = join(stmtJs, $op);

        var rightJs = exprToJs($stmt.right, E_TTT, Precedence.Sequence);

        stmtJs = join(stmtJs, rightJs) + ')';

        _.indent = prevIndent1;

        _.js += stmtJs + adoptionPrefix($body);
        StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
    }


//Statement generator dictionary
    var StmtRawGen = {
        BlockStatement: function generateBlockStatement($stmt, flags) {
            var $body = $stmt.body,
                len = $body.length,
                lastIdx = len - 1,
                itemsFlags = flags & F_FUNC_BODY ? S_TFTF : S_TFFF,
                prevIndent = shiftIndent();

            _.js += '{' + _.newline;

            for (var i = 0; i < len; i++) {
                var $item = $body[i],
                    itemFlags = itemsFlags;

                if (i === lastIdx)
                    itemFlags |= F_SEMICOLON_OPT;

                _.js += _.indent;
                StmtGen[$item.type]($item, itemFlags);
                _.js += _.newline;
            }

            _.indent = prevIndent;
            _.js += _.indent + '}';
        },

        BreakStatement: function generateBreakStatement($stmt, flags) {
            if ($stmt.label)
                _.js += 'break ' + $stmt.label.name;

            else
                _.js += 'break';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ContinueStatement: function generateContinueStatement($stmt, flags) {
            if ($stmt.label)
                _.js += 'continue ' + $stmt.label.name;

            else
                _.js += 'continue';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ClassBody: function generateClassBody($stmt) {
            var $body = $stmt.body,
                itemCount = $body.length,
                lastItemIdx = itemCount - 1,
                prevIndent = shiftIndent();

            _.js += '{' + _.newline;

            for (var i = 0; i < itemCount; i++) {
                var $item = $body[i],
                    itemType = $item.type || Syntax.Property;

                _.js += _.indent;
                ExprGen[itemType]($item, E_TTT, Precedence.Sequence);

                if (i !== lastItemIdx)
                    _.js += _.newline;
            }

            _.indent = prevIndent;
            _.js += _.newline + _.indent + '}';
        },

        ClassDeclaration: function generateClassDeclaration($stmt) {
            var $body = $stmt.body,
                $super = $stmt.superClass,
                js = 'class ' + $stmt.id.name;

            if ($super) {
                var superJs = exprToJs($super, E_TTT, Precedence.Assignment);

                js += _.space + join('extends', superJs);
            }

            _.js += js + _.optSpace;
            StmtGen[$body.type]($body, S_TFFT);
        },

        DirectiveStatement: function generateDirectiveStatement($stmt, flags) {
            if (extra.raw && $stmt.raw)
                _.js += $stmt.raw;

            else
                _.js += escapeDirective($stmt.directive);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        DoWhileStatement: function generateDoWhileStatement($stmt, flags) {
            var $body = $stmt.body,
                $test = $stmt.test,
                bodyJs = adoptionPrefix($body) +
                         stmtToJs($body, S_TFFF) +
                         adoptionSuffix($body);

            //NOTE: Because `do 42 while (cond)` is Syntax Error. We need semicolon.
            var stmtJs = join('do', bodyJs);

            _.js += join(stmtJs, 'while' + _.optSpace + '(');
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        CatchClause: function generateCatchClause($stmt) {
            var $param = $stmt.param,
                $guard = $stmt.guard,
                $body = $stmt.body,
                prevIndent = shiftIndent();

            _.js += 'catch' + _.optSpace + '(';
            ExprGen[$param.type]($param, E_TTT, Precedence.Sequence);

            if ($guard) {
                _.js += ' if ';
                ExprGen[$guard.type]($guard, E_TTT, Precedence.Sequence);
            }

            _.indent = prevIndent;
            _.js += ')' + adoptionPrefix($body);
            StmtGen[$body.type]($body, S_TFFF);
        },

        DebuggerStatement: function generateDebuggerStatement($stmt, flags) {
            _.js += 'debugger';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        EmptyStatement: function generateEmptyStatement() {
            _.js += ';';
        },

        ExportDeclaration: function generateExportDeclaration($stmt, flags) {
            var $specs = $stmt.specifiers,
                $decl = $stmt.declaration,
                withSemicolon = semicolons || ~flags & F_SEMICOLON_OPT;

            // export default AssignmentExpression[In] ;
            if ($stmt['default']) {
                var declJs = exprToJs($decl, E_TTT, Precedence.Assignment);

                _.js += join('export default', declJs);

                if (withSemicolon)
                    _.js += ';';
            }

            // export * FromClause ;
            // export ExportClause[NoReference] FromClause ;
            // export ExportClause ;
            else if ($specs) {
                var stmtJs = 'export';

                if ($specs.length === 0)
                    stmtJs += _.optSpace + '{' + _.optSpace + '}';

                else if ($specs[0].type === Syntax.ExportBatchSpecifier) {
                    var specJs = exprToJs($specs[0], E_TTT, Precedence.Sequence);

                    stmtJs = join(stmtJs, specJs);
                }

                else {
                    var prevIndent = shiftIndent(),
                        specCount = $specs.length,
                        lastSpecIdx = specCount - 1;

                    stmtJs += _.optSpace + '{';

                    for (var i = 0; i < specCount; ++i) {
                        stmtJs += _.newline + _.indent;
                        stmtJs += exprToJs($specs[i], E_TTT, Precedence.Sequence);

                        if (i !== lastSpecIdx)
                            stmtJs += ',';
                    }

                    _.indent = prevIndent;
                    stmtJs += _.newline + _.indent + '}';
                }

                if ($stmt.source) {
                    _.js += join(stmtJs, 'from' + _.optSpace);
                    ExprGen.Literal($stmt.source);
                }

                else
                    _.js += stmtJs;

                if (withSemicolon)
                    _.js += ';';
            }

            // export VariableStatement
            // export Declaration[Default]
            else if ($decl) {
                var declJs = stmtToJs($decl, withSemicolon ? S_TFFF : S_TFFT);

                _.js += join('export', declJs);
            }
        },

        ExpressionStatement: function generateExpressionStatement($stmt, flags) {
            var $expr = $stmt.expression,
                exprJs = exprToJs($expr, E_TTT, Precedence.Sequence),
                parenthesize = EXPR_STMT_UNALLOWED_EXPR_REGEXP.test(exprJs) ||
                               (directive &&
                                flags & F_DIRECTIVE_CTX &&
                                $expr.type === Syntax.Literal &&
                                typeof $expr.value === 'string');

            //NOTE: '{', 'function', 'class' are not allowed in expression statement.
            // Therefore, they should be parenthesized.
            if (parenthesize)
                _.js += '(' + exprJs + ')';

            else
                _.js += exprJs;

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        ImportDeclaration: function generateImportDeclaration($stmt, flags) {
            var $specs = $stmt.specifiers,
                stmtJs = 'import',
                specCount = $specs.length;

            //NOTE: If no ImportClause is present,
            // this should be `import ModuleSpecifier` so skip `from`
            // ModuleSpecifier is StringLiteral.
            if (specCount) {
                var hasBinding = !!$specs[0]['default'],
                    firstNamedIdx = hasBinding ? 1 : 0,
                    lastSpecIdx = specCount - 1;

                // ImportedBinding
                if (hasBinding)
                    stmtJs = join(stmtJs, $specs[0].id.name);

                // NamedImports
                if (firstNamedIdx < specCount) {
                    if (hasBinding)
                        stmtJs += ',';

                    stmtJs += _.optSpace + '{';

                    // import { ... } from "...";
                    if (firstNamedIdx === lastSpecIdx)
                        stmtJs += _.optSpace + exprToJs($specs[firstNamedIdx], E_TTT, Precedence.Sequence) + _.optSpace;

                    else {
                        var prevIndent = shiftIndent();

                        // import {
                        //    ...,
                        //    ...,
                        // } from "...";
                        for (var i = firstNamedIdx; i < specCount; i++) {
                            stmtJs += _.newline + _.indent + exprToJs($specs[i], E_TTT, Precedence.Sequence);

                            if (i !== lastSpecIdx)
                                stmtJs += ',';
                        }

                        _.indent = prevIndent;
                        stmtJs += _.newline + _.indent;
                    }

                    stmtJs += '}' + _.optSpace;
                }

                stmtJs = join(stmtJs, 'from')
            }

            _.js += stmtJs + _.optSpace;
            ExprGen.Literal($stmt.source);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        VariableDeclarator: function generateVariableDeclarator($stmt, flags) {
            var $id = $stmt.id,
                $init = $stmt.init,
                descFlags = flags & F_ALLOW_IN ? E_TTT : E_FTT;

            if ($init) {
                ExprGen[$id.type]($id, descFlags, Precedence.Assignment);
                _.js += _.optSpace + '=' + _.optSpace;
                ExprGen[$init.type]($init, descFlags, Precedence.Assignment);
            }

            else {
                if ($id.type === Syntax.Identifier)
                    _.js += $id.name;

                else
                    ExprGen[$id.type]($id, descFlags, Precedence.Assignment);
            }
        },

        VariableDeclaration: function generateVariableDeclaration($stmt, flags) {
            var $decls = $stmt.declarations,
                len = $decls.length,
                prevIndent = len > 1 ? shiftIndent() : _.indent,
                declFlags = flags & F_ALLOW_IN ? S_TFFF : S_FFFF;

            _.js += $stmt.kind;

            for (var i = 0; i < len; i++) {
                var $decl = $decls[i];

                _.js += i === 0 ? _.space : (',' + _.optSpace);
                StmtGen[$decl.type]($decl, declFlags);
            }

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';

            _.indent = prevIndent;
        },

        ThrowStatement: function generateThrowStatement($stmt, flags) {
            var argJs = exprToJs($stmt.argument, E_TTT, Precedence.Sequence);

            _.js += join('throw', argJs);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        TryStatement: function generateTryStatement($stmt) {
            var $block = $stmt.block,
                $finalizer = $stmt.finalizer,
                stmtJs = 'try' +
                         adoptionPrefix($block) +
                         stmtToJs($block, S_TFFF) +
                         adoptionSuffix($block);

            var $handlers = $stmt.handlers || $stmt.guardedHandlers;

            if ($handlers)
                stmtJs = generateTryStatementHandlers(stmtJs, $finalizer, $handlers);

            if ($stmt.handler) {
                $handlers = isArray($stmt.handler) ? $stmt.handler : [$stmt.handler];
                stmtJs = generateTryStatementHandlers(stmtJs, $finalizer, $handlers);
            }

            if ($finalizer) {
                stmtJs = join(stmtJs, 'finally' + adoptionPrefix($finalizer));
                stmtJs += stmtToJs($finalizer, S_TFFF);
            }

            _.js += stmtJs;
        },

        SwitchStatement: function generateSwitchStatement($stmt) {
            var $cases = $stmt.cases,
                $discr = $stmt.discriminant,
                prevIndent = shiftIndent();

            _.js += 'switch' + _.optSpace + '(';
            ExprGen[$discr.type]($discr, E_TTT, Precedence.Sequence);
            _.js += ')' + _.optSpace + '{' + _.newline;
            _.indent = prevIndent;

            if ($cases) {
                var caseCount = $cases.length,
                    lastCaseIdx = caseCount - 1;

                for (var i = 0; i < caseCount; i++) {
                    var $case = $cases[i];

                    _.js += _.indent;
                    StmtGen[$case.type]($case, i === lastCaseIdx ? S_TFFT : S_TFFF);
                    _.js += _.newline;
                }
            }

            _.js += _.indent + '}';
        },

        SwitchCase: function generateSwitchCase($stmt, flags) {
            var $conseqs = $stmt.consequent,
                $firstConseq = $conseqs[0],
                $test = $stmt.test,
                i = 0,
                conseqSemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                conseqCount = $conseqs.length,
                lastConseqIdx = conseqCount - 1,
                prevIndent = shiftIndent();

            if ($test) {
                var testJs = exprToJs($test, E_TTT, Precedence.Sequence);

                _.js += join('case', testJs) + ':';
            }

            else
                _.js += 'default:';


            if (conseqCount && $firstConseq.type === Syntax.BlockStatement) {
                i++;
                _.js += adoptionPrefix($firstConseq);
                StmtGen[$firstConseq.type]($firstConseq, S_TFFF);
            }

            for (; i < conseqCount; i++) {
                var $conseq = $conseqs[i],
                    semicolonOptional = i === lastConseqIdx && conseqSemicolonOptional;

                _.js += _.newline + _.indent;
                StmtGen[$conseq.type]($conseq, semicolonOptional ? S_TFFT : S_TFFF);
            }

            _.indent = prevIndent;
        },

        IfStatement: function generateIfStatement($stmt, flags) {
            var $alt = $stmt.alternate,
                $conseq = $stmt.consequent,
                $test = $stmt.test,
                prevIndent = shiftIndent(),
                semicolonOptional = !semicolons && flags & F_SEMICOLON_OPT;

            _.js += 'if' + _.optSpace + '(';
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($conseq);

            if ($alt) {
                var conseq = stmtToJs($conseq, S_TFFF) + adoptionSuffix($conseq),
                    alt = stmtToJs($alt, semicolonOptional ? S_TFFT : S_TFFF);

                if ($alt.type === Syntax.IfStatement)
                    alt = 'else ' + alt;

                else
                    alt = join('else', adoptionPrefix($alt) + alt);

                _.js += join(conseq, alt);
            }

            else
                StmtGen[$conseq.type]($conseq, semicolonOptional ? S_TFFT : S_TFFF);
        },

        ForStatement: function generateForStatement($stmt, flags) {
            var $init = $stmt.init,
                $test = $stmt.test,
                $body = $stmt.body,
                $update = $stmt.update,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'for' + _.optSpace + '(';

            if ($init) {
                if ($init.type === Syntax.VariableDeclaration)
                    StmtGen[$init.type]($init, S_FFFF);

                else {
                    ExprGen[$init.type]($init, E_FTT, Precedence.Sequence);
                    _.js += ';';
                }
            }

            else
                _.js += ';';

            if ($test) {
                _.js += _.optSpace;
                ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            }

            _.js += ';';

            if ($update) {
                _.js += _.optSpace;
                ExprGen[$update.type]($update, E_TTT, Precedence.Sequence);
            }

            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        },

        ForInStatement: function generateForInStatement($stmt, flags) {
            generateForStatementIterator('in', $stmt, flags);
        },

        ForOfStatement: function generateForOfStatement($stmt, flags) {
            generateForStatementIterator('of', $stmt, flags);
        },

        LabeledStatement: function generateLabeledStatement($stmt, flags) {
            var $body = $stmt.body,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = _.indent;

            _.js += $stmt.label.name + ':' + adoptionPrefix($body);

            if ($body.type !== Syntax.BlockStatement)
                prevIndent = shiftIndent();

            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
            _.indent = prevIndent;
        },

        ModuleDeclaration: function generateModuleDeclaration($stmt, flags) {
            _.js += 'module' + _.space + $stmt.id.name + _.space + 'from' + _.optSpace;

            ExprGen.Literal($stmt.source);

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        Program: function generateProgram($stmt) {
            var $body = $stmt.body,
                len = $body.length,
                lastIdx = len - 1;

            if (safeConcatenation && len > 0)
                _.js += '\n';

            for (var i = 0; i < len; i++) {
                var $item = $body[i],
                    itemFlags = S_TFTF;

                if (!safeConcatenation && i === lastIdx)
                    itemFlags |= F_SEMICOLON_OPT;

                _.js += _.indent;
                StmtGen[$item.type]($item, itemFlags);

                if (i !== lastIdx)
                    _.js += _.newline;
            }
        },

        FunctionDeclaration: function generateFunctionDeclaration($stmt) {
            var isGenerator = !!$stmt.generator;

            _.js += isGenerator ? ('function*' + _.optSpace) : ('function' + _.space );
            _.js += $stmt.id.name;
            generateFunctionBody($stmt);
        },

        ReturnStatement: function generateReturnStatement($stmt, flags) {
            var $arg = $stmt.argument;

            if ($arg) {
                var argJs = exprToJs($arg, E_TTT, Precedence.Sequence);

                _.js += join('return', argJs);
            }

            else
                _.js += 'return';

            if (semicolons || ~flags & F_SEMICOLON_OPT)
                _.js += ';';
        },

        WhileStatement: function generateWhileStatement($stmt, flags) {
            var $body = $stmt.body,
                $test = $stmt.test,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'while' + _.optSpace + '(';
            ExprGen[$test.type]($test, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;

            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        },

        WithStatement: function generateWithStatement($stmt, flags) {
            var $body = $stmt.body,
                $obj = $stmt.object,
                bodySemicolonOptional = !semicolons && flags & F_SEMICOLON_OPT,
                prevIndent = shiftIndent();

            _.js += 'with' + _.optSpace + '(';
            ExprGen[$obj.type]($obj, E_TTT, Precedence.Sequence);
            _.js += ')';
            _.indent = prevIndent;
            _.js += adoptionPrefix($body);
            StmtGen[$body.type]($body, bodySemicolonOptional ? S_TFFT : S_TFFF);
        }
    };

    function generateStatement($stmt, option) {
        StmtGen[$stmt.type]($stmt, option);
    }

//CodeGen
//-----------------------------------------------------------------------------------
    function exprToJs($expr, flags, ctxPrecedence) {
        var savedJs = _.js;
        _.js = '';

        ExprGen[$expr.type]($expr, flags, ctxPrecedence);

        var src = _.js;
        _.js = savedJs;

        return src;
    }

    function stmtToJs($stmt, flags) {
        var savedJs = _.js;
        _.js = '';

        StmtGen[$stmt.type]($stmt, flags);

        var src = _.js;
        _.js = savedJs;

        return src;
    }

    function run($node) {
        _.js = '';

        if (StmtGen[$node.type])
            StmtGen[$node.type]($node, S_TFFF);

        else
            ExprGen[$node.type]($node, E_TTF, Precedence.Sequence);

        return _.js;
    }

    function wrapExprGen(gen) {
        return function ($expr, flags, ctxPrecedence) {
            if (extra.verbatim && $expr.hasOwnProperty(extra.verbatim))
                generateVerbatim($expr, flags, ctxPrecedence);

            else
                gen($expr, flags);
        }
    }

    function createExprGenWithExtras() {
        var gens = {};

        for (var key in ExprRawGen) {
            if (ExprRawGen.hasOwnProperty(key))
                gens[key] = wrapExprGen(ExprRawGen[key]);
        }

        return gens;
    }


//Strings
    var _ = {
        js: '',
        newline: '\n',
        optSpace: ' ',
        space: ' ',
        indentUnit: '    ',
        indent: ''
    };


//Generators
    var ExprGen = void 0,
        StmtGen = StmtRawGen;


    function generate($node, options) {
        var defaultOptions = getDefaultOptions(), result, pair;

        if (options != null) {
            //NOTE: Obsolete options
            //
            //   `options.indent`
            //   `options.base`
            //
            // Instead of them, we can use `option.format.indent`.
            if (typeof options.indent === 'string') {
                defaultOptions.format.indent.style = options.indent;
            }
            if (typeof options.base === 'number') {
                defaultOptions.format.indent.base = options.base;
            }
            options = updateDeeply(defaultOptions, options);
            _.indentUnit = options.format.indent.style;
            if (typeof options.base === 'string') {
                _.indent = options.base;
            } else {
                _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
            }
        } else {
            options = defaultOptions;
            _.indentUnit = options.format.indent.style;
            _.indent = stringRepeat(_.indentUnit, options.format.indent.base);
        }
        json = options.format.json;
        renumber = options.format.renumber;
        hexadecimal = json ? false : options.format.hexadecimal;
        quotes = json ? 'double' : options.format.quotes;
        escapeless = options.format.escapeless;

        _.newline = options.format.newline;
        _.optSpace = options.format.space;

        if (options.format.compact)
            _.newline = _.optSpace = _.indentUnit = _.indent = '';

        _.space = _.optSpace ? _.optSpace : ' ';
        parentheses = options.format.parentheses;
        semicolons = options.format.semicolons;
        safeConcatenation = options.format.safeConcatenation;
        directive = options.directive;
        parse = json ? null : options.parse;
        extra = options;

        if (extra.verbatim)
            ExprGen = createExprGenWithExtras();

        else
            ExprGen = ExprRawGen;

        return run($node);
    }

    FORMAT_MINIFY = {
        indent: {
            style: '',
            base: 0
        },
        renumber: true,
        hexadecimal: true,
        quotes: 'auto',
        escapeless: true,
        compact: true,
        parentheses: false,
        semicolons: false
    };

    var esotope = {
        generate: generate,
        Precedence: updateDeeply({}, Precedence),
        browser: false,
        FORMAT_MINIFY: FORMAT_MINIFY,
        FORMAT_DEFAULTS: getDefaultOptions().format
    };

    //Node
    if (typeof module !== 'undefined' && module.exports)
        module.exports = esotope;

    //RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        esotope.browser = true;

        define([], function () {
            return esotope;
        });
    }

    else {
        esotope.browser = true;
        global.esotope = esotope;
    }

})(this);

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.acorn = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var pp = _state.Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp.checkPropClash = function (prop, propHash) {
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) return;
  var key = prop.key;var name = undefined;
  switch (key.type) {
    case "Identifier":
      name = key.name;break;
    case "Literal":
      name = String(key.value);break;
    default:
      return;
  }
  var kind = prop.kind;

  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var isGetSet = kind !== "init";
    if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init)) this.raiseRecoverable(key.start, "Redefinition of property");
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp.parseExpression = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
  if (this.type === _tokentype.types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(_tokentype.types.comma)) node.expressions.push(this.parseMaybeAssign(noIn, refDestructuringErrors));
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp.parseMaybeAssign = function (noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) return this.parseYield();

  var validateDestructuring = false;
  if (!refDestructuringErrors) {
    refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 };
    validateDestructuring = true;
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  if (this.type == _tokentype.types.parenL || this.type == _tokentype.types.name) this.potentialArrowAt = this.start;
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc);
  if (this.type.isAssign) {
    if (validateDestructuring) this.checkPatternErrors(refDestructuringErrors, true);
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === _tokentype.types.eq ? this.toAssignable(left) : left;
    refDestructuringErrors.shorthandAssign = 0; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (validateDestructuring) this.checkExpressionErrors(refDestructuringErrors, true);
  }
  return left;
};

// Parse a ternary conditional (`?:`) operator.

pp.parseMaybeConditional = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
  if (this.eat(_tokentype.types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(_tokentype.types.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};

// Start the precedence parser.

pp.parseExprOps = function (noIn, refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
  return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (prec != null && (!noIn || this.type !== _tokentype.types._in)) {
    if (prec > minPrec) {
      var logical = this.type === _tokentype.types.logicalOR || this.type === _tokentype.types.logicalAND;
      var op = this.value;
      this.next();
      var startPos = this.start,
          startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
    }
  }
  return left;
};

pp.buildBinary = function (startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};

// Parse unary operators, both prefix and postfix.

pp.parseMaybeUnary = function (refDestructuringErrors, sawUnary) {
  var startPos = this.start,
      startLoc = this.startLoc,
      expr = undefined;
  if (this.type.prefix) {
    var node = this.startNode(),
        update = this.type === _tokentype.types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) this.checkLVal(node.argument);else if (this.strict && node.operator === "delete" && node.argument.type === "Identifier") this.raiseRecoverable(node.start, "Deleting local variable in strict mode");else sawUnary = true;
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr;
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      node.prefix = false;
      node.argument = expr;
      this.checkLVal(expr);
      this.next();
      expr = this.finishNode(node, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(_tokentype.types.starstar)) return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);else return expr;
};

// Parse call, dot, and `[]`-subscript expressions.

pp.parseExprSubscripts = function (refDestructuringErrors) {
  var startPos = this.start,
      startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr;
  return this.parseSubscripts(expr, startPos, startLoc);
};

pp.parseSubscripts = function (base, startPos, startLoc, noCalls) {
  for (;;) {
    if (this.eat(_tokentype.types.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseIdent(true);
      node.computed = false;
      base = this.finishNode(node, "MemberExpression");
    } else if (this.eat(_tokentype.types.bracketL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = this.parseExpression();
      node.computed = true;
      this.expect(_tokentype.types.bracketR);
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(_tokentype.types.parenL)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.callee = base;
      node.arguments = this.parseExprList(_tokentype.types.parenR, false);
      base = this.finishNode(node, "CallExpression");
    } else if (this.type === _tokentype.types.backQuote) {
      var node = this.startNodeAt(startPos, startLoc);
      node.tag = base;
      node.quasi = this.parseTemplate();
      base = this.finishNode(node, "TaggedTemplateExpression");
    } else {
      return base;
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp.parseExprAtom = function (refDestructuringErrors) {
  var node = undefined,
      canBeArrow = this.potentialArrowAt == this.start;
  switch (this.type) {
    case _tokentype.types._super:
      if (!this.inFunction) this.raise(this.start, "'super' outside of function or class");

    case _tokentype.types._this:
      var type = this.type === _tokentype.types._this ? "ThisExpression" : "Super";
      node = this.startNode();
      this.next();
      return this.finishNode(node, type);

    case _tokentype.types.name:
      var startPos = this.start,
          startLoc = this.startLoc;
      var id = this.parseIdent(this.type !== _tokentype.types.name);
      if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id]);
      return id;

    case _tokentype.types.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;

    case _tokentype.types.num:case _tokentype.types.string:
      return this.parseLiteral(this.value);

    case _tokentype.types._null:case _tokentype.types._true:case _tokentype.types._false:
      node = this.startNode();
      node.value = this.type === _tokentype.types._null ? null : this.type === _tokentype.types._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");

    case _tokentype.types.parenL:
      return this.parseParenAndDistinguishExpression(canBeArrow);

    case _tokentype.types.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(_tokentype.types.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");

    case _tokentype.types.braceL:
      return this.parseObj(false, refDestructuringErrors);

    case _tokentype.types._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, false);

    case _tokentype.types._class:
      return this.parseClass(this.startNode(), false);

    case _tokentype.types._new:
      return this.parseNew();

    case _tokentype.types.backQuote:
      return this.parseTemplate();

    default:
      this.unexpected();
  }
};

pp.parseLiteral = function (value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal");
};

pp.parseParenExpression = function () {
  this.expect(_tokentype.types.parenL);
  var val = this.parseExpression();
  this.expect(_tokentype.types.parenR);
  return val;
};

pp.parseParenAndDistinguishExpression = function (canBeArrow) {
  var startPos = this.start,
      startLoc = this.startLoc,
      val = undefined;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start,
        innerStartLoc = this.startLoc;
    var exprList = [],
        first = true;
    var refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 },
        spreadStart = undefined,
        innerParenStart = undefined;
    while (this.type !== _tokentype.types.parenR) {
      first ? first = false : this.expect(_tokentype.types.comma);
      if (this.type === _tokentype.types.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRest()));
        break;
      } else {
        if (this.type === _tokentype.types.parenL && !innerParenStart) {
          innerParenStart = this.start;
        }
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.start,
        innerEndLoc = this.startLoc;
    this.expect(_tokentype.types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(_tokentype.types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, true);
      if (innerParenStart) this.unexpected(innerParenStart);
      return this.parseParenArrowList(startPos, startLoc, exprList);
    }

    if (!exprList.length) this.unexpected(this.lastTokStart);
    if (spreadStart) this.unexpected(spreadStart);
    this.checkExpressionErrors(refDestructuringErrors, true);

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};

pp.parseParenItem = function (item) {
  return item;
};

pp.parseParenArrowList = function (startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = [];

pp.parseNew = function () {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(_tokentype.types.dot)) {
    node.meta = meta;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target");
    if (!this.inFunction) this.raiseRecoverable(node.start, "new.target can only be used in functions");
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start,
      startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(_tokentype.types.parenL)) node.arguments = this.parseExprList(_tokentype.types.parenR, false);else node.arguments = empty;
  return this.finishNode(node, "NewExpression");
};

// Parse template expression.

pp.parseTemplateElement = function () {
  var elem = this.startNode();
  elem.value = {
    raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
    cooked: this.value
  };
  this.next();
  elem.tail = this.type === _tokentype.types.backQuote;
  return this.finishNode(elem, "TemplateElement");
};

pp.parseTemplate = function () {
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement();
  node.quasis = [curElt];
  while (!curElt.tail) {
    this.expect(_tokentype.types.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(_tokentype.types.braceR);
    node.quasis.push(curElt = this.parseTemplateElement());
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};

// Parse an object literal or binding pattern.

pp.parseObj = function (isPattern, refDestructuringErrors) {
  var node = this.startNode(),
      first = true,
      propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var prop = this.startNode(),
        isGenerator = undefined,
        startPos = undefined,
        startLoc = undefined;
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) isGenerator = this.eat(_tokentype.types.star);
    }
    this.parsePropertyName(prop);
    this.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors);
    this.checkPropClash(prop, propHash);
    node.properties.push(this.finishNode(prop, "Property"));
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};

pp.parsePropertyValue = function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
  if (this.eat(_tokentype.types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === _tokentype.types.parenL) {
    if (isPattern) this.unexpected();
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator);
  } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && this.type != _tokentype.types.comma && this.type != _tokentype.types.braceR) {
    if (isGenerator || isPattern) this.unexpected();
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
    }
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    prop.kind = "init";
    if (isPattern) {
      if (this.keywords.test(prop.key.name) || (this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name) || this.inGenerator && prop.key.name == "yield") this.raiseRecoverable(prop.key.start, "Binding " + prop.key.name);
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === _tokentype.types.eq && refDestructuringErrors) {
      if (!refDestructuringErrors.shorthandAssign) refDestructuringErrors.shorthandAssign = this.start;
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else this.unexpected();
};

pp.parsePropertyName = function (prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(_tokentype.types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(_tokentype.types.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === _tokentype.types.num || this.type === _tokentype.types.string ? this.parseExprAtom() : this.parseIdent(true);
};

// Initialize empty function node.

pp.initFunction = function (node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
};

// Parse object or class method.

pp.parseMethod = function (isGenerator) {
  var node = this.startNode(),
      oldInGen = this.inGenerator;
  this.inGenerator = isGenerator;
  this.initFunction(node);
  this.expect(_tokentype.types.parenL);
  node.params = this.parseBindingList(_tokentype.types.parenR, false, false);
  if (this.options.ecmaVersion >= 6) node.generator = isGenerator;
  this.parseFunctionBody(node, false);
  this.inGenerator = oldInGen;
  return this.finishNode(node, "FunctionExpression");
};

// Parse arrow function expression with given parameters.

pp.parseArrowExpression = function (node, params) {
  var oldInGen = this.inGenerator;
  this.inGenerator = false;
  this.initFunction(node);
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);
  this.inGenerator = oldInGen;
  return this.finishNode(node, "ArrowFunctionExpression");
};

// Parse function body and check parameters.

pp.parseFunctionBody = function (node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== _tokentype.types.braceL;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
  } else {
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = this.inFunction,
        oldLabels = this.labels;
    this.inFunction = true;this.labels = [];
    node.body = this.parseBlock(true);
    node.expression = false;
    this.inFunction = oldInFunc;this.labels = oldLabels;
  }

  // If this is a strict mode function, verify that argument names
  // are not repeated, and it does not try to bind the words `eval`
  // or `arguments`.
  if (this.strict || !isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) {
    var oldStrict = this.strict;
    this.strict = true;
    if (node.id) this.checkLVal(node.id, true);
    this.checkParams(node);
    this.strict = oldStrict;
  } else if (isArrowFunction) {
    this.checkParams(node);
  }
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp.checkParams = function (node) {
  var nameHash = {};
  for (var i = 0; i < node.params.length; i++) {
    this.checkLVal(node.params[i], true, nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp.parseExprList = function (close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) break;
    } else first = false;

    var elt = undefined;
    if (allowEmpty && this.type === _tokentype.types.comma) elt = null;else if (this.type === _tokentype.types.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (this.type === _tokentype.types.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
        refDestructuringErrors.trailingComma = this.lastTokStart;
      }
    } else elt = this.parseMaybeAssign(false, refDestructuringErrors);
    elts.push(elt);
  }
  return elts;
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp.parseIdent = function (liberal) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved == "never") liberal = false;
  if (this.type === _tokentype.types.name) {
    if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) && (this.options.ecmaVersion >= 6 || this.input.slice(this.start, this.end).indexOf("\\") == -1)) this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved");
    if (!liberal && this.inGenerator && this.value === "yield") this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator");
    node.name = this.value;
  } else if (liberal && this.type.keyword) {
    node.name = this.type.keyword;
  } else {
    this.unexpected();
  }
  this.next();
  return this.finishNode(node, "Identifier");
};

// Parses yield expression inside generator.

pp.parseYield = function () {
  var node = this.startNode();
  this.next();
  if (this.type == _tokentype.types.semi || this.canInsertSemicolon() || this.type != _tokentype.types.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(_tokentype.types.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression");
};

},{"./state":10,"./tokentype":14}],2:[function(_dereq_,module,exports){
// Reserved word lists for various dialects of the language

"use strict";

exports.__esModule = true;
exports.isIdentifierStart = isIdentifierStart;
exports.isIdentifierChar = isIdentifierChar;
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  7: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

exports.reservedWords = reservedWords;
// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
};

exports.keywords = keywords;
// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢴऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣣ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 287, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 1288, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541];
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 168, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 3617, 6, 792618, 239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) return false;
    pos += set[i + 1];
    if (pos >= code) return true;
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes);
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36;
  if (code < 58) return true;
  if (code < 65) return false;
  if (code < 91) return true;
  if (code < 97) return code === 95;
  if (code < 123) return true;
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  if (astral === false) return false;
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}

},{}],3:[function(_dereq_,module,exports){
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/ternjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/ternjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

"use strict";

exports.__esModule = true;
exports.parse = parse;
exports.parseExpressionAt = parseExpressionAt;
exports.tokenizer = tokenizer;

var _state = _dereq_("./state");

_dereq_("./parseutil");

_dereq_("./statement");

_dereq_("./lval");

_dereq_("./expression");

_dereq_("./location");

exports.Parser = _state.Parser;
exports.plugins = _state.plugins;

var _options = _dereq_("./options");

exports.defaultOptions = _options.defaultOptions;

var _locutil = _dereq_("./locutil");

exports.Position = _locutil.Position;
exports.SourceLocation = _locutil.SourceLocation;
exports.getLineInfo = _locutil.getLineInfo;

var _node = _dereq_("./node");

exports.Node = _node.Node;

var _tokentype = _dereq_("./tokentype");

exports.TokenType = _tokentype.TokenType;
exports.tokTypes = _tokentype.types;

var _tokencontext = _dereq_("./tokencontext");

exports.TokContext = _tokencontext.TokContext;
exports.tokContexts = _tokencontext.types;

var _identifier = _dereq_("./identifier");

exports.isIdentifierChar = _identifier.isIdentifierChar;
exports.isIdentifierStart = _identifier.isIdentifierStart;

var _tokenize = _dereq_("./tokenize");

exports.Token = _tokenize.Token;

var _whitespace = _dereq_("./whitespace");

exports.isNewLine = _whitespace.isNewLine;
exports.lineBreak = _whitespace.lineBreak;
exports.lineBreakG = _whitespace.lineBreakG;
var version = "3.1.0";

exports.version = version;
// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new _state.Parser(options, input).parse();
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new _state.Parser(options, input, pos);
  p.nextToken();
  return p.parseExpression();
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new _state.Parser(options, input);
}

},{"./expression":1,"./identifier":2,"./location":4,"./locutil":5,"./lval":6,"./node":7,"./options":8,"./parseutil":9,"./state":10,"./statement":11,"./tokencontext":12,"./tokenize":13,"./tokentype":14,"./whitespace":16}],4:[function(_dereq_,module,exports){
"use strict";

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var pp = _state.Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp.raise = function (pos, message) {
  var loc = _locutil.getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos;err.loc = loc;err.raisedAt = this.pos;
  throw err;
};

pp.raiseRecoverable = pp.raise;

pp.curPosition = function () {
  if (this.options.locations) {
    return new _locutil.Position(this.curLine, this.pos - this.lineStart);
  }
};

},{"./locutil":5,"./state":10}],5:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.getLineInfo = getLineInfo;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _whitespace = _dereq_("./whitespace");

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = (function () {
  function Position(line, col) {
    _classCallCheck(this, Position);

    this.line = line;
    this.column = col;
  }

  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };

  return Position;
})();

exports.Position = Position;

var SourceLocation = function SourceLocation(p, start, end) {
  _classCallCheck(this, SourceLocation);

  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) this.source = p.sourceFile;
}

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

;

exports.SourceLocation = SourceLocation;

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    _whitespace.lineBreakG.lastIndex = cur;
    var match = _whitespace.lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur);
    }
  }
}

},{"./whitespace":16}],6:[function(_dereq_,module,exports){
"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _util = _dereq_("./util");

var pp = _state.Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp.toAssignable = function (node, isBinding) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
      case "ObjectPattern":
      case "ArrayPattern":
        break;

      case "ObjectExpression":
        node.type = "ObjectPattern";
        for (var i = 0; i < node.properties.length; i++) {
          var prop = node.properties[i];
          if (prop.kind !== "init") this.raise(prop.key.start, "Object pattern can't contain getter or setter");
          this.toAssignable(prop.value, isBinding);
        }
        break;

      case "ArrayExpression":
        node.type = "ArrayPattern";
        this.toAssignableList(node.elements, isBinding);
        break;

      case "AssignmentExpression":
        if (node.operator === "=") {
          node.type = "AssignmentPattern";
          delete node.operator;
          // falls through to AssignmentPattern
        } else {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
            break;
          }

      case "AssignmentPattern":
        if (node.right.type === "YieldExpression") this.raise(node.right.start, "Yield expression cannot be a default value");
        break;

      case "ParenthesizedExpression":
        node.expression = this.toAssignable(node.expression, isBinding);
        break;

      case "MemberExpression":
        if (!isBinding) break;

      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  }
  return node;
};

// Convert list of expression atoms to binding list.

pp.toAssignableList = function (exprList, isBinding) {
  var end = exprList.length;
  if (end) {
    var last = exprList[end - 1];
    if (last && last.type == "RestElement") {
      --end;
    } else if (last && last.type == "SpreadElement") {
      last.type = "RestElement";
      var arg = last.argument;
      this.toAssignable(arg, isBinding);
      if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern") this.unexpected(arg.start);
      --end;
    }

    if (isBinding && last.type === "RestElement" && last.argument.type !== "Identifier") this.unexpected(last.argument.start);
  }
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) this.toAssignable(elt, isBinding);
  }
  return exprList;
};

// Parses spread element.

pp.parseSpread = function (refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};

pp.parseRest = function (allowNonIdent) {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (allowNonIdent) node.argument = this.type === _tokentype.types.name ? this.parseIdent() : this.unexpected();else node.argument = this.type === _tokentype.types.name || this.type === _tokentype.types.bracketL ? this.parseBindingAtom() : this.unexpected();

  return this.finishNode(node, "RestElement");
};

// Parses lvalue (assignable) atom.

pp.parseBindingAtom = function () {
  if (this.options.ecmaVersion < 6) return this.parseIdent();
  switch (this.type) {
    case _tokentype.types.name:
      return this.parseIdent();

    case _tokentype.types.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(_tokentype.types.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern");

    case _tokentype.types.braceL:
      return this.parseObj(true);

    default:
      this.unexpected();
  }
};

pp.parseBindingList = function (close, allowEmpty, allowTrailingComma, allowNonIdent) {
  var elts = [],
      first = true;
  while (!this.eat(close)) {
    if (first) first = false;else this.expect(_tokentype.types.comma);
    if (allowEmpty && this.type === _tokentype.types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === _tokentype.types.ellipsis) {
      var rest = this.parseRest(allowNonIdent);
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === _tokentype.types.comma) this.raise(this.start, "Comma is not permitted after the rest element");
      this.expect(close);
      break;
    } else {
      var elem = this.parseMaybeDefault(this.start, this.startLoc);
      this.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts;
};

pp.parseBindingListItem = function (param) {
  return param;
};

// Parses assignment pattern around given atom if possible.

pp.parseMaybeDefault = function (startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(_tokentype.types.eq)) return left;
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};

// Verify that a node is an lval — something that can be assigned
// to.

pp.checkLVal = function (expr, isBinding, checkClashes) {
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      if (checkClashes) {
        if (_util.has(checkClashes, expr.name)) this.raiseRecoverable(expr.start, "Argument name clash");
        checkClashes[expr.name] = true;
      }
      break;

    case "MemberExpression":
      if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
      break;

    case "ObjectPattern":
      for (var i = 0; i < expr.properties.length; i++) {
        this.checkLVal(expr.properties[i].value, isBinding, checkClashes);
      }break;

    case "ArrayPattern":
      for (var i = 0; i < expr.elements.length; i++) {
        var elem = expr.elements[i];
        if (elem) this.checkLVal(elem, isBinding, checkClashes);
      }
      break;

    case "AssignmentPattern":
      this.checkLVal(expr.left, isBinding, checkClashes);
      break;

    case "RestElement":
      this.checkLVal(expr.argument, isBinding, checkClashes);
      break;

    case "ParenthesizedExpression":
      this.checkLVal(expr.expression, isBinding, checkClashes);
      break;

    default:
      this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
  }
};

},{"./state":10,"./tokentype":14,"./util":15}],7:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var Node = function Node(parser, pos, loc) {
  _classCallCheck(this, Node);

  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) this.loc = new _locutil.SourceLocation(parser, loc);
  if (parser.options.directSourceFile) this.sourceFile = parser.options.directSourceFile;
  if (parser.options.ranges) this.range = [pos, 0];
}

// Start an AST node, attaching a start offset.

;

exports.Node = Node;
var pp = _state.Parser.prototype;

pp.startNode = function () {
  return new Node(this, this.start, this.startLoc);
};

pp.startNodeAt = function (pos, loc) {
  return new Node(this, pos, loc);
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) node.loc.end = loc;
  if (this.options.ranges) node.range[1] = pos;
  return node;
}

pp.finishNode = function (node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};

// Finish node at given position

pp.finishNodeAt = function (node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};

},{"./locutil":5,"./state":10}],8:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.getOptions = getOptions;

var _util = _dereq_("./util");

var _locutil = _dereq_("./locutil");

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, or 5, or 6. This influences support for strict
  // mode, the set of reserved words, support for getters and
  // setters and other features. The default is 6.
  ecmaVersion: 6,
  // Source type ("script" or "module") for different semantics
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};

exports.defaultOptions = defaultOptions;
// Interpret and default an options object

function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && _util.has(opts, opt) ? opts[opt] : defaultOptions[opt];
  }if (options.allowReserved == null) options.allowReserved = options.ecmaVersion < 5;

  if (_util.isArray(options.onToken)) {
    (function () {
      var tokens = options.onToken;
      options.onToken = function (token) {
        return tokens.push(token);
      };
    })();
  }
  if (_util.isArray(options.onComment)) options.onComment = pushComment(options, options.onComment);

  return options;
}

function pushComment(options, array) {
  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? 'Block' : 'Line',
      value: text,
      start: start,
      end: end
    };
    if (options.locations) comment.loc = new _locutil.SourceLocation(this, startLoc, endLoc);
    if (options.ranges) comment.range = [start, end];
    array.push(comment);
  };
}

},{"./locutil":5,"./util":15}],9:[function(_dereq_,module,exports){
"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _whitespace = _dereq_("./whitespace");

var pp = _state.Parser.prototype;

// ## Parser utilities

// Test whether a statement node is the string literal `"use strict"`.

pp.isUseStrict = function (stmt) {
  return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" && stmt.expression.type === "Literal" && stmt.expression.raw.slice(1, -1) === "use strict";
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function (type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function (name) {
  return this.type === _tokentype.types.name && this.value === name;
};

// Consumes contextual keyword if possible.

pp.eatContextual = function (name) {
  return this.value === name && this.eat(_tokentype.types.name);
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function (name) {
  if (!this.eatContextual(name)) this.unexpected();
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function () {
  return this.type === _tokentype.types.eof || this.type === _tokentype.types.braceR || _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};

pp.insertSemicolon = function () {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    return true;
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function () {
  if (!this.eat(_tokentype.types.semi) && !this.insertSemicolon()) this.unexpected();
};

pp.afterTrailingComma = function (tokType) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma) this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    this.next();
    return true;
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function (type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function (pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

pp.checkPatternErrors = function (refDestructuringErrors, andThrow) {
  var pos = refDestructuringErrors && refDestructuringErrors.trailingComma;
  if (!andThrow) return !!pos;
  if (pos) this.raise(pos, "Comma is not permitted after the rest element");
};

pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
  var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign;
  if (!andThrow) return !!pos;
  if (pos) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
};

},{"./state":10,"./tokentype":14,"./whitespace":16}],10:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _identifier = _dereq_("./identifier");

var _tokentype = _dereq_("./tokentype");

var _whitespace = _dereq_("./whitespace");

var _options = _dereq_("./options");

// Registered plugins
var plugins = {};

exports.plugins = plugins;
function keywordRegexp(words) {
  return new RegExp("^(" + words.replace(/ /g, "|") + ")$");
}

var Parser = (function () {
  function Parser(options, input, startPos) {
    _classCallCheck(this, Parser);

    this.options = options = _options.getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = keywordRegexp(_identifier.keywords[options.ecmaVersion >= 6 ? 6 : 5]);
    var reserved = options.allowReserved ? "" : _identifier.reservedWords[options.ecmaVersion] + (options.sourceType == "module" ? " await" : "");
    this.reservedWords = keywordRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + _identifier.reservedWords.strict;
    this.reservedWordsStrict = keywordRegexp(reservedStrict);
    this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + _identifier.reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Load plugins
    this.loadPlugins(options.plugins);

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos));
      this.curLine = this.input.slice(0, this.lineStart).split(_whitespace.lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = _tokentype.types.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.strict = this.inModule = options.sourceType === "module";

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;

    // Flags to track whether we are in a function, a generator.
    this.inFunction = this.inGenerator = false;
    // Labels in scope.
    this.labels = [];

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!') this.skipLineComment(2);
  }

  // DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them

  Parser.prototype.isKeyword = function isKeyword(word) {
    return this.keywords.test(word);
  };

  Parser.prototype.isReservedWord = function isReservedWord(word) {
    return this.reservedWords.test(word);
  };

  Parser.prototype.extend = function extend(name, f) {
    this[name] = f(this[name]);
  };

  Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
    for (var _name in pluginConfigs) {
      var plugin = plugins[_name];
      if (!plugin) throw new Error("Plugin '" + _name + "' not found");
      plugin(this, pluginConfigs[_name]);
    }
  };

  Parser.prototype.parse = function parse() {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node);
  };

  return Parser;
})();

exports.Parser = Parser;

},{"./identifier":2,"./options":8,"./tokentype":14,"./whitespace":16}],11:[function(_dereq_,module,exports){
"use strict";

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _whitespace = _dereq_("./whitespace");

var _identifier = _dereq_("./identifier");

var pp = _state.Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp.parseTopLevel = function (node) {
  var first = true;
  if (!node.body) node.body = [];
  while (this.type !== _tokentype.types.eof) {
    var stmt = this.parseStatement(true, true);
    node.body.push(stmt);
    if (first) {
      if (this.isUseStrict(stmt)) this.setStrict(true);
      first = false;
    }
  }
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program");
};

var loopLabel = { kind: "loop" },
    switchLabel = { kind: "switch" };

pp.isLet = function () {
  if (this.type !== _tokentype.types.name || this.options.ecmaVersion < 6 || this.value != "let") return false;
  _whitespace.skipWhiteSpace.lastIndex = this.pos;
  var skip = _whitespace.skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length,
      nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh == 123) return true; // '{' and '['
  if (_identifier.isIdentifierStart(nextCh, true)) {
    for (var pos = next + 1; _identifier.isIdentifierChar(this.input.charCodeAt(pos, true)); ++pos) {}
    var ident = this.input.slice(next, pos);
    if (!this.isKeyword(ident)) return true;
  }
  return false;
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp.parseStatement = function (declaration, topLevel) {
  var starttype = this.type,
      node = this.startNode(),
      kind = undefined;

  if (this.isLet()) {
    starttype = _tokentype.types._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
    case _tokentype.types._break:case _tokentype.types._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case _tokentype.types._debugger:
      return this.parseDebuggerStatement(node);
    case _tokentype.types._do:
      return this.parseDoStatement(node);
    case _tokentype.types._for:
      return this.parseForStatement(node);
    case _tokentype.types._function:
      if (!declaration && this.options.ecmaVersion >= 6) this.unexpected();
      return this.parseFunctionStatement(node);
    case _tokentype.types._class:
      if (!declaration) this.unexpected();
      return this.parseClass(node, true);
    case _tokentype.types._if:
      return this.parseIfStatement(node);
    case _tokentype.types._return:
      return this.parseReturnStatement(node);
    case _tokentype.types._switch:
      return this.parseSwitchStatement(node);
    case _tokentype.types._throw:
      return this.parseThrowStatement(node);
    case _tokentype.types._try:
      return this.parseTryStatement(node);
    case _tokentype.types._const:case _tokentype.types._var:
      kind = kind || this.value;
      if (!declaration && kind != "var") this.unexpected();
      return this.parseVarStatement(node, kind);
    case _tokentype.types._while:
      return this.parseWhileStatement(node);
    case _tokentype.types._with:
      return this.parseWithStatement(node);
    case _tokentype.types.braceL:
      return this.parseBlock();
    case _tokentype.types.semi:
      return this.parseEmptyStatement(node);
    case _tokentype.types._export:
    case _tokentype.types._import:
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) this.raise(this.start, "'import' and 'export' may only appear at the top level");
        if (!this.inModule) this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
      }
      return starttype === _tokentype.types._import ? this.parseImport(node) : this.parseExport(node);

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
    default:
      var maybeName = this.value,
          expr = this.parseExpression();
      if (starttype === _tokentype.types.name && expr.type === "Identifier" && this.eat(_tokentype.types.colon)) return this.parseLabeledStatement(node, maybeName, expr);else return this.parseExpressionStatement(node, expr);
  }
};

pp.parseBreakContinueStatement = function (node, keyword) {
  var isBreak = keyword == "break";
  this.next();
  if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.label = null;else if (this.type !== _tokentype.types.name) this.unexpected();else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  for (var i = 0; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
      if (node.label && isBreak) break;
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword);
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};

pp.parseDebuggerStatement = function (node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};

pp.parseDoStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(_tokentype.types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) this.eat(_tokentype.types.semi);else this.semicolon();
  return this.finishNode(node, "DoWhileStatement");
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp.parseForStatement = function (node) {
  this.next();
  this.labels.push(loopLabel);
  this.expect(_tokentype.types.parenL);
  if (this.type === _tokentype.types.semi) return this.parseFor(node, null);
  var isLet = this.isLet();
  if (this.type === _tokentype.types._var || this.type === _tokentype.types._const || isLet) {
    var _init = this.startNode(),
        kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(_init, true, kind);
    this.finishNode(_init, "VariableDeclaration");
    if ((this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && _init.declarations.length === 1 && !(kind !== "var" && _init.declarations[0].init)) return this.parseForIn(node, _init);
    return this.parseFor(node, _init);
  }
  var refDestructuringErrors = { shorthandAssign: 0, trailingComma: 0 };
  var init = this.parseExpression(true, refDestructuringErrors);
  if (this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) {
    this.checkPatternErrors(refDestructuringErrors, true);
    this.toAssignable(init);
    this.checkLVal(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  return this.parseFor(node, init);
};

pp.parseFunctionStatement = function (node) {
  this.next();
  return this.parseFunction(node, true);
};

pp.parseIfStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement(false);
  node.alternate = this.eat(_tokentype.types._else) ? this.parseStatement(false) : null;
  return this.finishNode(node, "IfStatement");
};

pp.parseReturnStatement = function (node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction) this.raise(this.start, "'return' outside of function");
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(_tokentype.types.semi) || this.insertSemicolon()) node.argument = null;else {
    node.argument = this.parseExpression();this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};

pp.parseSwitchStatement = function (node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(_tokentype.types.braceL);
  this.labels.push(switchLabel);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  for (var cur, sawDefault = false; this.type != _tokentype.types.braceR;) {
    if (this.type === _tokentype.types._case || this.type === _tokentype.types._default) {
      var isCase = this.type === _tokentype.types._case;
      if (cur) this.finishNode(cur, "SwitchCase");
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        sawDefault = true;
        cur.test = null;
      }
      this.expect(_tokentype.types.colon);
    } else {
      if (!cur) this.unexpected();
      cur.consequent.push(this.parseStatement(true));
    }
  }
  if (cur) this.finishNode(cur, "SwitchCase");
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};

pp.parseThrowStatement = function (node) {
  this.next();
  if (_whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) this.raise(this.lastTokEnd, "Illegal newline after throw");
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp.parseTryStatement = function (node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === _tokentype.types._catch) {
    var clause = this.startNode();
    this.next();
    this.expect(_tokentype.types.parenL);
    clause.param = this.parseBindingAtom();
    this.checkLVal(clause.param, true);
    this.expect(_tokentype.types.parenR);
    clause.body = this.parseBlock();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(_tokentype.types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) this.raise(node.start, "Missing catch or finally clause");
  return this.finishNode(node, "TryStatement");
};

pp.parseVarStatement = function (node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};

pp.parseWhileStatement = function (node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};

pp.parseWithStatement = function (node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode");
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement");
};

pp.parseEmptyStatement = function (node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};

pp.parseLabeledStatement = function (node, maybeName, expr) {
  for (var i = 0; i < this.labels.length; ++i) {
    if (this.labels[i].name === maybeName) this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  }var kind = this.type.isLoop ? "loop" : this.type === _tokentype.types._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label = this.labels[i];
    if (label.statementStart == node.start) {
      label.statementStart = this.start;
      label.kind = kind;
    } else break;
  }
  this.labels.push({ name: maybeName, kind: kind, statementStart: this.start });
  node.body = this.parseStatement(true);
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};

pp.parseExpressionStatement = function (node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp.parseBlock = function (allowStrict) {
  var node = this.startNode(),
      first = true,
      oldStrict = undefined;
  node.body = [];
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    var stmt = this.parseStatement(true);
    node.body.push(stmt);
    if (first && allowStrict && this.isUseStrict(stmt)) {
      oldStrict = this.strict;
      this.setStrict(this.strict = true);
    }
    first = false;
  }
  if (oldStrict === false) this.setStrict(false);
  return this.finishNode(node, "BlockStatement");
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp.parseFor = function (node, init) {
  node.init = init;
  this.expect(_tokentype.types.semi);
  node.test = this.type === _tokentype.types.semi ? null : this.parseExpression();
  this.expect(_tokentype.types.semi);
  node.update = this.type === _tokentype.types.parenR ? null : this.parseExpression();
  this.expect(_tokentype.types.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp.parseForIn = function (node, init) {
  var type = this.type === _tokentype.types._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  node.left = init;
  node.right = this.parseExpression();
  this.expect(_tokentype.types.parenR);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type);
};

// Parse a list of variable declarations.

pp.parseVar = function (node, isFor, kind) {
  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl);
    if (this.eat(_tokentype.types.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this.type === _tokentype.types._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (decl.id.type != "Identifier" && !(isFor && (this.type === _tokentype.types._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(_tokentype.types.comma)) break;
  }
  return node;
};

pp.parseVarId = function (decl) {
  decl.id = this.parseBindingAtom();
  this.checkLVal(decl.id, true);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp.parseFunction = function (node, isStatement, allowExpressionBody) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) node.generator = this.eat(_tokentype.types.star);
  var oldInGen = this.inGenerator;
  this.inGenerator = node.generator;
  if (isStatement || this.type === _tokentype.types.name) node.id = this.parseIdent();
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);
  this.inGenerator = oldInGen;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
};

pp.parseFunctionParams = function (node) {
  this.expect(_tokentype.types.parenL);
  node.params = this.parseBindingList(_tokentype.types.parenR, false, false, true);
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp.parseClass = function (node, isStatement) {
  this.next();
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (this.eat(_tokentype.types.semi)) continue;
    var method = this.startNode();
    var isGenerator = this.eat(_tokentype.types.star);
    var isMaybeStatic = this.type === _tokentype.types.name && this.value === "static";
    this.parsePropertyName(method);
    method["static"] = isMaybeStatic && this.type !== _tokentype.types.parenL;
    if (method["static"]) {
      if (isGenerator) this.unexpected();
      isGenerator = this.eat(_tokentype.types.star);
      this.parsePropertyName(method);
    }
    method.kind = "method";
    var isGetSet = false;
    if (!method.computed) {
      var key = method.key;

      if (!isGenerator && key.type === "Identifier" && this.type !== _tokentype.types.parenL && (key.name === "get" || key.name === "set")) {
        isGetSet = true;
        method.kind = key.name;
        key = this.parsePropertyName(method);
      }
      if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" || key.type === "Literal" && key.value === "constructor")) {
        if (hadConstructor) this.raise(key.start, "Duplicate constructor in the same class");
        if (isGetSet) this.raise(key.start, "Constructor can't have get/set modifier");
        if (isGenerator) this.raise(key.start, "Constructor can't be a generator");
        method.kind = "constructor";
        hadConstructor = true;
      }
    }
    this.parseClassMethod(classBody, method, isGenerator);
    if (isGetSet) {
      var paramCount = method.kind === "get" ? 0 : 1;
      if (method.value.params.length !== paramCount) {
        var start = method.value.start;
        if (method.kind === "get") this.raiseRecoverable(start, "getter should have no params");else this.raiseRecoverable(start, "setter should have exactly one param");
      }
      if (method.kind === "set" && method.value.params[0].type === "RestElement") this.raise(method.value.params[0].start, "Setter cannot use rest params");
    }
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};

pp.parseClassMethod = function (classBody, method, isGenerator) {
  method.value = this.parseMethod(isGenerator);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp.parseClassId = function (node, isStatement) {
  node.id = this.type === _tokentype.types.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
};

pp.parseClassSuper = function (node) {
  node.superClass = this.eat(_tokentype.types._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp.parseExport = function (node) {
  this.next();
  // export * from '...'
  if (this.eat(_tokentype.types.star)) {
    this.expectContextual("from");
    node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  }
  if (this.eat(_tokentype.types._default)) {
    // export default ...
    var parens = this.type == _tokentype.types.parenL;
    var expr = this.parseMaybeAssign();
    var needsSemi = true;
    if (!parens && (expr.type == "FunctionExpression" || expr.type == "ClassExpression")) {
      needsSemi = false;
      if (expr.id) {
        expr.type = expr.type == "FunctionExpression" ? "FunctionDeclaration" : "ClassDeclaration";
      }
    }
    node.declaration = expr;
    if (needsSemi) this.semicolon();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    node.specifiers = [];
    node.source = null;
  } else {
    // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers();
    if (this.eatContextual("from")) {
      node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
    } else {
      // check for keywords used as local names
      for (var i = 0; i < node.specifiers.length; i++) {
        if (this.keywords.test(node.specifiers[i].local.name) || this.reservedWords.test(node.specifiers[i].local.name)) {
          this.unexpected(node.specifiers[i].local.start);
        }
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};

pp.shouldParseExportStatement = function () {
  return this.type.keyword || this.isLet();
};

// Parses a comma-separated list of module exports.

pp.parseExportSpecifiers = function () {
  var nodes = [],
      first = true;
  // export { x, y as z } [from '...']
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.local = this.parseIdent(this.type === _tokentype.types._default);
    node.exported = this.eatContextual("as") ? this.parseIdent(true) : node.local;
    nodes.push(this.finishNode(node, "ExportSpecifier"));
  }
  return nodes;
};

// Parses import declaration.

pp.parseImport = function (node) {
  this.next();
  // import '...'
  if (this.type === _tokentype.types.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === _tokentype.types.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};

// Parses a comma-separated list of module imports.

pp.parseImportSpecifiers = function () {
  var nodes = [],
      first = true;
  if (this.type === _tokentype.types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(_tokentype.types.comma)) return nodes;
  }
  if (this.type === _tokentype.types.star) {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportNamespaceSpecifier"));
    return nodes;
  }
  this.expect(_tokentype.types.braceL);
  while (!this.eat(_tokentype.types.braceR)) {
    if (!first) {
      this.expect(_tokentype.types.comma);
      if (this.afterTrailingComma(_tokentype.types.braceR)) break;
    } else first = false;

    var node = this.startNode();
    node.imported = this.parseIdent(true);
    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      node.local = node.imported;
      if (this.isKeyword(node.local.name)) this.unexpected(node.local.start);
      if (this.reservedWordsStrict.test(node.local.name)) this.raise(node.local.start, "The keyword '" + node.local.name + "' is reserved");
    }
    this.checkLVal(node.local, true);
    nodes.push(this.finishNode(node, "ImportSpecifier"));
  }
  return nodes;
};

},{"./identifier":2,"./state":10,"./tokentype":14,"./whitespace":16}],12:[function(_dereq_,module,exports){
// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _state = _dereq_("./state");

var _tokentype = _dereq_("./tokentype");

var _whitespace = _dereq_("./whitespace");

var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
  _classCallCheck(this, TokContext);

  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
};

exports.TokContext = TokContext;
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", true),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) {
    return p.readTmplToken();
  }),
  f_expr: new TokContext("function", true)
};

exports.types = types;
var pp = _state.Parser.prototype;

pp.initialContext = function () {
  return [types.b_stat];
};

pp.braceIsBlock = function (prevType) {
  if (prevType === _tokentype.types.colon) {
    var _parent = this.curContext();
    if (_parent === types.b_stat || _parent === types.b_expr) return !_parent.isExpr;
  }
  if (prevType === _tokentype.types._return) return _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  if (prevType === _tokentype.types._else || prevType === _tokentype.types.semi || prevType === _tokentype.types.eof || prevType === _tokentype.types.parenR) return true;
  if (prevType == _tokentype.types.braceL) return this.curContext() === types.b_stat;
  return !this.exprAllowed;
};

pp.updateContext = function (prevType) {
  var update = undefined,
      type = this.type;
  if (type.keyword && prevType == _tokentype.types.dot) this.exprAllowed = false;else if (update = type.updateContext) update.call(this, prevType);else this.exprAllowed = type.beforeExpr;
};

// Token-specific context update code

_tokentype.types.parenR.updateContext = _tokentype.types.braceR.updateContext = function () {
  if (this.context.length == 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext() === types.f_expr) {
    this.context.pop();
    this.exprAllowed = false;
  } else if (out === types.b_tmpl) {
    this.exprAllowed = true;
  } else {
    this.exprAllowed = !out.isExpr;
  }
};

_tokentype.types.braceL.updateContext = function (prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

_tokentype.types.dollarBraceL.updateContext = function () {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

_tokentype.types.parenL.updateContext = function (prevType) {
  var statementParens = prevType === _tokentype.types._if || prevType === _tokentype.types._for || prevType === _tokentype.types._with || prevType === _tokentype.types._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

_tokentype.types.incDec.updateContext = function () {
  // tokExprAllowed stays unchanged
};

_tokentype.types._function.updateContext = function (prevType) {
  if (prevType.beforeExpr && prevType !== _tokentype.types.semi && prevType !== _tokentype.types._else && (prevType !== _tokentype.types.colon || this.curContext() !== types.b_stat)) this.context.push(types.f_expr);
  this.exprAllowed = false;
};

_tokentype.types.backQuote.updateContext = function () {
  if (this.curContext() === types.q_tmpl) this.context.pop();else this.context.push(types.q_tmpl);
  this.exprAllowed = false;
};

},{"./state":10,"./tokentype":14,"./whitespace":16}],13:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _identifier = _dereq_("./identifier");

var _tokentype = _dereq_("./tokentype");

var _state = _dereq_("./state");

var _locutil = _dereq_("./locutil");

var _whitespace = _dereq_("./whitespace");

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  _classCallCheck(this, Token);

  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) this.loc = new _locutil.SourceLocation(p, p.startLoc, p.endLoc);
  if (p.options.ranges) this.range = [p.start, p.end];
}

// ## Tokenizer

;

exports.Token = Token;
var pp = _state.Parser.prototype;

// Are we running under Rhino?
var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";

// Move to the next token

pp.next = function () {
  if (this.options.onToken) this.options.onToken(new Token(this));

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function () {
  this.next();
  return new Token(this);
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined") pp[Symbol.iterator] = function () {
  var self = this;
  return { next: function next() {
      var token = self.getToken();
      return {
        done: token.type === _tokentype.types.eof,
        value: token
      };
    } };
};

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp.setStrict = function (strict) {
  this.strict = strict;
  if (this.type !== _tokentype.types.num && this.type !== _tokentype.types.string) return;
  this.pos = this.start;
  if (this.options.locations) {
    while (this.pos < this.lineStart) {
      this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1;
      --this.curLine;
    }
  }
  this.nextToken();
};

pp.curContext = function () {
  return this.context[this.context.length - 1];
};

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function () {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) this.skipSpace();

  this.start = this.pos;
  if (this.options.locations) this.startLoc = this.curPosition();
  if (this.pos >= this.input.length) return this.finishToken(_tokentype.types.eof);

  if (curContext.override) return curContext.override(this);else this.readToken(this.fullCharCodeAtPos());
};

pp.readToken = function (code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (_identifier.isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */) return this.readWord();

  return this.getTokenFromCode(code);
};

pp.fullCharCodeAtPos = function () {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xe000) return code;
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 0x35fdc00;
};

pp.skipBlockComment = function () {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos,
      end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment");
  this.pos = end + 2;
  if (this.options.locations) {
    _whitespace.lineBreakG.lastIndex = start;
    var match = undefined;
    while ((match = _whitespace.lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this.curLine;
      this.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment) this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
};

pp.skipLineComment = function (startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
    ++this.pos;
    ch = this.input.charCodeAt(this.pos);
  }
  if (this.options.onComment) this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function () {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
      case 32:case 160:
        // ' '
        ++this.pos;
        break;
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10:case 8232:case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break;
      case 47:
        // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
          case 42:
            // '*'
            this.skipBlockComment();
            break;
          case 47:
            this.skipLineComment(2);
            break;
          default:
            break loop;
        }
        break;
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && _whitespace.nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop;
        }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function (type, val) {
  this.end = this.pos;
  if (this.options.locations) this.endLoc = this.curPosition();
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function () {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) return this.readNumber(true);
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(_tokentype.types.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(_tokentype.types.dot);
  }
};

pp.readToken_slash = function () {
  // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;return this.readRegexp();
  }
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.slash, 1);
};

pp.readToken_mult_modulo_exp = function (code) {
  // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? _tokentype.types.star : _tokentype.types.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && next === 42) {
    ++size;
    tokentype = _tokentype.types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) return this.finishOp(_tokentype.types.assign, size + 1);
  return this.finishOp(tokentype, size);
};

pp.readToken_pipe_amp = function (code) {
  // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) return this.finishOp(code === 124 ? _tokentype.types.logicalOR : _tokentype.types.logicalAND, 2);
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(code === 124 ? _tokentype.types.bitwiseOR : _tokentype.types.bitwiseAND, 1);
};

pp.readToken_caret = function () {
  // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.bitwiseXOR, 1);
};

pp.readToken_plus_min = function (code) {
  // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 && _whitespace.lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(_tokentype.types.incDec, 2);
  }
  if (next === 61) return this.finishOp(_tokentype.types.assign, 2);
  return this.finishOp(_tokentype.types.plusMin, 1);
};

pp.readToken_lt_gt = function (code) {
  // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(_tokentype.types.assign, size + 1);
    return this.finishOp(_tokentype.types.bitShift, size);
  }
  if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 && this.input.charCodeAt(this.pos + 3) == 45) {
    if (this.inModule) this.unexpected();
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) size = 2;
  return this.finishOp(_tokentype.types.relational, size);
};

pp.readToken_eq_excl = function (code) {
  // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) return this.finishOp(_tokentype.types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    // '=>'
    this.pos += 2;
    return this.finishToken(_tokentype.types.arrow);
  }
  return this.finishOp(code === 61 ? _tokentype.types.eq : _tokentype.types.prefix, 1);
};

pp.getTokenFromCode = function (code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      // '.'
      return this.readToken_dot();

    // Punctuation tokens.
    case 40:
      ++this.pos;return this.finishToken(_tokentype.types.parenL);
    case 41:
      ++this.pos;return this.finishToken(_tokentype.types.parenR);
    case 59:
      ++this.pos;return this.finishToken(_tokentype.types.semi);
    case 44:
      ++this.pos;return this.finishToken(_tokentype.types.comma);
    case 91:
      ++this.pos;return this.finishToken(_tokentype.types.bracketL);
    case 93:
      ++this.pos;return this.finishToken(_tokentype.types.bracketR);
    case 123:
      ++this.pos;return this.finishToken(_tokentype.types.braceL);
    case 125:
      ++this.pos;return this.finishToken(_tokentype.types.braceR);
    case 58:
      ++this.pos;return this.finishToken(_tokentype.types.colon);
    case 63:
      ++this.pos;return this.finishToken(_tokentype.types.question);

    case 96:
      // '`'
      if (this.options.ecmaVersion < 6) break;
      ++this.pos;
      return this.finishToken(_tokentype.types.backQuote);

    case 48:
      // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) return this.readRadixNumber(16); // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) return this.readRadixNumber(8); // '0o', '0O' - octal number
        if (next === 98 || next === 66) return this.readRadixNumber(2); // '0b', '0B' - binary number
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
      // 1-9
      return this.readNumber(false);

    // Quotes produce strings.
    case 34:case 39:
      // '"', "'"
      return this.readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47:
      // '/'
      return this.readToken_slash();

    case 37:case 42:
      // '%*'
      return this.readToken_mult_modulo_exp(code);

    case 124:case 38:
      // '|&'
      return this.readToken_pipe_amp(code);

    case 94:
      // '^'
      return this.readToken_caret();

    case 43:case 45:
      // '+-'
      return this.readToken_plus_min(code);

    case 60:case 62:
      // '<>'
      return this.readToken_lt_gt(code);

    case 61:case 33:
      // '=!'
      return this.readToken_eq_excl(code);

    case 126:
      // '~'
      return this.finishOp(_tokentype.types.prefix, 1);
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function (type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

function tryCreateRegexp(src, flags, throwErrorAt, parser) {
  try {
    return new RegExp(src, flags);
  } catch (e) {
    if (throwErrorAt !== undefined) {
      if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
      throw e;
    }
  }
}

var regexpUnicodeSupport = !!tryCreateRegexp("￿", "u");

pp.readRegexp = function () {
  var _this = this;

  var escaped = undefined,
      inClass = undefined,
      start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(start, "Unterminated regular expression");
    var ch = this.input.charAt(this.pos);
    if (_whitespace.lineBreak.test(ch)) this.raise(start, "Unterminated regular expression");
    if (!escaped) {
      if (ch === "[") inClass = true;else if (ch === "]" && inClass) inClass = false;else if (ch === "/" && !inClass) break;
      escaped = ch === "\\";
    } else escaped = false;
    ++this.pos;
  }
  var content = this.input.slice(start, this.pos);
  ++this.pos;
  // Need to use `readWord1` because '\uXXXX' sequences are allowed
  // here (don't ask).
  var mods = this.readWord1();
  var tmp = content;
  if (mods) {
    var validFlags = /^[gim]*$/;
    if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/;
    if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag");
    if (mods.indexOf('u') >= 0 && !regexpUnicodeSupport) {
      // Replace each astral symbol and every Unicode escape sequence that
      // possibly represents an astral symbol or a paired surrogate with a
      // single ASCII symbol to avoid throwing on regular expressions that
      // are only valid in combination with the `/u` flag.
      // Note: replacing with the ASCII symbol `x` might cause false
      // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
      // perfectly valid pattern that is equivalent to `[a-b]`, but it would
      // be replaced by `[x-b]` which throws an error.
      tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
        code = Number("0x" + code);
        if (code > 0x10FFFF) _this.raise(start + offset + 3, "Code point out of bounds");
        return "x";
      });
      tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
    }
  }
  // Detect invalid regular expressions.
  var value = null;
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    tryCreateRegexp(tmp, undefined, start, this);
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    value = tryCreateRegexp(content, mods);
  }
  return this.finishToken(_tokentype.types.regexp, { pattern: content, flags: mods, value: value });
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function (radix, len) {
  var start = this.pos,
      total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this.input.charCodeAt(this.pos),
        val = undefined;
    if (code >= 97) val = code - 97 + 10; // a
    else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
        else val = Infinity;
    if (val >= radix) break;
    ++this.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) return null;

  return total;
};

pp.readRadixNumber = function (radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix);
  if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");
  return this.finishToken(_tokentype.types.num, val);
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function (startsWithDot) {
  var start = this.pos,
      isFloat = false,
      octal = this.input.charCodeAt(this.pos) === 48;
  if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number");
  var next = this.input.charCodeAt(this.pos);
  if (next === 46) {
    // '.'
    ++this.pos;
    this.readInt(10);
    isFloat = true;
    next = this.input.charCodeAt(this.pos);
  }
  if (next === 69 || next === 101) {
    // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) ++this.pos; // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number");
    isFloat = true;
  }
  if (_identifier.isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number");

  var str = this.input.slice(start, this.pos),
      val = undefined;
  if (isFloat) val = parseFloat(str);else if (!octal || str.length === 1) val = parseInt(str, 10);else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number");else val = parseInt(str, 8);
  return this.finishToken(_tokentype.types.num, val);
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function () {
  var ch = this.input.charCodeAt(this.pos),
      code = undefined;

  if (ch === 123) {
    if (this.options.ecmaVersion < 6) this.unexpected();
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds");
  } else {
    code = this.readHexChar(4);
  }
  return code;
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code);
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
}

pp.readString = function (quote) {
  var out = "",
      chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated string constant");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) break;
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else {
      if (_whitespace.isNewLine(ch)) this.raise(this.start, "Unterminated string constant");
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(_tokentype.types.string, out);
};

// Reads template string tokens.

pp.readTmplToken = function () {
  var out = "",
      chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) this.raise(this.start, "Unterminated template");
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      // '`', '${'
      if (this.pos === this.start && this.type === _tokentype.types.template) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(_tokentype.types.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(_tokentype.types.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(_tokentype.types.template, out);
    }
    if (ch === 92) {
      // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (_whitespace.isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) ++this.pos;
        case 10:
          out += "\n";
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Used to read escaped characters

pp.readEscapedChar = function (inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return "\n"; // 'n' -> '\n'
    case 114:
      return "\r"; // 'r' -> '\r'
    case 120:
      return String.fromCharCode(this.readHexChar(2)); // 'x'
    case 117:
      return codePointToString(this.readCodePoint()); // 'u'
    case 116:
      return "\t"; // 't' -> '\t'
    case 98:
      return "\b"; // 'b' -> '\b'
    case 118:
      return "\u000b"; // 'v' -> '\u000b'
    case 102:
      return "\f"; // 'f' -> '\f'
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) ++this.pos; // '\r\n'
    case 10:
      // ' \n'
      if (this.options.locations) {
        this.lineStart = this.pos;++this.curLine;
      }
      return "";
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        if (octalStr !== "0" && (this.strict || inTemplate)) {
          this.raise(this.pos - 2, "Octal literal in strict mode");
        }
        this.pos += octalStr.length - 1;
        return String.fromCharCode(octal);
      }
      return String.fromCharCode(ch);
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function (len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) this.raise(codePos, "Bad character escape sequence");
  return n;
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function () {
  this.containsEsc = false;
  var word = "",
      first = true,
      chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (_identifier.isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) {
      // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) != 117) // "u"
        this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? _identifier.isIdentifierStart : _identifier.isIdentifierChar)(esc, astral)) this.raise(escStart, "Invalid Unicode escape");
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function () {
  var word = this.readWord1();
  var type = _tokentype.types.name;
  if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word)) type = _tokentype.keywords[word];
  return this.finishToken(type, word);
};

},{"./identifier":2,"./locutil":5,"./state":10,"./tokentype":14,"./whitespace":16}],14:[function(_dereq_,module,exports){
// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokenType = function TokenType(label) {
  var conf = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  _classCallCheck(this, TokenType);

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

exports.TokenType = TokenType;

function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true },
    startsExpr = { startsExpr: true };

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=", 6),
  relational: binop("</>", 7),
  bitShift: binop("<</>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true })
};

exports.types = types;
// Map keyword names to token types.

var keywords = {};

exports.keywords = keywords;
// Succinct definitions of keyword token types
function kw(name) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  options.keyword = name;
  keywords[name] = types["_" + name] = new TokenType(name, options);
}

kw("break");
kw("case", beforeExpr);
kw("catch");
kw("continue");
kw("debugger");
kw("default", beforeExpr);
kw("do", { isLoop: true, beforeExpr: true });
kw("else", beforeExpr);
kw("finally");
kw("for", { isLoop: true });
kw("function", startsExpr);
kw("if");
kw("return", beforeExpr);
kw("switch");
kw("throw", beforeExpr);
kw("try");
kw("var");
kw("const");
kw("while", { isLoop: true });
kw("with");
kw("new", { beforeExpr: true, startsExpr: true });
kw("this", startsExpr);
kw("super", startsExpr);
kw("class");
kw("extends", beforeExpr);
kw("export");
kw("import");
kw("null", startsExpr);
kw("true", startsExpr);
kw("false", startsExpr);
kw("in", { beforeExpr: true, binop: 7 });
kw("instanceof", { beforeExpr: true, binop: 7 });
kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true });
kw("void", { beforeExpr: true, prefix: true, startsExpr: true });
kw("delete", { beforeExpr: true, prefix: true, startsExpr: true });

},{}],15:[function(_dereq_,module,exports){
"use strict";

exports.__esModule = true;
exports.isArray = isArray;
exports.has = has;

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

// Checks if an object has a property.

function has(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

},{}],16:[function(_dereq_,module,exports){
// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

"use strict";

exports.__esModule = true;
exports.isNewLine = isNewLine;
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
exports.lineBreak = lineBreak;
var lineBreakG = new RegExp(lineBreak.source, "g");

exports.lineBreakG = lineBreakG;

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code == 0x2029;
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

exports.nonASCIIwhitespace = nonASCIIwhitespace;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
exports.skipWhiteSpace = skipWhiteSpace;

},{}]},{},[3])(3)
});
/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.Constants !== 'undefined') {
        return;
    }
    var Constants = sandbox.Constants = {};

    Constants.isBrowser = !(typeof exports !== 'undefined' && this.exports !== exports);

    var APPLY = Constants.APPLY = Function.prototype.apply;
    var CALL = Constants.CALL = Function.prototype.call;
    APPLY.apply = APPLY;
    APPLY.call = CALL;
    CALL.apply = APPLY;
    CALL.call = CALL;

    var HAS_OWN_PROPERTY = Constants.HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
    Constants.HAS_OWN_PROPERTY_CALL = Object.prototype.hasOwnProperty.call;


    var PREFIX1 = Constants.JALANGI_VAR = "J$";
    Constants.SPECIAL_PROP = "*" + PREFIX1 + "*";
    Constants.SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
    Constants.SPECIAL_PROP3 = "*" + PREFIX1 + "C*";
    Constants.SPECIAL_PROP4 = "*" + PREFIX1 + "W*";
    Constants.SPECIAL_PROP_SID = "*" + PREFIX1 + "SID*";
    Constants.SPECIAL_PROP_IID = "*" + PREFIX1 + "IID*";

    Constants.UNKNOWN = -1;

    //-------------------------------- End constants ---------------------------------

    //-------------------------------------- Constant functions -----------------------------------------------------------

    var HOP = Constants.HOP = function (obj, prop) {
        return (prop + "" === '__proto__') || CALL.call(HAS_OWN_PROPERTY, obj, prop); //Constants.HAS_OWN_PROPERTY_CALL.apply(Constants.HAS_OWN_PROPERTY, [obj, prop]);
    };

    Constants.hasGetterSetter = function (obj, prop, isGetter) {
        if (typeof Object.getOwnPropertyDescriptor !== 'function') {
            return true;
        }
        while (obj !== null) {
            if (typeof obj !== 'object' && typeof obj !== 'function') {
                return false;
            }
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            if (desc !== undefined) {
                if (isGetter && typeof desc.get === 'function') {
                    return true;
                }
                if (!isGetter && typeof desc.set === 'function') {
                    return true;
                }
            } else if (HOP(obj, prop)) {
                return false;
            }
            obj = obj.__proto__;
        }
        return false;
    };

    Constants.debugPrint = function (s) {
        if (sandbox.Config.DEBUG) {
            console.log("***" + s);
        }
    };

    Constants.warnPrint = function (iid, s) {
        if (sandbox.Config.WARN && iid !== 0) {
            console.log("        at " + iid + " " + s);
        }
    };

    Constants.seriousWarnPrint = function (iid, s) {
        if (sandbox.Config.SERIOUS_WARN && iid !== 0) {
            console.log("        at " + iid + " Serious " + s);
        }
    };

})(J$);


/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.Config !== 'undefined') {
        return;
    }

    var Config = sandbox.Config = {};

    Config.DEBUG = false;
    Config.WARN = false;
    Config.SERIOUS_WARN = false;
// make MAX_BUF_SIZE slightly less than 2^16, to allow over low-level overheads
    Config.MAX_BUF_SIZE = 64000;
    Config.LOG_ALL_READS_AND_BRANCHES = false;

    //**********************************************************
    //  Functions for selective instrumentation of operations
    //**********************************************************
    // In the following functions
    // return true in a function, if you want the ast node (passed as the second argument) to be instrumented
    // ast node gets instrumented if you do not define the corresponding function
    Config.ENABLE_SAMPLING = false;
//    Config.INSTR_INIT = function(name, ast) { return false; };
//    Config.INSTR_READ = function(name, ast) { return false; };
//    Config.INSTR_WRITE = function(name, ast) { return true; };
//    Config.INSTR_GETFIELD = function(offset, ast) { return true; }; // offset is null if the property is computed
//    Config.INSTR_PUTFIELD = function(offset, ast) { return true; }; // offset is null if the property is computed
//    Config.INSTR_BINARY = function(operator, ast) { return true; };
//    Config.INSTR_PROPERTY_BINARY_ASSIGNMENT = function(operator, offset, ast) { return true; }; // a.x += e or a[e1] += e2
//    Config.INSTR_UNARY = function(operator, ast) { return true; };
//    Config.INSTR_LITERAL = function(literal, ast) { return true;}; // literal gets some dummy value if the type is object, function, or array
//    Config.INSTR_CONDITIONAL = function(type, ast) { return true; }; // type could be "&&", "||", "switch", "other"
//    Config.INSTR_TRY_CATCH_ARGUMENTS = function(ast) {return false; }; // wrap function and script bodies with try catch block and use arguments in J$.Fe.  DO NOT USE THIS.
//    Config.INSTR_END_EXPRESSION = function(ast) {return true; }; // top-level expression marker
}(J$));

/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen
// Author: Manu Sridharan

/*jslint node: true */
/*global window */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    var astUtil = sandbox.astUtil;
    if (typeof astUtil !== 'undefined') {
        return;
    } else {
        astUtil = sandbox.astUtil = {};
    }

    var Constants = sandbox.Constants;
    var HOP = Constants.HOP;
    var JALANGI_VAR = Constants.JALANGI_VAR;

    /**
     * information on surrounding AST context, to be used by visitors passed
     * to transformAst()
     */
    var CONTEXT = {
        // TODO what is this?
        RHS:1,
        // TODO what is this?
        IGNORE:2,
        // inside the properties of an ObjectExpression
        OEXP:3,
        // inside the formal parameters of a FunctionDeclaration or FunctionExpression
        PARAMS:4,
        // TODO what is this?
        OEXP2:5,
        // inside a getter
        GETTER:6,
        // inside a setter
        SETTER:7,

        TYPEOF:8
    };

    /**
     * invoked by transformAst() to see if a sub-ast should be ignored.  For now,
     * only ignoring calls to J$.I()
     */
    function ignoreSubAst(node) {
        return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' && node.callee.object.name === JALANGI_VAR &&
            node.callee.property.type === 'Identifier' && node.callee.property.name === 'I';
    }

    /**
     * generic AST visitor that allows for AST transformation.
     *
     * @param object the root AST node to be visited
     * @param visitorPost an object defining visitor methods to be executed after a node's children
     * have been visited.  The properties of visitorPost should be named with AST node types, and the
     * property values should be functions that take the node to be visited and a context value (see
     * the CONTEXT object above).  E.g., a post-visitor could be:
     * { 'AssignmentExpression': function (node, context) {
     *      // node.type === 'AssignmentExpression'
     *   }
     * }
     * The value returned by the visitorPost method for a node will replace the node in the AST.
     * @param visitorPre an object defining visitor methods to be executed before a node's children
     * have been visited.  Structure should be similar to visitorPost (see above).  The return value
     * of visitorPre functions is ignored.
     * @param context the context of the surrounding AST; see the CONTEXT object above
     * @param {boolean?} noIgnore if true, no sub-ast will be ignored.  Otherwise, sub-ASTs will be ignored
     * if ignoreAST() returns true.
     */
    function transformAst(object, visitorPost, visitorPre, context, noIgnore) {
        var key, child, type, ret, newContext;

        type = object.type;
        if (visitorPre && HOP(visitorPre, type)) {
            visitorPre[type](object, context);
        }

        for (key in object) {
//            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null && key !== "scope" && (noIgnore || !ignoreSubAst(object))) {
                    if ((type === 'AssignmentExpression' && key === 'left') ||
                        (type === 'UpdateExpression' && key === 'argument') ||
                        (type === 'UnaryExpression' && key === 'argument' && object.operator === 'delete') ||
                        (type === 'ForInStatement' && key === 'left') ||
                        ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'id') ||
                        (type === 'LabeledStatement' && key === 'label') ||
                        (type === 'BreakStatement' && key === 'label') ||
                        (type === 'CatchClause' && key === 'param') ||
                        (type === 'ContinueStatement' && key === 'label') ||
                        ((type === 'CallExpression' || type === 'NewExpression') &&
                            key === 'callee' &&
                            (object.callee.type === 'MemberExpression' ||
                                (object.callee.type === 'Identifier' && object.callee.name === 'eval'))) ||
                        (type === 'VariableDeclarator' && key === 'id') ||
                        (type === 'MemberExpression' && !object.computed && key === 'property')) {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'ObjectExpression' && key === 'properties') {
                        newContext = CONTEXT.OEXP;
                    } else if ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'params') {
                        newContext = CONTEXT.PARAMS;
                    } else if (context === CONTEXT.OEXP) {
                        newContext = CONTEXT.OEXP2;
                    } else if (context === CONTEXT.OEXP2 && key === 'key') {
                        newContext = CONTEXT.IGNORE;
                    } else if (context === CONTEXT.PARAMS) {
                        newContext = CONTEXT.IGNORE;
                    } else if (object.key && key === 'value' && object.kind === 'get') {
                        newContext = CONTEXT.GETTER;
                    } else if (object.key && key === 'value' && object.kind === 'set') {
                        newContext = CONTEXT.SETTER;
                    } else if (type === 'CallExpression' && key === 'callee' && child.type === 'Identifier' && child.name === 'eval') {
                        newContext = CONTEXT.IGNORE;
                    } else if (type === 'UnaryExpression' && key === 'argument' && object.operator === 'typeof' && child.type === 'Identifier') {
                        newContext = CONTEXT.TYPEOF;
                    } else {
                            newContext = CONTEXT.RHS;
                    }
                    if (key !== 'bodyOrig') {
                        object[key] = transformAst(child, visitorPost, visitorPre, newContext, noIgnore);
                    }
                }
//            }
        }

        if (visitorPost && HOP(visitorPost, type)) {
            ret = visitorPost[type](object, context);
        } else {
            ret = object;
        }
        return ret;

    }

    /**
     * computes a map from iids to the corresponding AST nodes for root.  The root AST is destructively updated to
     * include SymbolicReference nodes that reference other nodes by iid, in order to save space in the map.
     */
    function serialize(root) {
        // Stores a pointer to the most-recently encountered node representing a function or a
        // top-level script.  We need this stored pointer since a function expression or declaration
        // has no associated IID, but we'd like to have the ASTs as entries in the table.  Instead,
        // we associate the AST with the IID for the corresponding function-enter or script-enter IID.
        // We don't need a stack here since we only use this pointer at the next function-enter or script-enter,
        // and there cannot be a nested function declaration in-between.
        var parentFunOrScript = root;
        var iidToAstTable = {};

        function handleFun(node) {
            parentFunOrScript = node;
        }

        var visitorPre = {
            'Program':handleFun,
            'FunctionDeclaration':handleFun,
            'FunctionExpression':handleFun
        };

        function canMakeSymbolic(node) {
            if (node.callee.object) {
                var callee = node.callee;
                // we can replace calls to J$ functions with a SymbolicReference iff they have an IID as their first
                // argument.  'instrumentCode', 'getConcrete', and 'I' do not take an IID.
                // TODO are we missing other cases?
                if (callee.object.name === 'J$' && callee.property.name !== "instrumentCode" &&
                    callee.property.name !== "getConcrete" &&
                    callee.property.name !== "I" && node.arguments[0]) {
                    return true;
                }
            }
            return false;
        }

        function setSerializedAST(iid, ast) {
            var entry = iidToAstTable[iid];
            if (!entry) {
                entry = {};
                iidToAstTable[iid] = entry;
            }
            entry.serializedAST = ast;
        }
        var visitorPost = {
            'CallExpression':function (node) {
                try {
                    if (node.callee.object && node.callee.object.name === 'J$' && (node.callee.property.name === 'Se' || node.callee.property.name === 'Fe')) {
                        // associate IID with the AST of the containing function / script
                        setSerializedAST(node.arguments[0].value, parentFunOrScript);
                        return node;
                    } else if (canMakeSymbolic(node)) {
                        setSerializedAST(node.arguments[0].value, node);
                        return {type:"SymbolicReference", value:node.arguments[0].value};
                    }
                    return node;
                } catch (e) {
                    console.log(JSON.stringify(node));
                    throw e;
                }
            }
        };

        transformAst(root, visitorPost, visitorPre);
        return iidToAstTable;
    }

    /**
     * given an iidToAstTable constructed by the serialize() function, destructively
     * update the AST values to remove SymbolicReference nodes, replacing them with a
     * pointer to the appropriate actual AST node.
     */
    function deserialize(iidToAstTable) {
        Object.keys(iidToAstTable).forEach(function (iid) {
            var curAst = iidToAstTable[iid].serializedAST;
            if (curAst) {
                var visitorPost = {
                    'SymbolicReference': function (node) {
                        var targetAST = iidToAstTable[node.value].serializedAST;
                        if (!targetAST) {
                            throw "bad symbolic reference";
                        }
                        return targetAST;
                    }
                };
                transformAst(curAst, visitorPost);
            }
        });
    }

    /**
     * given an instrumented AST, returns an array of IIDs corresponding to "top-level expressions,"
     * i.e., expressions that are not nested within another
     * @param ast
     */
    function computeTopLevelExpressions(ast) {
        var exprDepth = 0;
        var exprDepthStack = [];
        var topLevelExprs = [];
        var visitorIdentifyTopLevelExprPre = {
            "CallExpression":function (node) {
                if (node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === JALANGI_VAR) {
                    var funName = node.callee.property.name;
                    if ((exprDepth === 0 &&
                        (funName === 'A' ||
                            funName === 'P' ||
                            funName === 'G' ||
                            funName === 'R' ||
                            funName === 'W' ||
                            funName === 'H' ||
                            funName === 'T' ||
                            funName === 'Rt' ||
                            funName === 'B' ||
                            funName === 'U' ||
                            funName === 'C' ||
                            funName === 'C1' ||
                            funName === 'C2'
                            )) ||
                        (exprDepth === 1 &&
                            (funName === 'F' ||
                                funName === 'M'))) {
                        topLevelExprs.push(node.arguments[0].value);
                    }
                    exprDepth++;
                } else if (node.callee.type === 'CallExpression' &&
                    node.callee.callee.type === 'MemberExpression' &&
                    node.callee.callee.object.type === 'Identifier' &&
                    node.callee.callee.object.name === JALANGI_VAR &&
                    (node.callee.callee.property.name === 'F' ||
                        node.callee.callee.property.name === 'M')) {
                    exprDepth++;
                }
            },
            "FunctionExpression":function (node, context) {
                exprDepthStack.push(exprDepth);
                exprDepth = 0;
            },
            "FunctionDeclaration":function (node) {
                exprDepthStack.push(exprDepth);
                exprDepth = 0;
            }

        };

        var visitorIdentifyTopLevelExprPost = {
            "CallExpression":function (node) {
                if (node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === JALANGI_VAR) {
                    exprDepth--;
                } else if (node.callee.type === 'CallExpression' &&
                    node.callee.callee.type === 'MemberExpression' &&
                    node.callee.callee.object.type === 'Identifier' &&
                    node.callee.callee.object.name === JALANGI_VAR &&
                    (node.callee.callee.property.name === 'F' ||
                        node.callee.callee.property.name === 'M')) {
                    exprDepth--;
                }
                return node;
            },
            "FunctionExpression":function (node, context) {
                exprDepth = exprDepthStack.pop();
                return node;
            },
            "FunctionDeclaration":function (node) {
                exprDepth = exprDepthStack.pop();
                return node;
            }
        };
        transformAst(ast, visitorIdentifyTopLevelExprPost, visitorIdentifyTopLevelExprPre, CONTEXT.RHS);
        return topLevelExprs;
    }

    astUtil.serialize = serialize;
    astUtil.deserialize = deserialize;
    astUtil.JALANGI_VAR = JALANGI_VAR;
    astUtil.CONTEXT = CONTEXT;
    astUtil.transformAst = transformAst;
    astUtil.computeTopLevelExpressions = computeTopLevelExpressions;
})(J$);

// exports J$.astUtil
// depends on J$.Constants

/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

/*jslint node: true browser: true */
/*global astUtil acorn esotope J$ */

//var StatCollector = require('../utils/StatCollector');
if (typeof J$ === 'undefined') {
    J$ = {};
}


(function (sandbox) {
    if (typeof sandbox.instrumentCode !== 'undefined') {
        return;
    }

    var global = this;
    var JSON = {parse: global.JSON.parse, stringify: global.JSON.stringify};

    var astUtil = sandbox.astUtil;

    var Config = sandbox.Config;
    var Constants = sandbox.Constants;

    var JALANGI_VAR = Constants.JALANGI_VAR;
    var RP = JALANGI_VAR + "_";

//    var N_LOG_LOAD = 0,
//    var N_LOG_FUN_CALL = 1,
//        N_LOG_METHOD_CALL = 2,
    var N_LOG_FUNCTION_ENTER = 4,
//        N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
//        N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
//        N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
//        N_LOG_LOCAL = 15,
//        N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
//        N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19,
        N_LOG_SPECIAL = 20,
        N_LOG_STRING_LIT = 21,
        N_LOG_NUMBER_LIT = 22,
        N_LOG_BOOLEAN_LIT = 23,
        N_LOG_UNDEFINED_LIT = 24,
        N_LOG_NULL_LIT = 25;

    var logFunctionEnterFunName = JALANGI_VAR + ".Fe";
    var logFunctionReturnFunName = JALANGI_VAR + ".Fr";
    var logFunCallFunName = JALANGI_VAR + ".F";
    var logMethodCallFunName = JALANGI_VAR + ".M";
    var logAssignFunName = JALANGI_VAR + ".A";
    var logPutFieldFunName = JALANGI_VAR + ".P";
    var logGetFieldFunName = JALANGI_VAR + ".G";
    var logScriptEntryFunName = JALANGI_VAR + ".Se";
    var logScriptExitFunName = JALANGI_VAR + ".Sr";
    var logReadFunName = JALANGI_VAR + ".R";
    var logWriteFunName = JALANGI_VAR + ".W";
    var logIFunName = JALANGI_VAR + ".I";
    var logHashFunName = JALANGI_VAR + ".H";
    var logLitFunName = JALANGI_VAR + ".T";
    var logInitFunName = JALANGI_VAR + ".N";
    var logReturnFunName = JALANGI_VAR + ".Rt";
    var logThrowFunName = JALANGI_VAR + ".Th";
    var logReturnAggrFunName = JALANGI_VAR + ".Ra";
    var logUncaughtExceptionFunName = JALANGI_VAR + ".Ex";
    var logLastComputedFunName = JALANGI_VAR + ".L";
    var logTmpVarName = JALANGI_VAR + "._tm_p";
    var logSampleFunName = JALANGI_VAR + ".S";

    var logWithFunName = JALANGI_VAR + ".Wi";
    var logBinaryOpFunName = JALANGI_VAR + ".B";
    var logUnaryOpFunName = JALANGI_VAR + ".U";
    var logConditionalFunName = JALANGI_VAR + ".C";
    var logSwitchLeftFunName = JALANGI_VAR + ".C1";
    var logSwitchRightFunName = JALANGI_VAR + ".C2";
    var logLastFunName = JALANGI_VAR + "._";
    var logX1FunName = JALANGI_VAR + ".X1";

    var instrumentCodeFunName = JALANGI_VAR + ".instrumentEvalCode";


    var Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };


    function createBitPattern() {
        var ret = 0;
        var i;
        for (i =0; i< arguments.length; i++) {
            ret = (ret << 1)+(arguments[i]?1:0);
        }
        return ret;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function isArr(val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    }

    function MAP(arr, fun) {
        var len = arr.length;
        if (!isArr(arr)) {
            throw new TypeError();
        }
        if (typeof fun !== "function") {
            throw new TypeError();
        }

        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            if (i in arr) {
                res[i] = fun(arr[i]);
            }
        }
        return res;
    }

    function regex_escape(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }


    // name of the file containing the instrumented code

    var IID_INC_STEP = 8;
    // current static identifier for each conditional expression
    var condIid;
    var memIid;
    var opIid;
    var hasInitializedIIDs = false;
    var origCodeFileName;
    var instCodeFileName;
    var iidSourceInfo;


    function getIid() {
        var tmpIid = memIid;
        memIid = memIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getPrevIidNoInc() {
        return createLiteralAst(memIid - IID_INC_STEP);
    }

    function getCondIid() {
        var tmpIid = condIid;
        condIid = condIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }

    function getOpIid() {
        var tmpIid = opIid;
        opIid = opIid + IID_INC_STEP;
        return createLiteralAst(tmpIid);
    }


    function printLineInfoAux(i, ast) {
        if (ast && ast.loc) {
            iidSourceInfo[i] = [ast.loc.start.line, ast.loc.start.column + 1, ast.loc.end.line, ast.loc.end.column + 1];
        }
    }

    // iid+2 is usually unallocated
    // we are using iid+2 for the sub-getField operation of a method call
    // see analysis.M
    function printSpecialIidToLoc(ast0) {
        printLineInfoAux(memIid + 2, ast0);
    }

    function printIidToLoc(ast0) {
        printLineInfoAux(memIid, ast0);
    }

    function printModIidToLoc(ast0) {
        printLineInfoAux(memIid, ast0);
        printLineInfoAux(memIid+2, ast0);
    }

    function printOpIidToLoc(ast0) {
        printLineInfoAux(opIid, ast0);
    }

    function printCondIidToLoc(ast0) {
        printLineInfoAux(condIid, ast0);
    }

// J$_i in expression context will replace it by an AST
// {J$_i} will replace the body of the block statement with an array of statements passed as argument

    function replaceInStatement(code) {
        var asts = arguments;
        var visitorReplaceInExpr = {
            'Identifier': function (node) {
                if (node.name.indexOf(RP) === 0) {
                    var i = parseInt(node.name.substring(RP.length));
                    return asts[i];
                } else {
                    return node;
                }
            },
            'BlockStatement': function (node) {
                if (node.body[0].type === 'ExpressionStatement' && isArr(node.body[0].expression)) {
                    node.body = node.body[0].expression;
                }
                return node;
            }
        };
//        StatCollector.resumeTimer("internalParse");
        var ast = acorn.parse(code);
//        StatCollector.suspendTimer("internalParse");
//        StatCollector.resumeTimer("replace");
        var newAst = astUtil.transformAst(ast, visitorReplaceInExpr, undefined, undefined, true);
        //console.log(newAst);
//        StatCollector.suspendTimer("replace");
        return newAst.body;
    }

    function replaceInExpr(code) {
        var ret = replaceInStatement.apply(this, arguments);
        return ret[0].expression;
    }

    function createLiteralAst(name) {
        return {type: Syntax.Literal, value: name};
    }

    function createIdentifierAst(name) {
        return {type: Syntax.Identifier, name: name};
    }

    function transferLoc(toNode, fromNode) {
        if (fromNode.loc)
            toNode.loc = fromNode.loc;
        if (fromNode.raw)
            toNode.raw = fromNode.loc;
    }

    function idsOfGetterSetter(node) {
        var ret = {}, isEmpty = true;
        if (node.type === "ObjectExpression") {
            var kind, len = node.properties.length;
            for (var i = 0; i < len; i++) {
                if ((kind = node.properties[i].kind) === 'get' || kind === 'set') {
                    ret[kind + node.properties[i].key.name] = node.properties[i].value.funId;
                    isEmpty = false;
                }
            }
        }
        return isEmpty ? undefined : ret;
    }

    function checkAndGetIid(funId, sid, funName) {
        var id = getIid();
        if (!Config.requiresInstrumentation || Config.requiresInstrumentation(id, funId, sid, funName)) {
            return id;
        } else {
            return undefined;
        }
    }

    function modifyAst(ast, modifier, term) {
        var ret;
        var i = 3; // no. of formal parameters
        while (term.indexOf('$$') >= 0) {
            term = term.replace(/\$\$/, arguments[i]);
            i++;
        }
        var args = [];
        args.push(term);
        for (; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        printIidToLoc(ast);
        ret = modifier.apply(this, args);
        transferLoc(ret, ast);
        return ret;
    }

    function wrapPutField(node, base, offset, rvalue, isComputed) {
        if (!Config.INSTR_PUTFIELD || Config.INSTR_PUTFIELD(isComputed ? null : offset.value, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logPutFieldFunName +
                "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isComputed, false)) + ")",
                getIid(),
                base,
                offset,
                rvalue
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapModAssign(node, base, offset, op, rvalue, isComputed) {
        if (!Config.INSTR_PROPERTY_BINARY_ASSIGNMENT || Config.INSTR_PROPERTY_BINARY_ASSIGNMENT(op, node.computed ? null : offset.value, node)) {
            printModIidToLoc(node);
            var ret = replaceInExpr(
                logAssignFunName + "(" + RP + "1," + RP + "2," + RP + "3," + RP + "4," + (createBitPattern(isComputed)) + ")(" + RP + "5)",
                getIid(),
                base,
                offset,
                createLiteralAst(op),
                rvalue
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapMethodCall(node, base, offset, isCtor, isComputed) {
        printIidToLoc(node);
        printSpecialIidToLoc(node.callee);
        var ret = replaceInExpr(
            logMethodCallFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + (createBitPattern(isCtor, isComputed)) + ")",
            getIid(),
            base,
            offset
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapFunCall(node, ast, isCtor) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logFunCallFunName + "(" + RP + "1, " + RP + "2, " + (createBitPattern(isCtor)) + ")",
            getIid(),
            ast
        );
        transferLoc(ret, node.callee);
        return ret;
    }

    function wrapGetField(node, base, offset, isComputed) {
        if (!Config.INSTR_GETFIELD || Config.INSTR_GETFIELD(node.computed ? null : offset.value, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logGetFieldFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (createBitPattern(isComputed,false, false)) + ")",
                getIid(),
                base,
                offset
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapRead(node, name, val, isReUseIid, isGlobal, isScriptLocal) {
        if (!Config.INSTR_READ || Config.INSTR_READ(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logReadFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + (createBitPattern(isGlobal,isScriptLocal)) + ")",
                isReUseIid ? getPrevIidNoInc() : getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

//    function wrapReadWithUndefinedCheck(node, name) {
//        var ret = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
//        transferLoc(ret, node);
//        return ret;
//    }

    function wrapReadWithUndefinedCheck(node, name) {
        var ret;

        //if (name !== 'location') {
        //    ret = replaceInExpr(
        //        "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + name + "=" + RP + "2) : (" + name + "=" + RP + "3)))",
        //        createIdentifierAst(name),
        //        wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, true),
        //        wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, true)
        //    );
        //} else {
            ret = replaceInExpr(
                "(" + logIFunName + "(typeof (" + name + ") === 'undefined'? (" + RP + "2) : (" + RP + "3)))",
                createIdentifierAst(name),
                wrapRead(node, createLiteralAst(name), createIdentifierAst("undefined"), false, true, false),
                wrapRead(node, createLiteralAst(name), createIdentifierAst(name), true, true, false)
            );
//        }
        transferLoc(ret, node);
        return ret;
    }

    function wrapWrite(node, name, val, lhs, isGlobal, isScriptLocal, isDeclaration) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isGlobal,isScriptLocal,isDeclaration)) + ")",
                getIid(),
                name,
                val,
                lhs
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

    function wrapWriteWithUndefinedCheck(node, name, val, lhs) {
        if (!Config.INSTR_WRITE || Config.INSTR_WRITE(name, node)) {
            printIidToLoc(node);
//        var ret2 = replaceInExpr(
//            "("+logIFunName+"(typeof ("+name+") === 'undefined'? "+RP+"2 : "+RP+"3))",
//            createIdentifierAst(name),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst("undefined")),
//            wrapRead(node, createLiteralAst(name),createIdentifierAst(name), true)
//        );
            var ret = replaceInExpr(
                logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + logIFunName + "(typeof(" + lhs.name + ")==='undefined'?undefined:" + lhs.name + ")," + createBitPattern(true, false, false) +")",
                getIid(),
                name,
                val
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return val;
        }
    }

    function wrapRHSOfModStore(node, left, right, op) {
        var ret = replaceInExpr(RP + "1 " + op + " " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function makeNumber(node, left) {
        var ret = replaceInExpr(" + " + RP + "1 ", left);
        transferLoc(ret, node);
        return ret;
    }

    function wrapLHSOfModStore(node, left, right) {
        var ret = replaceInExpr(RP + "1 = " + RP + "2",
            left, right);
        transferLoc(ret, node);
        return ret;
    }

    function ifObjectExpressionHasGetterSetter(node) {
        if (node.type === "ObjectExpression") {
            var kind, len = node.properties.length;
            for (var i = 0; i < len; i++) {
                if ((kind = node.properties[i].kind) === 'get' || kind === 'set') {
                    return true;
                }
            }
        }
        return false;
    }

    var dummyFun = function () {
    };
    var dummyObject = {};
    var dummyArray = [];

    function getLiteralValue(funId, node) {
        if (node.name === "undefined") {
            return undefined;
        } else if (node.name === "NaN") {
            return NaN;
        } else if (node.name === "Infinity") {
            return Infinity;
        }
        switch (funId) {
            case N_LOG_NUMBER_LIT:
            case N_LOG_STRING_LIT:
            case N_LOG_NULL_LIT:
            case N_LOG_REGEXP_LIT:
            case N_LOG_BOOLEAN_LIT:
                return node.value;
            case N_LOG_ARRAY_LIT:
                return dummyArray;
            case N_LOG_FUNCTION_LIT:
                return dummyFun;
            case N_LOG_OBJECT_LIT:
                return dummyObject;
        }
        throw new Error(funId + " not known");
    }

    function getFnIdFromAst(ast) {
        var entryExpr = ast.body.body[0];
        if (entryExpr.type != 'ExpressionStatement') {
            console.log(JSON.stringify(entryExpr));
            throw new Error("IllegalStateException");
        }
        entryExpr = entryExpr.expression;
        if (entryExpr.type != 'CallExpression') {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.type != 'MemberExpression') {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.object.name != JALANGI_VAR) {
            throw new Error("IllegalStateException");
        }
        if (entryExpr.callee.property.name != 'Fe') {
            throw new Error("IllegalStateException");
        }
        return entryExpr['arguments'][0].value;
    }

    function wrapLiteral(node, ast, funId) {
        if (!Config.INSTR_LITERAL || Config.INSTR_LITERAL(getLiteralValue(funId, node), node)) {
            printIidToLoc(node);
            var hasGetterSetter = ifObjectExpressionHasGetterSetter(node);

            var ret;
            if (funId == N_LOG_FUNCTION_LIT) {
                var internalFunId = null;
                if (node.type == 'FunctionExpression') {
                    internalFunId = getFnIdFromAst(node);
                } else {
                    if (node.type != 'Identifier') {
                        throw new Error("IllegalStateException");
                    }
                    internalFunId = getFnIdFromAst(scope.funNodes[node.name]);
                }
                ret = replaceInExpr(
                    logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + hasGetterSetter + ", " + internalFunId + ")",
                    getIid(),
                    ast,
                    createLiteralAst(funId),
                    internalFunId
                );
            } else {
                ret = replaceInExpr(
                    logLitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3," + hasGetterSetter + ")",
                    getIid(),
                    ast,
                    createLiteralAst(funId)
                );
            }
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapReturn(node, expr) {
        var lid = (expr === null) ? node : expr;
        printIidToLoc(lid);
        if (expr === null) {
            expr = createIdentifierAst("undefined");
        }
        var ret = replaceInExpr(
            logReturnFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            expr
        );
        transferLoc(ret, lid);
        return ret;
    }

    function wrapThrow(node, expr) {
        printIidToLoc(expr);
        var ret = replaceInExpr(
            logThrowFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            expr
        );
        transferLoc(ret, expr);
        return ret;
    }

    function wrapWithX1(node, ast) {
        if (!Config.INSTR_END_EXPRESSION || Config.INSTR_END_EXPRESSION(node)) {

            if (!ast || ast.type.indexOf("Expression") <= 0) return ast;
            printIidToLoc(node);
            var ret = replaceInExpr(
                logX1FunName + "(" + RP + "1," + RP + "2)", getIid(), ast);
            transferLoc(ret, node);
            return ret;
        } else {
            return ast;
        }
    }

    function wrapHash(node, ast) {
        printIidToLoc(node);
        var ret = replaceInExpr(
            logHashFunName + "(" + RP + "1, " + RP + "2)",
            getIid(),
            ast
        );
        transferLoc(ret, node);
        return ret;
    }

    function wrapEvalArg(ast) {
        printIidToLoc(ast);
        var ret = replaceInExpr(
            instrumentCodeFunName + "(" + RP + "1, " + RP + "2, true)",
            ast,
            getIid()
        );
        transferLoc(ret, ast);
        return ret;
    }

    function wrapUnaryOp(node, argument, operator) {
        if (!Config.INSTR_UNARY || Config.INSTR_UNARY(operator, node)) {
            printOpIidToLoc(node);
            var ret = replaceInExpr(
                logUnaryOpFunName + "(" + RP + "1," + RP + "2," + RP + "3)",
                getOpIid(),
                createLiteralAst(operator),
                argument
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapBinaryOp(node, left, right, operator, isComputed) {
        if (!Config.INSTR_BINARY || Config.INSTR_BINARY(operator, operator)) {
            printOpIidToLoc(node);
            var ret = replaceInExpr(
                logBinaryOpFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + RP + "4," + (createBitPattern(isComputed, false, false)) + ")",
                getOpIid(),
                createLiteralAst(operator),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapLogicalAnd(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("&&", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + RP + "3:" + logLastFunName + "()",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapLogicalOr(node, left, right) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("||", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)?" + logLastFunName + "():" + RP + "3",
                getCondIid(),
                left,
                right
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchDiscriminant(node, discriminant) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logSwitchLeftFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                discriminant
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapSwitchTest(node, test) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("switch", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logSwitchRightFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapWith(node) {
        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("with", node)) {
            printIidToLoc(node);
            var ret = replaceInExpr(
                logWithFunName + "(" + RP + "1, " + RP + "2)",
                getIid(),
                node
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }
    }

    function wrapConditional(node, test) {
        if (node === null) {
            return node;
        } // to handle for(;;) ;

        if (!Config.INSTR_CONDITIONAL || Config.INSTR_CONDITIONAL("other", node)) {
            printCondIidToLoc(node);
            var ret = replaceInExpr(
                logConditionalFunName + "(" + RP + "1, " + RP + "2)",
                getCondIid(),
                test
            );
            transferLoc(ret, node);
            return ret;
        } else {
            return node;
        }

    }

//    function createCallWriteAsStatement(node, name, val) {
//        printIidToLoc(node);
//        var ret = replaceInStatement(
//            logWriteFunName + "(" + RP + "1, " + RP + "2, " + RP + "3)",
//            getIid(),
//            name,
//            val
//        );
//        transferLoc(ret[0].expression, node);
//        return ret;
//    }

    function createExpressionStatement(lhs, node) {
        var ret;
        ret = replaceInStatement(
            RP + "1 = " + RP + "2", lhs, node
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallInitAsStatement(node, name, val, isArgumentSync, lhs, isCatchParam, isAssign) {
        printIidToLoc(node);
        var ret;

        if (isAssign)
            ret = replaceInStatement(
                RP + "1 = " + logInitFunName + "(" + RP + "2, " + RP + "3, " + RP + "4, " + createBitPattern(isArgumentSync, false, isCatchParam) + ")",
                lhs,
                getIid(),
                name,
                val
            );
        else
            ret = replaceInStatement(
                logInitFunName + "(" + RP + "1, " + RP + "2, " + RP + "3, " + createBitPattern(isArgumentSync, false, isCatchParam) + ")",
                getIid(),
                name,
                val
            );

        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsFunEnterStatement(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            logFunctionEnterFunName + "(" + RP + "1,arguments.callee, this, arguments)",
            getIid()
        );
        transferLoc(ret[0].expression, node);
        return ret;
    }

    function createCallAsScriptEnterStatement(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(logScriptEntryFunName + "(" + RP + "1," + RP + "2, " + RP + "3)",
            getIid(),
            createLiteralAst(instCodeFileName), createLiteralAst(origCodeFileName));
        transferLoc(ret[0].expression, node);
        return ret;
    }

    var labelCounter = 0;

    function wrapForIn(node, left, right, body) {
        printIidToLoc(node);
        var tmp, extra, isDeclaration = (left.type === 'VariableDeclaration');
        if (isDeclaration) {
            var name = node.left.declarations[0].id.name;
            tmp = replaceInExpr(name + " = " + logTmpVarName);
        } else {
            tmp = replaceInExpr(RP + "1 = " + logTmpVarName, left);
        }
        transferLoc(tmp, node);
        extra = instrumentStore(tmp, isDeclaration);

        var ret;

        if (body.type === 'BlockExpression') {
            body = body.body;
        } else {
            body = [body];
        }
        if (isDeclaration) {
            ret = replaceInStatement(
                "function n() {  for(" + logTmpVarName + " in " + RP + "1) {var " + name + " = " + RP + "2;\n {" + RP + "3}}}", right, wrapWithX1(node, extra.right), body);
        } else {
            ret = replaceInStatement(
                "function n() {  for(" + logTmpVarName + " in " + RP + "1) {" + RP + "2;\n {" + RP + "3}}}", right, wrapWithX1(node, extra), body);
        }
        ret = ret[0].body.body[0];
        transferLoc(ret, node);
        return ret;
    }


    function wrapForInBody(node, body, name) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            "function n() { " + logInitFunName + "(" + RP + "1, '" + name + "'," + name + ","+createBitPattern(false, true, false)+");\n {" + RP + "2}}", getIid(), [body]);

        ret = ret[0].body;
        transferLoc(ret, node);
        return ret;
    }

    function wrapCatchClause(node, body, name) {
        var ret;
        if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
            body.unshift(createCallInitAsStatement(node,
                createLiteralAst(name),
                createIdentifierAst(name),
                false, createIdentifierAst(name), true, true)[0]);
        }
    }

    function wrapScriptBodyWithTryCatch(node, body) {
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            printIidToLoc(node);
            var iid1 = getIid();
            printIidToLoc(node);
            var l = labelCounter++;
            var ret = replaceInStatement(
                "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + JALANGI_VAR +
                "e) { //console.log(" + JALANGI_VAR + "e); console.log(" +
                JALANGI_VAR + "e.stack);\n  " + logUncaughtExceptionFunName + "(" + RP + "2," + JALANGI_VAR +
                "e); } finally { if (" + logScriptExitFunName + "(" +
                RP + "3)) { " + logLastComputedFunName + "(); continue jalangiLabel" + l + ";\n } else {\n  " + logLastComputedFunName + "(); break jalangiLabel" + l + ";\n }}\n }}", body,
                iid1,
                getIid()
            );
            //console.log(JSON.stringify(ret));

            ret = ret[0].body.body;
            transferLoc(ret[0], node);
            return ret;
        } else {
            return body;
        }
    }

    function wrapFunBodyWithTryCatch(node, body) {
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            printIidToLoc(node);
            var iid1 = getIid();
            printIidToLoc(node);
            var l = labelCounter++;
            var ret = replaceInStatement(
                "function n() { jalangiLabel" + l + ": while(true) { try {" + RP + "1} catch(" + JALANGI_VAR +
                "e) { //console.log(" + JALANGI_VAR + "e); console.log(" +
                JALANGI_VAR + "e.stack);\n " + logUncaughtExceptionFunName + "(" + RP + "2," + JALANGI_VAR +
                "e); } finally { if (" + logFunctionReturnFunName + "(" +
                RP + "3)) continue jalangiLabel" + l + ";\n else \n  return " + logReturnAggrFunName + "();\n }\n }}", body,
                iid1,
                getIid()
            );
            //console.log(JSON.stringify(ret));

            ret = ret[0].body.body;
            transferLoc(ret[0], node);
            return ret;
        } else {
            return body;
        }
    }

    function syncDefuns(node, scope, isScript) {
        var ret = [], ident;
        if (!isScript) {
            if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
                if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                    ident = createIdentifierAst("arguments");
                    ret = ret.concat(createCallInitAsStatement(node,
                        createLiteralAst("arguments"),
                        ident,
                        true,
                        ident, false, true));
                }
            }
        }
        if (scope) {
                for (var name in scope.vars) {
                    if (HOP(scope.vars, name)) {
                        if (scope.vars[name] === "defun") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT),
                                    false,
                                    ident, false, true));
                            } else {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(
                                    createExpressionStatement(ident,
                                        wrapLiteral(ident, ident, N_LOG_FUNCTION_LIT)));
                            }
                        }
                        if (scope.vars[name] === "lambda") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ident.loc = scope.funLocs[name];
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name), ident,
                                    false,
                                    ident, false, true));
                            }
                        }
                        if (scope.vars[name] === "arg") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ident = createIdentifierAst(name);
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    ident,
                                    true,
                                    ident, false, true));
                            }
                        }
                        if (scope.vars[name] === "var") {
                            if (!Config.INSTR_INIT || Config.INSTR_INIT(node)) {
                                ret = ret.concat(createCallInitAsStatement(node,
                                    createLiteralAst(name),
                                    createIdentifierAst(name),
                                    false, undefined, false, false));
                            }
                        }
                    }
                }
        }
        return ret;
    }


    var scope;


    function instrumentFunctionEntryExit(node, ast) {
        var body;
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            body = createCallAsFunEnterStatement(node);
        } else {
            body = [];
        }
        body = body.concat(syncDefuns(node, scope, false)).concat(ast);
        return body;
    }

//    function instrumentFunctionEntryExit(node, ast) {
//        return wrapFunBodyWithTryCatch(node, ast);
//    }

    /**
     * instruments entry of a script.  Adds the script entry (J$.Se) callback,
     * and the J$.N init callbacks for locals.
     *
     */
    function instrumentScriptEntryExit(node, body0) {
        var body;
        if (!Config.INSTR_TRY_CATCH_ARGUMENTS || Config.INSTR_TRY_CATCH_ARGUMENTS(node)) {
            body = createCallAsScriptEnterStatement(node)
        } else {
            body = [];
        }
        body = body.concat(syncDefuns(node, scope, true)).
            concat(body0);
        return body;
    }


    function getPropertyAsAst(ast) {
        return ast.computed ? ast.property : createLiteralAst(ast.property.name);
    }

    function instrumentCall(callAst, isCtor) {
        var ast = callAst.callee;
        var ret;
        if (ast.type === 'MemberExpression') {
            ret = wrapMethodCall(callAst, ast.object,
                getPropertyAsAst(ast),
                isCtor, ast.computed);
            return ret;
        } else if (ast.type === 'Identifier' && ast.name === "eval") {
            return ast;
        } else {
            ret = wrapFunCall(callAst, ast, isCtor);
            return ret;
        }
    }

    function instrumentStore(node, isDeclaration) {
        var ret;
        if (node.left.type === 'Identifier') {
            if (scope.hasVar(node.left.name)) {
                ret = wrapWrite(node.right, createLiteralAst(node.left.name), node.right, node.left, false, scope.isGlobal(node.left.name), isDeclaration);
            } else {
                ret = wrapWriteWithUndefinedCheck(node.right, createLiteralAst(node.left.name), node.right, node.left);

            }
            node.right = ret;
            return node;
        } else {
            ret = wrapPutField(node, node.left.object, getPropertyAsAst(node.left), node.right, node.left.computed);
            return ret;
        }
    }

    function instrumentLoad(ast, isTypeof) {
        var ret;
        if (ast.type === 'Identifier') {
            if (ast.name === "undefined") {
                ret = wrapLiteral(ast, ast, N_LOG_UNDEFINED_LIT);
                return ret;
            } else if (ast.name === "NaN" || ast.name === "Infinity") {
                ret = wrapLiteral(ast, ast, N_LOG_NUMBER_LIT);
                return ret;
            }
            if (ast.name === JALANGI_VAR) {
                return ast;
            } else if (scope.hasVar(ast.name)) {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast, false, false, scope.isGlobal(ast.name));
                return ret;
            } else if (isTypeof) {
                ret = wrapReadWithUndefinedCheck(ast, ast.name);
                return ret;
            } else {
                ret = wrapRead(ast, createLiteralAst(ast.name), ast, false, true, false)
                return ret;
            }

        } else if (ast.type === 'MemberExpression') {
            return wrapGetField(ast, ast.object, getPropertyAsAst(ast), ast.computed);
        } else {
            return ast;
        }
    }

    function instrumentLoadModStore(node, isNumber) {
        if (node.left.type === 'Identifier') {
            var tmp0 = instrumentLoad(node.left, false);
            if (isNumber) {
                tmp0 = makeNumber(node, instrumentLoad(tmp0, false));
            }
            var tmp1 = wrapRHSOfModStore(node.right, tmp0, node.right, node.operator.substring(0, node.operator.length - 1));

            var tmp2;
            if (scope.hasVar(node.left.name)) {
                tmp2 = wrapWrite(node, createLiteralAst(node.left.name), tmp1, node.left, false, scope.isGlobal(node.left.name), false);
            } else {
                tmp2 = wrapWriteWithUndefinedCheck(node, createLiteralAst(node.left.name), tmp1, node.left);

            }
            tmp2 = wrapLHSOfModStore(node, node.left, tmp2);
            return tmp2;
        } else {
            var ret = wrapModAssign(node, node.left.object,
                getPropertyAsAst(node.left),
                node.operator.substring(0, node.operator.length - 1),
                node.right, node.left.computed);
            return ret;
        }
    }

    function instrumentPreIncDec(node) {
        var right = createLiteralAst(1);
        right = wrapLiteral(right, right, N_LOG_NUMBER_LIT);
        var ret = wrapRHSOfModStore(node, node.argument, right, node.operator.substring(0, 1) + "=");
        return instrumentLoadModStore(ret, true);
    }

    function adjustIncDec(op, ast) {
        if (op === '++') {
            op = '-';
        } else {
            op = '+';
        }
        var right = createLiteralAst(1);
        right = wrapLiteral(right, right, N_LOG_NUMBER_LIT);
        var ret = wrapRHSOfModStore(ast, ast, right, op);
        return ret;
    }
	
    // Should 'Program' nodes in the AST be wrapped with prefix code to load libraries,
    // code to indicate script entry and exit, etc.?
    // we need this flag since when we're instrumenting eval'd code, the code is parsed
    // as a top-level 'Program', but the wrapping code may not be syntactically valid in
    // the surrounding context, e.g.:
    //    var y = eval("x + 1");

    function setScope(node) {
        scope = node.scope;
    }

    function funCond0(node) {
        node.test = wrapWithX1(node, node.test);
        node.init = wrapWithX1(node, node.init);
        node.update = wrapWithX1(node, node.update);
        return node;
    }

    function mergeBodies(node) {
        printIidToLoc(node);
        var ret = replaceInStatement(
            "function n() { if (!" + logSampleFunName + "(" + RP + "1, arguments.callee)){" + RP + "2} else {" + RP + "3}}",
            getIid(),
            node.bodyOrig.body,
            node.body.body
        );

        node.body.body = ret[0].body.body;
        delete node.bodyOrig;
        return node;
    }

    function regExpToJSON() {
        var str = this.source;
        var glb = this.global;
        var ignoreCase = this.ignoreCase;
        var multiline = this.multiline;
        var obj = {
            type: 'J$.AST.REGEXP',
            value: str,
            glb: glb,
            ignoreCase: ignoreCase,
            multiline: multiline
        }
        return obj;
    }

    function JSONStringifyHandler(key, value) {
        if (key === 'scope') {
            return undefined;
        } if (value instanceof RegExp) {
            return regExpToJSON.call(value);
        } else {
            return value;
        }
    }

    function JSONParseHandler(key, value) {
        var ret = value, flags = '';
        if (typeof value === 'object' && value && value.type === 'J$.AST.REGEXP') {
            if (value.glb)
                flags += 'g';
            if (value.ignoreCase)
                flags += 'i';
            if (value.multiline)
                flags += 'm';
            ret = RegExp(value.value, flags);
        }
        return ret;
    }

    function clone(src) {
        var ret = JSON.parse(JSON.stringify(src, JSONStringifyHandler), JSONParseHandler);
        return ret;
    }

    /*
     function constructEmptyObject(o) {
     function F() {}
     F.prototype = o;
     return new F();
     }

     function clone(src) { // from http://davidwalsh.name/javascript-clone
     function mixin(dest, source, copyFunc) {
     var name, s, i, empty = {};
     for(name in source){
     // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
     // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
     // don't overwrite it with the toString() method that source inherited from Object.prototype
     s = source[name];
     if(!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))){
     dest[name] = copyFunc ? copyFunc(s) : s;
     }
     }
     return dest;
     }

     if(!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]"){
     // null, undefined, any non-object, or function
     return src;	// anything
     }
     if(src.nodeType && "cloneNode" in src){
     // DOM Node
     return src.cloneNode(true); // Node
     }
     if(src instanceof Date){
     // Date
     return new Date(src.getTime());	// Date
     }
     if(src instanceof RegExp){
     // RegExp
     return new RegExp(src);   // RegExp
     }
     var r, i, l;
     if(src instanceof Array){
     // array
     r = [];
     for(i = 0, l = src.length; i < l; ++i){
     if(i in src){
     r.push(clone(src[i]));
     }
     }
     // we don't clone functions for performance reasons
     //		}else if(d.isFunction(src)){
     //			// function
     //			r = function(){ return src.apply(this, arguments); };
     }else{
     // generic objects
     try {
     r = constructEmptyObject(src);
     //                r = src.constructor ? new src.constructor() : {};
     } catch (e) {
     console.log(src);
     throw e;
     }
     }
     return mixin(r, src, clone);

     }
     */
    var visitorCloneBodyPre = {
        "FunctionExpression": function (node) {
            node.bodyOrig = clone(node.body);
            return node;
        },
        "FunctionDeclaration": function (node) {
            node.bodyOrig = clone(node.body);
            return node;
        }
    };

    var visitorMergeBodyPre = {
        "FunctionExpression": mergeBodies,
        "FunctionDeclaration": mergeBodies
    };

    var visitorRRPre = {
        'Program': setScope,
        'FunctionDeclaration': setScope,
        'FunctionExpression': setScope,
        'CatchClause': setScope
    };

    var visitorRRPost = {
        'Literal': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {

                var litType;
                switch (typeof node.value) {
                    case 'number':
                        litType = N_LOG_NUMBER_LIT;
                        break;
                    case 'string':
                        litType = N_LOG_STRING_LIT;
                        break;
                    case 'object': // for null
                        if (node.value === null)
                            litType = N_LOG_NULL_LIT;
                        else
                            litType = N_LOG_REGEXP_LIT;
                        break;
                    case 'boolean':
                        litType = N_LOG_BOOLEAN_LIT;
                        break;
                }
                var ret1 = wrapLiteral(node, node, litType);
                return ret1;
            } else {
                return node;
            }
        },
        "Program": function (node) {
            var ret = instrumentScriptEntryExit(node, node.body);
            node.body = ret;

            scope = scope.parent;
            return node;
        },
        "VariableDeclaration": function (node) {
            var declarations = MAP(node.declarations, function (def) {
                if (def.init !== null) {
                    var init = wrapWrite(def.init, createLiteralAst(def.id.name), def.init, def.id, false, scope.isGlobal(def.id.name), true);
                    init = wrapWithX1(def.init, init);
                    def.init = init;
                }
                return def;
            });
            node.declarations = declarations;
            return node;
        },
        "NewExpression": function (node) {
            var ret = {
                type: 'CallExpression',
                callee: instrumentCall(node, true),
                'arguments': node.arguments
            };
            transferLoc(ret, node);
            return ret;
//            var ret1 = wrapLiteral(node, ret, N_LOG_OBJECT_LIT);
//            return ret1;
        },
        "CallExpression": function (node) {
            var isEval = node.callee.type === 'Identifier' && node.callee.name === "eval";
            var callee = instrumentCall(node, false);
            node.callee = callee;
            if (isEval) {
                node.arguments = MAP(node.arguments, wrapEvalArg);
            }
            return node;
        },
        "AssignmentExpression": function (node) {
            var ret1;
            if (node.operator === "=") {
                ret1 = instrumentStore(node, false);
            } else {
                ret1 = instrumentLoadModStore(node);
            }
            return ret1;
        },
        "UpdateExpression": function (node) {
            var ret1;
            ret1 = instrumentPreIncDec(node);
            if (!node.prefix) {
                ret1 = adjustIncDec(node.operator, ret1);
            }
            return ret1;
        },
        "FunctionExpression": function (node, context) {
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            var ret1;
            if (context === astUtil.CONTEXT.GETTER || context === astUtil.CONTEXT.SETTER) {
                ret1 = node;
            } else {
                ret1 = wrapLiteral(node, node, N_LOG_FUNCTION_LIT);
            }
            scope = scope.parent;
            return ret1;
        },
        "FunctionDeclaration": function (node) {
            //console.log(node.body.body);
            node.body.body = instrumentFunctionEntryExit(node, node.body.body);
            scope = scope.parent;
            return node;
        },
        "ObjectExpression": function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_OBJECT_LIT);
            return ret1;
        },
        "ArrayExpression": function (node) {
            var ret1 = wrapLiteral(node, node, N_LOG_ARRAY_LIT);
            return ret1;
        },
        'ThisExpression': function (node) {
            var ret = wrapRead(node, createLiteralAst('this'), node, false, false, false);
            return ret;
        },
        'Identifier': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node, false);
                return ret;
            } else if (context === astUtil.CONTEXT.TYPEOF) {
                ret = instrumentLoad(node, true);
                return ret;
            } else {
                return node;
            }
        },
        'MemberExpression': function (node, context) {
            if (context === astUtil.CONTEXT.RHS) {
                var ret = instrumentLoad(node, false);
                return ret;
            } else {
                return node;
            }
        },
        "SequenceExpression": function (node) {
            var i = 0, len = node.expressions.length;
            for (i = 0; i < len - 1 /* the last expression is the result, do not wrap that */; i++) {
                node.expressions[i] = wrapWithX1(node.expressions[i], node.expressions[i]);
            }
            return node;
        },
        "ForInStatement": function (node) {
            var ret = wrapHash(node.right, node.right);
            node.right = ret;

            node = wrapForIn(node, node.left, node.right, node.body);
            //var name;
            //if (node.left.type === 'VariableDeclaration') {
            //    name = node.left.declarations[0].id.name;
            //} else {
            //    name = node.left.name;
            //}
            //node.body = wrapForInBody(node, node.body, name);
            return node;
        },
        "CatchClause": function (node) {
            var name;
            name = node.param.name;
            wrapCatchClause(node, node.body.body, name);
            scope = scope.parent;
            return node;
        },
        "ReturnStatement": function (node) {
            var ret = wrapReturn(node, node.argument);
            node.argument = wrapWithX1(node, ret);
            return node;
        },
        "ThrowStatement": function (node) {
            var ret = wrapThrow(node, node.argument);
            node.argument = wrapWithX1(node, ret);
            return node;
        },

        "ExpressionStatement": function (node) {
            node.expression = wrapWithX1(node, node.expression);
            return node;
        }
    };

    function funCond(node) {
        var ret = wrapConditional(node.test, node.test);
        node.test = ret;
        node.test = wrapWithX1(node, node.test);
        node.init = wrapWithX1(node, node.init);
        node.update = wrapWithX1(node, node.update);
        return node;
    }


    var visitorOps = {
        "Program": function (node) {
            var body = wrapScriptBodyWithTryCatch(node, node.body);
//                var ret = prependScriptBody(node, body);
            node.body = body;

            return node;
        },
        'BinaryExpression': function (node) {
            var ret = wrapBinaryOp(node, node.left, node.right, node.operator);
            return ret;
        },
        'LogicalExpression': function (node) {
            var ret;
            if (node.operator === "&&") {
                ret = wrapLogicalAnd(node, node.left, node.right);
            } else if (node.operator === "||") {
                ret = wrapLogicalOr(node, node.left, node.right);
            }
            return ret;
        },
        'UnaryExpression': function (node) {
            var ret;
            if (node.operator === "void") {
                return node;
            } else if (node.operator === "delete") {
                if (node.argument.object) {
                    ret = wrapBinaryOp(node, node.argument.object, getPropertyAsAst(node.argument), node.operator, node.argument.computed);
                } else {
                    return node;
                }
            } else {
                ret = wrapUnaryOp(node, node.argument, node.operator);
            }
            return ret;
        },
        "SwitchStatement": function (node) {
            var dis = wrapSwitchDiscriminant(node.discriminant, node.discriminant);
            dis = wrapWithX1(node.discriminant, dis);
            var cases = MAP(node.cases, function (acase) {
                var test;
                if (acase.test) {
                    test = wrapSwitchTest(acase.test, acase.test);
                    acase.test = wrapWithX1(acase.test, test);
                }
                return acase;
            });
            node.discriminant = dis;
            node.cases = cases;
            return node;
        },
        "FunctionExpression": function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "FunctionDeclaration": function (node) {
            node.body.body = wrapFunBodyWithTryCatch(node, node.body.body);
            return node;
        },
        "WithStatement": function (node) {
            node.object = wrapWith(node.object);
            return node;
        },
        "ConditionalExpression": funCond,
        "IfStatement": funCond,
        "WhileStatement": funCond,
        "DoWhileStatement": funCond,
        "ForStatement": funCond
    };

    function addScopes(ast) {

        function Scope(parent, isCatch) {
            this.vars = {};
            this.funLocs = {};
            this.funNodes = {};
            this.hasEval = false;
            this.hasArguments = false;
            this.parent = parent;
            this.isCatch = isCatch;
        }

        Scope.prototype.addVar = function (name, type, loc, node) {
            var tmpScope = this;
            if (this.isCatch && type !== 'catch') {
                tmpScope = this.parent;
            }

            if (tmpScope.vars[name] !== 'arg') {
                tmpScope.vars[name] = type;
            }
            if (type === 'defun') {
                tmpScope.funLocs[name] = loc;
                tmpScope.funNodes[name] = node;
            }
        };

        Scope.prototype.hasOwnVar = function (name) {
            var s = this;
            if (s && HOP(s.vars, name))
                return s.vars[name];
            return null;
        };

        Scope.prototype.hasVar = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name))
                    return s.vars[name];
                s = s.parent;
            }
            return null;
        };

        Scope.prototype.isGlobal = function (name) {
            var s = this;
            while (s !== null) {
                if (HOP(s.vars, name) && s.parent !== null) {
                    return false;
                }
                s = s.parent;
            }
            return true;
        };

        Scope.prototype.addEval = function () {
            var s = this;
            while (s !== null) {
                s.hasEval = true;
                s = s.parent;
            }
        };

        Scope.prototype.addArguments = function () {
            var s = this;
            while (s !== null) {
                s.hasArguments = true;
                s = s.parent;
            }
        };

        Scope.prototype.usesEval = function () {
            return this.hasEval;
        };

        Scope.prototype.usesArguments = function () {
            return this.hasArguments;
        };


        var currentScope = null;

        // rename arguments to J$_arguments
        var fromName = 'arguments';
        var toName = JALANGI_VAR + "_arguments";

        function handleFun(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope);
            node.scope = currentScope;
            if (node.type === 'FunctionDeclaration') {
                oldScope.addVar(node.id.name, "defun", node.loc, node);
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
            } else if (node.type === 'FunctionExpression') {
                if (node.id !== null) {
                    currentScope.addVar(node.id.name, "lambda");
                }
                MAP(node.params, function (param) {
                    if (param.name === fromName) {         // rename arguments to J$_arguments
                        param.name = toName;
                    }
                    currentScope.addVar(param.name, "arg");
                });
            }
        }

        function handleVar(node) {
            currentScope.addVar(node.id.name, "var");
        }

        function handleCatch(node) {
            var oldScope = currentScope;
            currentScope = new Scope(currentScope, true);
            node.scope = currentScope;
            currentScope.addVar(node.param.name, "catch");
        }

        function popScope(node) {
            currentScope = currentScope.parent;
            return node;
        }

        var visitorPre = {
            'Program': handleFun,
            'FunctionDeclaration': handleFun,
            'FunctionExpression': handleFun,
            'VariableDeclarator': handleVar,
            'CatchClause': handleCatch
        };

        var visitorPost = {
            'Program': popScope,
            'FunctionDeclaration': popScope,
            'FunctionExpression': popScope,
            'CatchClause': popScope,
            'Identifier': function (node, context) {         // rename arguments to J$_arguments
                if (context === astUtil.CONTEXT.RHS && node.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.name = toName;
                }
                return node;
            },
            "UpdateExpression": function (node) {         // rename arguments to J$_arguments
                if (node.argument.type === 'Identifier' && node.argument.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.argument.name = toName;
                }
                return node;
            },
            "AssignmentExpression": function (node) {         // rename arguments to J$_arguments
                if (node.left.type === 'Identifier' && node.left.name === fromName && currentScope.hasOwnVar(toName)) {
                    node.left.name = toName;
                }
                return node;
            }

        };
        astUtil.transformAst(ast, visitorPost, visitorPre);
    }


    // START of Liang Gong's AST post-processor
    function hoistFunctionDeclaration(ast, hoisteredFunctions) {
        var key, child, startIndex = 0;
        if (ast.body) {
            var newBody = [];
            if (ast.body.length > 0) { // do not hoister function declaration before J$.Fe or J$.Se
                if (ast.body[0].type === 'ExpressionStatement') {
                    if (ast.body[0].expression.type === 'CallExpression') {
                        if (ast.body[0].expression.callee.object &&
                            ast.body[0].expression.callee.object.name === 'J$'
                            && ast.body[0].expression.callee.property
                            &&
                            (ast.body[0].expression.callee.property.name === 'Se' || ast.body[0].
                                expression.callee.property.name === 'Fe')) {

                            newBody.push(ast.body[0]);
                            startIndex = 1;
                        }
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {

                if (ast.body[i].type === 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                    if (newBody.length !== i + 1) {
                        hoisteredFunctions.push(ast.body[i].id.name);
                    }
                }
            }
            for (var i = startIndex; i < ast.body.length; i++) {
                if (ast.body[i].type !== 'FunctionDeclaration') {
                    newBody.push(ast.body[i]);
                }
            }
            while (ast.body.length > 0) {
                ast.body.pop();
            }
            for (var i = 0; i < newBody.length; i++) {
                ast.body.push(newBody[i]);
            }
        } else {
            //console.log(typeof ast.body);
        }
        for (key in ast) {
            if (ast.hasOwnProperty(key)) {
                child = ast[key];
                if (typeof child === 'object' && child !== null && key !==
                    "scope") {
                    hoistFunctionDeclaration(child, hoisteredFunctions);
                }

            }
        }

        return ast;
    }

    // END of Liang Gong's AST post-processor

    function transformString(code, visitorsPost, visitorsPre) {
//         StatCollector.resumeTimer("parse");
//        console.time("parse")
//        var newAst = esprima.parse(code, {loc:true, range:true});
        var newAst = acorn.parse(code, {locations: true, ecmaVersion: 6 });
//        console.timeEnd("parse")
//        StatCollector.suspendTimer("parse");
//        StatCollector.resumeTimer("transform");
//        console.time("transform")
        addScopes(newAst);
        var len = visitorsPost.length;
        for (var i = 0; i < len; i++) {
            newAst = astUtil.transformAst(newAst, visitorsPost[i], visitorsPre[i], astUtil.CONTEXT.RHS);
        }
//        console.timeEnd("transform")
//        StatCollector.suspendTimer("transform");
//        console.log(JSON.stringify(newAst,null,"  "));
        return newAst;
    }

    // if this string is discovered inside code passed to instrumentCode(),
    // the code will not be instrumented
    var noInstr = "// JALANGI DO NOT INSTRUMENT";

    function initializeIIDCounters(forEval) {
        var adj = forEval ? IID_INC_STEP / 2 : 0;
        condIid = IID_INC_STEP + adj + 0;
        memIid = IID_INC_STEP + adj + 1;
        opIid = IID_INC_STEP + adj + 2;
    }


    function instrumentEvalCode(code, iid, isDirect) {
        return instrumentCode({
            code: code,
            thisIid: iid,
            isEval: true,
            inlineSourceMap: true,
            inlineSource: true,
            isDirect: isDirect
        }).code;
    }

    function removeShebang(code) {
        if (code.indexOf("#!") == 0) {
            return code.substring(code.indexOf("\n") + 1);
        }
        return code;
    }

    /**
     * Instruments the provided code.
     *
     * @param {{isEval: boolean, code: string, thisIid: int, origCodeFileName: string, instCodeFileName: string, inlineSourceMap: boolean, inlineSource: boolean, url: string, isDirect: boolean }} options
     * @return {{code:string, instAST: object, sourceMapObject: object, sourceMapString: string}}
     *
     */
    function instrumentCode(options) {
        var aret, skip = false;
        var isEval = options.isEval,
            code = options.code, thisIid = options.thisIid, inlineSource = options.inlineSource, url = options.url;

        iidSourceInfo = {};
        initializeIIDCounters(isEval);
        instCodeFileName = options.instCodeFileName ? options.instCodeFileName : (options.isDirect?"eval":"evalIndirect");
        origCodeFileName = options.origCodeFileName ? options.origCodeFileName : (options.isDirect?"eval":"evalIndirect");


        if (sandbox.analysis && sandbox.analysis.instrumentCodePre) {
            aret = sandbox.analysis.instrumentCodePre(thisIid, code, options.isDirect);
            if (aret) {
                code = aret.code;
                skip = aret.skip;
            }
        }

        if (!skip && typeof code === 'string' && code.indexOf(noInstr) < 0) {
            try {
                code = removeShebang(code);
                iidSourceInfo = {};
                var newAst;
                if (Config.ENABLE_SAMPLING) {
                    newAst = transformString(code, [visitorCloneBodyPre, visitorRRPost, visitorOps, visitorMergeBodyPre], [undefined, visitorRRPre, undefined, undefined]);
                } else {
                    newAst = transformString(code, [visitorRRPost, visitorOps], [visitorRRPre, undefined]);
                }
                // post-process AST to hoist function declarations (required for Firefox)
                var hoistedFcts = [];
                newAst = hoistFunctionDeclaration(newAst, hoistedFcts);
                var newCode = esotope.generate(newAst, {comment: true ,parse: acorn.parse});
                code = newCode + "\n" + noInstr + "\n";
            } catch(ex) {
                console.log("Failed to instrument", code);
                throw ex;
            }
        }

        var tmp = {};

        tmp.nBranches = iidSourceInfo.nBranches = (condIid / IID_INC_STEP - 1) * 2;
        tmp.originalCodeFileName = iidSourceInfo.originalCodeFileName = origCodeFileName;
        tmp.instrumentedCodeFileName = iidSourceInfo.instrumentedCodeFileName = instCodeFileName;
        if (url) {
            tmp.url = iidSourceInfo.url = url;
        }
        if (isEval) {
            tmp.evalSid = iidSourceInfo.evalSid = sandbox.sid;
            tmp.evalIid = iidSourceInfo.evalIid = thisIid;
        }
        if (inlineSource) {
            tmp.code = iidSourceInfo.code = options.code;
        }

        var prepend = JSON.stringify(iidSourceInfo);
        var instCode;
        if (options.inlineSourceMap) {
            instCode = JALANGI_VAR + ".iids = " + prepend + ";\n" + code;
        } else {
            instCode = JALANGI_VAR + ".iids = " + JSON.stringify(tmp) + ";\n" + code;
        }

        if (isEval && sandbox.analysis && sandbox.analysis.instrumentCode) {
            aret = sandbox.analysis.instrumentCode(thisIid, instCode, newAst, options.isDirect);
            if (aret) {
                instCode = aret.result;
            }
        }

        return {code: instCode, instAST: newAst, sourceMapObject: iidSourceInfo, sourceMapString: prepend};

    }

    sandbox.instrumentCode = instrumentCode;
    sandbox.instrumentEvalCode = instrumentEvalCode;

}(J$));


// exports J$.instrumentCode
// exports J$.instrumentEvalCode
// depends on acorn
// depends on esotope
// depends on J$.Constants
// depends on J$.Config
// depends on J$.astUtil

/*
 * Copyright 2013-2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen
// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.iidToLocation !== 'undefined') {
        return;
    }
    sandbox.iidToLocation = function (sid, iid) {
        var ret, arr, gid=sid;
        if (sandbox.smap) {
            if (typeof sid === 'string' && sid.indexOf(':')>=0) {
                sid = sid.split(':');
                iid = parseInt(sid[1]);
                sid = parseInt(sid[0]);
            } else {
                gid = sid+":"+iid;
            }
            if ((ret = sandbox.smap[sid])) {
                var fname = ret.originalCodeFileName;
                if (ret.evalSid !== undefined) {
                    fname = fname+sandbox.iidToLocation(ret.evalSid, ret.evalIid);
                }
                arr = ret[iid];
                if (arr) {
                    if (sandbox.Results) {
                        return "<a href=\"javascript:iidToDisplayCodeLocation('"+gid+"');\">(" + fname + ":" + arr[0] + ":" + arr[1] + ":" + arr[2] + ":" + arr[3] + ")</a>";
                    } else {
                        return "(" + fname + ":" + arr[0] + ":" + arr[1] + ":" + arr[2] + ":" + arr[3] + ")";
                    }
                } else {
                    return "(" + fname + ":iid" + iid + ")";
                }
            }
        }
        return sid+"";
    };

    sandbox.getGlobalIID = function(iid) {
        return sandbox.sid +":"+iid;
    }

}(J$));

/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT


// wrap in anonymous function to create local namespace when in browser
// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    if (typeof sandbox.B !== 'undefined') {
        return;
    }
    //----------------------------------- Begin Jalangi Library backend ---------------------------------

    // stack of return values from instrumented functions.
    // we need to keep a stack since a function may return and then
    // have another function call in a finally block (see test
    // call_in_finally.js)

    var global = this;
    var Function = global.Function;
    var returnStack = [];
    var wrappedExceptionVal;
    var lastVal;
    var switchLeft;
    var switchKeyStack = [];
    var argIndex;
    var EVAL_ORG = eval;
    var lastComputedValue;
    var SPECIAL_PROP_SID = sandbox.Constants.SPECIAL_PROP_SID;
    var SPECIAL_PROP_IID = sandbox.Constants.SPECIAL_PROP_IID;

    function getPropSafe(base, prop){
      if(base === null || base === undefined){
        return undefined;
      }
      return base[prop];
    }

    function decodeBitPattern(i, len) {
        var ret = new Array(len);
        for (var j=0; j<len; j++) {
            var val = (i & 1)?true:false;
            ret[len - j -1] = val;
            i = i >> 1;
        }
        return ret;
    }

    function createBitPattern() {
        var ret = 0;
        var i;
        for (i =0; i< arguments.length; i++) {
            ret = (ret << 1)+(arguments[i]?1:0);
        }
        return ret;
    }


    var sidStack = [], sidCounter = 0;

    function createAndAssignNewSid() {
        sidStack.push(sandbox.sid);
        sandbox.sid = sidCounter = sidCounter + 1;
        if (!sandbox.smap) sandbox.smap = {};
        sandbox.smap[sandbox.sid] = sandbox.iids;
    }

    function rollBackSid() {
        sandbox.sid = sidStack.pop();
    }

    function associateSidWithFunction(f, iid) {
        if (typeof f === 'function') {
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(f, SPECIAL_PROP_SID, {
                    enumerable:false,
                    writable:true
                });
                Object.defineProperty(f, SPECIAL_PROP_IID, {
                    enumerable:false,
                    writable:true
                });
            }
            f[SPECIAL_PROP_SID] = sandbox.sid;
            f[SPECIAL_PROP_IID] = iid;
        }
    }

    function updateSid(f) {
        sidStack.push(sandbox.sid);
        sandbox.sid = getPropSafe(f, SPECIAL_PROP_SID);
    }


    // unused
    function isNative(f) {
        return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
    }

    function callAsNativeConstructorWithEval(Constructor, args) {
        var a = [];
        for (var i = 0; i < args.length; i++)
            a[i] = 'args[' + i + ']';
        var eval = EVAL_ORG;
        return eval('new Constructor(' + a.join() + ')');
    }

    function callAsNativeConstructor(Constructor, args) {
        if (args.length === 0) {
            return new Constructor();
        }
        if (args.length === 1) {
            return new Constructor(args[0]);
        }
        if (args.length === 2) {
            return new Constructor(args[0], args[1]);
        }
        if (args.length === 3) {
            return new Constructor(args[0], args[1], args[2]);
        }
        if (args.length === 4) {
            return new Constructor(args[0], args[1], args[2], args[3]);
        }
        if (args.length === 5) {
            return new Constructor(args[0], args[1], args[2], args[3], args[4]);
        }
        return callAsNativeConstructorWithEval(Constructor, args);
    }

    function callAsConstructor(Constructor, args) {
        var ret;
        if (true) {
            ret = callAsNativeConstructor(Constructor, args);
            return ret;
        } else { // else branch is a more elegant to call a constructor reflectively, but it leads to memory leak in v8.
            var Temp = function () {
            }, inst;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }

    function invokeEval(base, f, args, iid) {
        return f(sandbox.instrumentEvalCode(args[0], iid, false));
    }

    function invokeFunctionDecl(base, f, args, iid) {
        // Invoke with the original parameters to preserve exceptional behavior if input is invalid
        f.apply(base, args);
        // Otherwise input is valid, so instrument and invoke via eval
        var newArgs = [];
        for (var i = 0; i < args.length-1; i++) {
            newArgs[i] = args[i];
        }
        var code = '(function(' + newArgs.join(', ') + ') { ' + args[args.length-1] + ' })';
        var code = sandbox.instrumentEvalCode(code, iid, false);
        // Using EVAL_ORG instead of eval() is important as it preserves the scoping semantics of Function()
        var out = EVAL_ORG(code);
        return out;
    }

    function callFun(f, base, args, isConstructor, iid) {
        var result;
        pushSwitchKey();
        try {
            if (f === EVAL_ORG) {
                result = invokeEval(base, f, args, iid);
            } else if (f === Function) {
                result = invokeFunctionDecl(base, f, args, iid);
            } else if (isConstructor) {
                result = callAsConstructor(f, args);
            } else {
                result = Function.prototype.apply.call(f, base, args);
            }
            return result;
        } finally {
            popSwitchKey();
        }
    }

    function invokeFun(iid, base, f, args, isConstructor, isMethod) {
        var aret, skip = false, result;

        if (sandbox.analysis && sandbox.analysis.invokeFunPre) {
            aret = sandbox.analysis.invokeFunPre(iid, f, base, args, isConstructor, isMethod, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
            if (aret) {
                f = aret.f;
                base = aret.base;
                args = aret.args;
                skip = aret.skip;
            }
        }
        if (!skip) {
            result = callFun(f, base, args, isConstructor, iid);
        }
        if (sandbox.analysis && sandbox.analysis.invokeFun) {
            aret = sandbox.analysis.invokeFun(iid, f, base, args, result, isConstructor, isMethod, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
            if (aret) {
                result = aret.result;
            }
        }
        return result;
    }

    // Function call (e.g., f())
    function F(iid, f, flags) {
        var bFlags = decodeBitPattern(flags, 1); // [isConstructor]
        return function () {
            var base = this;
            return (lastComputedValue = invokeFun(iid, base, f, arguments, bFlags[0], false));
        }
    }

    // Method call (e.g., e.f())
    function M(iid, base, offset, flags) {
        var bFlags = decodeBitPattern(flags, 2); // [isConstructor, isComputed]
        var f = G(iid + 2, base, offset, createBitPattern(bFlags[1], false, true));
        return function () {
            return (lastComputedValue = invokeFun(iid, base, f, arguments, bFlags[0], true));
        };
    }

    // Ignore argument (identity).
    function I(val) {
        return val;
    }

    var hasGetOwnPropertyDescriptor = typeof Object.getOwnPropertyDescriptor === 'function';
    // object/function/regexp/array Literal
    function T(iid, val, type, hasGetterSetter, internalIid) {
        var aret;
        associateSidWithFunction(val, internalIid);
        if (hasGetterSetter) {
            for (var offset in val) {
                if (hasGetOwnPropertyDescriptor && val.hasOwnProperty(offset)) {
                    var desc = Object.getOwnPropertyDescriptor(val, offset);
                    if (desc !== undefined) {
                        if (typeof desc.get === 'function') {
                            T(iid, desc.get, 12, false, internalIid);
                        }
                        if (typeof desc.set === 'function') {
                            T(iid, desc.set, 12, false, internalIid);
                        }
                    }
                }
            }
        }
        if (sandbox.analysis && sandbox.analysis.literal) {
            aret = sandbox.analysis.literal(iid, val, hasGetterSetter);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // wrap object o in for (x in o) { ... }
    function H(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.forinObject) {
            aret = sandbox.analysis.forinObject(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // variable declaration (Init)
    function N(iid, name, val, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isArgument, isLocalSync, isCatchParam]
        // isLocalSync is only true when we sync variables inside a for-in loop
        var aret;

        if (bFlags[0]) {
            argIndex++;
        }
        if (!bFlags[1] && sandbox.analysis && sandbox.analysis.declare) {
            if (bFlags[0] && argIndex > 1) {
                aret = sandbox.analysis.declare(iid, name, val, bFlags[0], argIndex - 2, bFlags[2]);
            } else {
                aret = sandbox.analysis.declare(iid, name, val, bFlags[0], -1, bFlags[2]);
            }
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // getField (property read)
    function G(iid, base, offset, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isComputed, isOpAssign, isMethodCall]

        var aret, skip = false, val;

        if (sandbox.analysis && sandbox.analysis.getFieldPre) {
            aret = sandbox.analysis.getFieldPre(iid, base, offset, bFlags[0], bFlags[1], bFlags[2]);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                skip = aret.skip;
            }
        }

        if (!skip) {
            val = base[offset];
        }
        if (sandbox.analysis && sandbox.analysis.getField) {
            aret = sandbox.analysis.getField(iid, base, offset, val, bFlags[0], bFlags[1], bFlags[2]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // putField (property write)
    function P(iid, base, offset, val, flags) {
        var bFlags = decodeBitPattern(flags, 2); // [isComputed, isOpAssign]

        var aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.putFieldPre) {
            aret = sandbox.analysis.putFieldPre(iid, base, offset, val, bFlags[0], !!bFlags[1]);
            if (aret) {
                base = aret.base;
                offset = aret.offset;
                val = aret.val;
                skip = aret.skip;
            }
        }

        if (!skip) {
            base[offset] = val;
        }
        if (sandbox.analysis && sandbox.analysis.putField) {
            aret = sandbox.analysis.putField(iid, base, offset, val, bFlags[0], !!bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // variable write
    // isGlobal means that the variable is global and not declared as var
    // isScriptLocal means that the variable is global and is declared as var
    function R(iid, name, val, flags) {
        var aret;
        var bFlags = decodeBitPattern(flags, 2); // [isGlobal, isScriptLocal]

        if (sandbox.analysis && sandbox.analysis.read) {
            aret = sandbox.analysis.read(iid, name, val, bFlags[0], bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // variable write
    function W(iid, name, val, lhs, flags) {
        var bFlags = decodeBitPattern(flags, 3); //[isGlobal, isScriptLocal, isDeclaration]
        var aret;
        if (sandbox.analysis && sandbox.analysis.write) {
            aret = sandbox.analysis.write(iid, name, val, lhs, bFlags[0], bFlags[1]);
            if (aret) {
                val = aret.result;
            }
        }
        if (!bFlags[2]) {
            return (lastComputedValue = val);
        } else {
            lastComputedValue = undefined;
            return val;
        }
    }

    // with statement
    function Wi(iid, val) {
        if (sandbox.analysis && sandbox.analysis._with) {
            aret = sandbox.analysis._with(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return val;
    }

    // Uncaught exception
    function Ex(iid, e) {
        wrappedExceptionVal = {exception:e};
    }

    // Throw statement
    function Th(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis._throw) {
            aret = sandbox.analysis._throw(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        return (lastComputedValue = val);
    }

    // Return statement
    function Rt(iid, val) {
        var aret;
        if (sandbox.analysis && sandbox.analysis._return) {
            aret = sandbox.analysis._return(iid, val);
            if (aret) {
                val = aret.result;
            }
        }
        returnStack.pop();
        returnStack.push(val);
        return (lastComputedValue = val);
    }

    // Actual return from function, invoked from 'finally' block
    // added around every function by instrumentation.  Reads
    // the return value stored by call to Rt()
    function Ra() {
        var returnVal = returnStack.pop();
        wrappedExceptionVal = undefined;
        return returnVal;
    }

    // Function enter
    function Fe(iid, f, dis /* this */, args) {
        argIndex = 0;
        returnStack.push(undefined);
        wrappedExceptionVal = undefined;
        updateSid(f);
        if (sandbox.analysis && sandbox.analysis.functionEnter) {
            sandbox.analysis.functionEnter(iid, f, dis, args);
        }
    }

    // Function exit
    function Fr(iid) {
        var isBacktrack = false, tmp, aret, returnVal;

        returnVal = returnStack.pop();
        if (sandbox.analysis && sandbox.analysis.functionExit) {
            aret = sandbox.analysis.functionExit(iid, returnVal, wrappedExceptionVal);
            if (aret) {
                returnVal = aret.returnVal;
                wrappedExceptionVal = aret.wrappedExceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        rollBackSid();
        if (!isBacktrack) {
            returnStack.push(returnVal);
        }
        // if there was an uncaught exception, throw it
        // here, to preserve exceptional control flow
        if (wrappedExceptionVal !== undefined) {
            tmp = wrappedExceptionVal.exception;
            wrappedExceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }

    // Script enter
    function Se(iid, val, origFileName) {
        createAndAssignNewSid();
        if (sandbox.analysis && sandbox.analysis.scriptEnter) {
            sandbox.analysis.scriptEnter(iid, val, origFileName);
        }
        lastComputedValue = undefined;
    }

    // Script exit
    function Sr(iid) {
        var tmp, aret, isBacktrack;
        if (sandbox.analysis && sandbox.analysis.scriptExit) {
            aret = sandbox.analysis.scriptExit(iid, wrappedExceptionVal);
            if (aret) {
                wrappedExceptionVal = aret.wrappedExceptionVal;
                isBacktrack = aret.isBacktrack;
            }
        }
        rollBackSid();
        if (wrappedExceptionVal !== undefined) {
            tmp = wrappedExceptionVal.exception;
            wrappedExceptionVal = undefined;
            throw tmp;
        }
        return isBacktrack;
    }


    // Modify and assign +=, -= ...
    function A(iid, base, offset, op, flags) {
        var bFlags = decodeBitPattern(flags, 1); // [isComputed]
        // avoid iid collision: make sure that iid+2 has the same source map as iid (@todo)
        var oprnd1 = G(iid+2, base, offset, createBitPattern(bFlags[0], true, false));
        return function (oprnd2) {
            // still possible to get iid collision with a mem operation
            var val = B(iid, op, oprnd1, oprnd2, createBitPattern(false, true, false));
            return P(iid, base, offset, val, createBitPattern(bFlags[0], true));
        };
    }

    // Binary operation
    function B(iid, op, left, right, flags) {
        var bFlags = decodeBitPattern(flags, 3); // [isComputed, isOpAssign, isSwitchCaseComparison]
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.binaryPre) {
            aret = sandbox.analysis.binaryPre(iid, op, left, right, bFlags[1], bFlags[2], bFlags[0]);
            if (aret) {
                op = aret.op;
                left = aret.left;
                right = aret.right;
                skip = aret.skip;
            }
        }


        if (!skip) {
            switch (op) {
                case "+":
                    result = left + right;
                    break;
                case "-":
                    result = left - right;
                    break;
                case "*":
                    result = left * right;
                    break;
                case "/":
                    result = left / right;
                    break;
                case "%":
                    result = left % right;
                    break;
                case "<<":
                    result = left << right;
                    break;
                case ">>":
                    result = left >> right;
                    break;
                case ">>>":
                    result = left >>> right;
                    break;
                case "<":
                    result = left < right;
                    break;
                case ">":
                    result = left > right;
                    break;
                case "<=":
                    result = left <= right;
                    break;
                case ">=":
                    result = left >= right;
                    break;
                case "==":
                    result = left == right;
                    break;
                case "!=":
                    result = left != right;
                    break;
                case "===":
                    result = left === right;
                    break;
                case "!==":
                    result = left !== right;
                    break;
                case "&":
                    result = left & right;
                    break;
                case "|":
                    result = left | right;
                    break;
                case "^":
                    result = left ^ right;
                    break;
                case "delete":
                    result = delete left[right];
                    break;
                case "instanceof":
                    result = left instanceof right;
                    break;
                case "in":
                    result = left in right;
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.binary) {
            aret = sandbox.analysis.binary(iid, op, left, right, result, bFlags[1], bFlags[2], bFlags[0]);
            if (aret) {
                result = aret.result;
            }
        }
        return (lastComputedValue = result);
    }


    // Unary operation
    function U(iid, op, left) {
        var result, aret, skip = false;

        if (sandbox.analysis && sandbox.analysis.unaryPre) {
            aret = sandbox.analysis.unaryPre(iid, op, left);
            if (aret) {
                op = aret.op;
                left = aret.left;
                skip = aret.skip
            }
        }

        if (!skip) {
            switch (op) {
                case "+":
                    result = +left;
                    break;
                case "-":
                    result = -left;
                    break;
                case "~":
                    result = ~left;
                    break;
                case "!":
                    result = !left;
                    break;
                case "typeof":
                    result = typeof left;
                    break;
                case "void":
                    result = void(left);
                    break;
                default:
                    throw new Error(op + " at " + iid + " not found");
                    break;
            }
        }

        if (sandbox.analysis && sandbox.analysis.unary) {
            aret = sandbox.analysis.unary(iid, op, left, result);
            if (aret) {
                result = aret.result;
            }
        }
        return (lastComputedValue = result);
    }

    function pushSwitchKey() {
        switchKeyStack.push(switchLeft);
    }

    function popSwitchKey() {
        switchLeft = switchKeyStack.pop();
    }

    function last() {
        return (lastComputedValue = lastVal);
    }

    // Switch key
    // E.g., for 'switch (x) { ... }',
    // C1 is invoked with value of x
    function C1(iid, left) {
        switchLeft = left;
        return (lastComputedValue = left);
    }

    // case label inside switch
    function C2(iid, right) {
        var aret, result;

        // avoid iid collision; iid may not have a map in the sourcemap
        result = B(iid+1, "===", switchLeft, right, createBitPattern(false, false, true));

        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, result);
            if (aret) {
                if (result && !aret.result) {
                    right = !right;
                } else if (result && aret.result) {
                    right = switchLeft;
                }
            }
        }
        return (lastComputedValue = right);
    }

    // Expression in conditional
    function C(iid, left) {
        var aret;
        if (sandbox.analysis && sandbox.analysis.conditional) {
            aret = sandbox.analysis.conditional(iid, left);
            if (aret) {
                left = aret.result;
            }
        }

        lastVal = left;
        return (lastComputedValue = left);
    }

    function S(iid, f) {
        if (sandbox.analysis && sandbox.analysis.runInstrumentedFunctionBody) {
            return sandbox.analysis.runInstrumentedFunctionBody(iid, f, getPropSafe(f, SPECIAL_PROP_IID), getPropSafe(f, SPECIAL_PROP_SID));
        }
        return true;
    }

    function L() {
        return lastComputedValue;
    }


    function X1(iid, val) {
        if (sandbox.analysis && sandbox.analysis.endExpression) {
            sandbox.analysis.endExpression(iid);
        }

        return (lastComputedValue = val);
    }

    function endExecution() {
        if (sandbox.analysis && sandbox.analysis.endExecution) {
            return sandbox.analysis.endExecution();
        }
    }


    function log(str) {
        if (sandbox.Results && sandbox.Results.execute) {
            sandbox.Results.execute(function(div, jquery, editor){
                div.append(str+"<br>");
            });
        } else {
            console.log(str);
        }
    }


    //----------------------------------- End Jalangi Library backend ---------------------------------

    sandbox.U = U; // Unary operation
    sandbox.B = B; // Binary operation
    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
    sandbox._ = last;  // Last value passed to C

    sandbox.H = H; // hash in for-in
    sandbox.I = I; // Ignore argument
    sandbox.G = G; // getField
    sandbox.P = P; // putField
    sandbox.R = R; // Read
    sandbox.W = W; // Write
    sandbox.N = N; // Init
    sandbox.T = T; // object/function/regexp/array Literal
    sandbox.F = F; // Function call
    sandbox.M = M; // Method call
    sandbox.A = A; // Modify and assign +=, -= ...
    sandbox.Fe = Fe; // Function enter
    sandbox.Fr = Fr; // Function return
    sandbox.Se = Se; // Script enter
    sandbox.Sr = Sr; // Script return
    sandbox.Rt = Rt; // returned value
    sandbox.Th = Th; // thrown value
    sandbox.Ra = Ra;
    sandbox.Ex = Ex;
    sandbox.L = L;
    sandbox.X1 = X1; // top level expression
    sandbox.Wi = Wi; // with statement
    sandbox.endExecution = endExecution;

    sandbox.S = S;

    sandbox.EVAL_ORG = EVAL_ORG;
    sandbox.log = log;
})(J$);


J$.initParams = {};
/* global J$ */

"use strict";

(function (sandbox) {
	sandbox.runTimeInfo = {};

}(J$));

/**
 * @file A library to associate shadow objects and unique ids to JavaScript objects and activation frames.
 * @author  Koushik Sen (Main contribution)
 * @author  Fernando Cristiani (Small contribution)
 */

(function (sandbox) {
    /**
     * <p>
     * SMemory associates a unique object with every JavaScript object, function, and activation frame during an execution.
     * (Note that a shadow object cannot associated with primitive values, undefined, or null.)  A shadow object can be used
     * to store meta-information about an object (e.g. the location at which the object was created).  Each shadow
     * object has an unique id, which can be treated as the logical address of the corresponding JavaScript object or
     * activation frame.
     * <p>
     * To use smemory, one must include --analysis $JALANGI_HOME/src/js/sample_analyses/ChainedAnalyses.js
     * --analysis $JALANGI_HOME/src/js/runtime/SMemory.js as the first two --analysis options during an analysis.
     * smemory can be accessed via J$.smemory or sandbox.smemory.  The smemory object defines several methods.
     * Those methods can be used to obtain the shadow memory for an object property or a program variable,
     * respectively.  getShadowObject should be used in getFieldPre, putFieldPre, and literal callbacks.  (In a literal
     * callback with an object literal, one must go over all the own properties of the literal object to suitably update
     * shadow object.) getShadowFrame should only be used in declare, read, and write callbacks.
     *<p>
     *
     * @global
     * @class
     */
    function SMemory() {
        var Constants = sandbox.Constants;

        var PREFIX = Constants.JALANGI_VAR;
        var SPECIAL_PROP_SOBJECT = "*" + PREFIX + "O*";
        var SPECIAL_PROP_FRAME = "*" + PREFIX + "F*";
        var SPECIAL_PROP_ACTUAL = "*" + PREFIX + "A*";
        var objectId = 1;
        var frameId = 2;
        var scriptCount = 0;
        var HOP = Constants.HOP;


        var frame = Object.create(null);

        var frameStack = [frame];
        var evalFrames = [];

        var processEnv = !sandbox.Constants.isBrowser && process && process.env;
        var shadowEnv = Object.create(null);
        if (processEnv) {
            shadowEnv[SPECIAL_PROP_SOBJECT] = objectId;
            shadowEnv[SPECIAL_PROP_ACTUAL] = process.env;
            objectId += 2;
        }

        this.getSpecialPropActual = function() {
            return SPECIAL_PROP_ACTUAL;
        };

        this.getSpecialPropSObject = function() {
            return SPECIAL_PROP_SOBJECT;
        };


        // public function
        /**
         * This method should be called on a base object and a property name to retrieve the shadow object associated with
         * the object that actually owns the
         * property. When the program performs a putField operation, the third argument should be false and the returned
         * object is the shadow object associated with the base object.  When the program performs a getField operation,
         * the third argument should be true and the returned object is the shadow object associated with the object in the
         * prototype chain (or the base object) which owns the property.  For a getField operation, the returned value
         * is undefined if none of the
         * objects in the prototype chain owns the property.  The return value is an object with two properties: "owner"
         * points to the shadow object and "isProperty" indicates if the property is a concrete property of the object or
         * if the property denotes a getter/setter.
         *
         * @param obj - The base object
         * @param prop - The property name
         * @param isGetField - True if the property access is a getField operation
         * @returns {{owner: Object, isProperty: boolean}}
         */
        this.getShadowObject = function (obj, prop, isGetField) {
            var ownerAndAccess = getOwnerAndAccess(obj, prop, isGetField);
            if (ownerAndAccess.owner !== undefined) {
                ownerAndAccess.owner = this.getShadowObjectOfObject(ownerAndAccess.owner);
            }
            return ownerAndAccess;
        };

        // public function
        /**
         * This method returns the shadow object associated with the activation frame that contains the variable "name".
         *
         * @param name - Name of the variable whose owner activation frame's shadow object we want to retrieve
         * @returns {Object} -  The shadow object of the activation frame owning the variable.
         */
        this.getShadowFrame = function (name) {
            var f = this.getFrame(name);
            var ret = this.getShadowObjectOfObject(f);
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(ret, SPECIAL_PROP_ACTUAL, {
                    enumerable: false,
                    writable: true
                });
            }
            ret[SPECIAL_PROP_ACTUAL] = f[SPECIAL_PROP_ACTUAL];
            return ret;
        };

        // public function
        /**
         * Given a shadow object or frame, it returns the unique id of the shadow object or frame.  It returns undefined,
         * if obj is undefined, null, or not a valid shadow object.
         * @param obj
         * @returns {number|undefined}
         */

        this.getIDFromShadowObjectOrFrame = function (obj) {
            if (obj === undefined || obj === null) return undefined;
            return obj[SPECIAL_PROP_SOBJECT];
        };

        // public function
        /**
         * Given a shadow object, it returns the actual object.
         * Given a shadow frame, it returns the function whose invocation created the frame.
         *
         * @param obj
         * @returns {*}
         */
        this.getActualObjectOrFunctionFromShadowObjectOrFrame = function (obj) {
            return obj[SPECIAL_PROP_ACTUAL];
        };


        /**
         * This method returns the shadow object associated with the activation frame that contains the variable "name".  To get the current activation frame,
         * call J$.smemory.getFrame("this");
         *
         * @param name - Name of the variable whose owner activation frame's shadow object we want to retrieve
         * @returns {Object} -  The shadow object of the activation frame owning the variable.
         */
        this.getFrame = function (name) {
            var tmp = frame;
            while (tmp && !HOP(tmp, name)) {
                tmp = tmp[SPECIAL_PROP_FRAME];
            }
            if (tmp) {
                return tmp;
            } else {
                return frameStack[0]; // return global scope
            }
        };


        /**
         * This method returns the shadow object associated with the argument.  If the argument cannot be associated with a shadow
         * object, the function returns undefined.
         *
         * @param val - The object whose shadow object the function returns
         * @returns {Object|undefined} - Returns the shadow object associated with val.  Return undefined if there is no shadow object assocaited with val
         * Note that a shadow object cannot be associated with a primitive value: number, string, boolean, undefined, or null.
         */
        this.getShadowObjectOfObject = function (val) {
            if (processEnv && val === process.env) {
              return shadowEnv;
            }
            var value;
            createShadowObject(val);
            var type = typeof val;
            if ((type === 'object' || type === 'function') && val !== null && HOP(val, SPECIAL_PROP_SOBJECT)) {
                if (typeof val[SPECIAL_PROP_SOBJECT] === 'object') { 
                  value = val[SPECIAL_PROP_SOBJECT];
                }
            } else {
                value = undefined;
            }
            return value;
        };



        function getOwnerAndAccess(obj, prop, isGetField) {
            if (typeof Object.getOwnPropertyDescriptor !== 'function') {
                throw new Error("Cannot call getOwnPropertyDescriptor on Object.");
            }
            var oldObj = obj;
            while (obj !== null) {
                if (typeof obj !== 'object' && typeof obj !== 'function') {
                    return false;
                }
                var desc = Object.getOwnPropertyDescriptor(obj, prop);
                if (desc !== undefined) {
                    if (isGetField && typeof desc.get === 'function') {
                        return {"owner": obj, "isProperty": false};
                    }
                    if (!isGetField && typeof desc.set === 'function') {
                        return {"owner": obj, "isProperty": false};
                    }
                }
                if (isGetField && HOP(obj, prop)) {
                    return {"owner": obj, "isProperty": true};
                }
                obj = obj.__proto__;
            }
            if (!isGetField) {
                return {"owner": oldObj, "isProperty": true};
            } else {
                return {"owner": undefined, "isProperty": true};
            }
        }

        function createShadowObject(val) {
            var type = typeof val;
            if ((type === 'object' || type === 'function') && val !== null && !HOP(val, SPECIAL_PROP_SOBJECT)) {
                if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                    Object.defineProperty(val, SPECIAL_PROP_SOBJECT, {
                        enumerable: false,
                        writable: true,
                        configurable: true
                    });
                    Object.defineProperty(val, SPECIAL_PROP_ACTUAL, {
                        enumerable: false,
                        writable: true
                    });
                }
                try {
                    val[SPECIAL_PROP_SOBJECT] = Object.create(null);
                    val[SPECIAL_PROP_SOBJECT][SPECIAL_PROP_SOBJECT] = objectId;
                    val[SPECIAL_PROP_SOBJECT][SPECIAL_PROP_ACTUAL] = val;
                    objectId = objectId + 2;
                } catch (e) {
                    // cannot attach special field in some DOM Objects.  So ignore them.
                }
            }

        }

        this.defineFunction = function (f) {
            if (typeof f === 'function') {
                if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                    Object.defineProperty(f, SPECIAL_PROP_FRAME, {
                        enumerable: false,
                        writable: true
                    });
                }
                f[SPECIAL_PROP_FRAME] = frame;
            }
        };

        //this.evalBegin = function (isDirect) {
        //    evalFrames.push(frame);
        //    if (!isDirect)
        //        frame = frameStack[0];
        //};

        //this.evalEnd = function () {
        //    frame = evalFrames.pop();
        //};


        this.initialize = function (name) {
            frame[name] = undefined;
        };

        this.functionEnter = function (val) {
            frameStack.push(frame = Object.create(null));
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(frame, SPECIAL_PROP_FRAME, {
                    enumerable: false,
                    writable: true
                });
                Object.defineProperty(frame, SPECIAL_PROP_ACTUAL, {
                    enumerable: false,
                    writable: true
                });
            }
            frame[SPECIAL_PROP_FRAME] = val[SPECIAL_PROP_FRAME];
            frame[SPECIAL_PROP_ACTUAL] = val;
        };

        this.functionReturn = function () {
            frameStack.pop();
            frame = frameStack[frameStack.length - 1];
        };

        var isEvalScript = [];

        this.scriptEnter = function (instrumentedFileName, originalFileName) {
            scriptCount++;
            if (scriptCount > 0) {
                if (!(originalFileName === 'eval' && instrumentedFileName === originalFileName)) {
                    if (Constants.isBrowser) {
                        frame = frameStack[0];
                    } else {
                        frameStack.push(frame = Object.create(null));
                        frame[SPECIAL_PROP_FRAME] = frameStack[0];
                    }
                    isEvalScript.push(false);
                } else {
                    isEvalScript.push(true);
                }
            }
        };

        this.scriptReturn = function () {
            if (scriptCount > 0 && !isEvalScript.pop()) {
                if (!Constants.isBrowser) {
                    frameStack.pop();
                }
                frame = frameStack[frameStack.length - 1];
            }
            scriptCount--;
        };

    }

    var smemory = sandbox.smemory = new SMemory();
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function getTypeOf(val) {
		if (val === null) {
			return "null";
		}

		if (typeof val === "object" && val instanceof Array) {
			return "array";
		}

		return typeof val;
	}

	function getTypeOfForReporting(val) {
		var argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;

		if (getTypeOf(val) == "object") {
			if (val[argumentWrapperObjectBuilder.getOriginalTypeOfField()]) {
				return val[argumentWrapperObjectBuilder.getOriginalTypeOfField()];
			}

			if(val.constructor && val.constructor.name !== "Object") {
				return val.constructor.name;
			}
		}

		return getTypeOf(val);
	}

	function getDeclarationEnclosingFunctionId(functionsExecutionStack) {
		if (!functionsExecutionStack.isThereAFunctionExecuting()) {
			return -1;
		}

		return functionsExecutionStack.getCurrentExecutingFunction();
	}

	function addDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack, sMemoryInterface) {
		function propertyIsWritable(obj, key) {
			let description =  Object.getOwnPropertyDescriptor(obj, key);

			return (description !== undefined && description.writable === true);
		}

		let objects = [];

		function doAddDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack, sMemoryInterface) {
			if (getTypeOf(val) == "object") {
				if (objects.indexOf(val) === -1) {
					objects.push(val);

					for (var key in val) {
						if (propertyIsWritable(val, key)) {
							if (getTypeOf(val[key]) == "function") {
								val[key].declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(functionsExecutionStack);
							}

							doAddDeclarationFunctionIdToFunctionsInsideObject(
								val[key],
								functionsExecutionStack,
								sMemoryInterface
							);
						}
					}
				}
			}

			return val;
		}

		return doAddDeclarationFunctionIdToFunctionsInsideObject(val, functionsExecutionStack, sMemoryInterface);
	}

	function getHashForShadowIdAndFunctionId(shadowId, functionId) {
		return shadowId + " - " + functionId;
	}

	function getRandomIdentifier() {
		var now = new Date();
		return Math.floor((Math.random() * 1000) + 1).toString() + now.getTime();
	}

	sandbox.functions = {
		getTypeOf: getTypeOf,
		getTypeOfForReporting: getTypeOfForReporting,
		getDeclarationEnclosingFunctionId: getDeclarationEnclosingFunctionId,
		addDeclarationFunctionIdToFunctionsInsideObject: addDeclarationFunctionIdToFunctionsInsideObject,
		getHashForShadowIdAndFunctionId: getHashForShadowIdAndFunctionId,
		getRandomIdentifier: getRandomIdentifier,
	};
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
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

		this.isEmpty = function() {
			return (this.s.length === 0);
		};
	}

	function FunctionsExecutionStack() {
		this.stack = new Stack();

		this.addExecution = function(iid) {
			this.stack.push(iid);
		};

		this.stopExecution = function() {
			this.stack.pop();
		};

		this.getCurrentExecutingFunction = function() {
			return this.stack.top();
		};

		this.isThereAFunctionExecuting = function() {
			return !this.stack.isEmpty();
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.functionsExecutionStack = new FunctionsExecutionStack();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function SMemoryInterface(sMemory) {
		this.sMemory = sMemory;

		this.getShadowIdOfObject = function(obj) {
			var shadowObj = this.sMemory.getShadowObjectOfObject(obj);
			var shadowId = this.sMemory.getIDFromShadowObjectOrFrame(shadowObj);

			if (shadowId === undefined) {
				return null;
			}

			return shadowId;
		};

		this.getSpecialPropActual = function() {
			return this.sMemory.getSpecialPropActual();
		};

		this.getSpecialPropSObject = function() {
			return this.sMemory.getSpecialPropSObject();
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.sMemoryInterface = new SMemoryInterface(sandbox.smemory);
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOf = sandbox.functions.getTypeOf;

	function ObjectSerializer(smemoryInterface) {
		this.smemoryInterface = smemoryInterface;

		var dis = this;

		this.serializeStructure = function(obj) {
			var objSerialized = "";

			if (getTypeOf(obj) == "object") {
				var objKeys = Object.keys(obj).sort().filter(function(elem) {
					return !elem.startsWith(dis.smemoryInterface.getSpecialPropSObject());
				});

				objSerialized = JSON.stringify(objKeys);
				objSerialized += "__constructorName__: " + obj.constructor.name;
			}

			return objSerialized;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

    sandbox.utils.objectSerializer = new ObjectSerializer(sandbox.utils.sMemoryInterface);
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function InteractionSerializer(objectSerializer) {
		this.objectSerializer = objectSerializer;

		this.serialize = function(interaction, obj) {
			var interactionKey = stringify(interaction);
			var objSerialized = this.objectSerializer.serializeStructure(obj);

			return interactionKey + "|" + objSerialized;
		};

		function stringify(o) {
			var cache = [];
			let s = JSON.stringify(o, function(key, value) {
				if (typeof value === 'object' && value !== null) {
					if (cache.indexOf(value) !== -1) {
						return;
					}

					cache.push(value);
				}

				return value;
			});

			cache = null;
			return s;
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionSerializer = new InteractionSerializer(sandbox.utils.objectSerializer);
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getHashForShadowIdAndFunctionId = sandbox.functions.getHashForShadowIdAndFunctionId;

	function ArgumentContainerFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
        this.sMemoryInterface = sMemoryInterface;

        this.mapShadowIdsArgumentContainer = {};

        this.findArgumentContainer = function(shadowId, functionId) {
            var fId = functionId;
            var argumentContainer = this.mapShadowIdsArgumentContainer[
                getHashForShadowIdAndFunctionId(shadowId, fId)
            ];

            var functionContainer = null;
            while(!argumentContainer && fId) {

                functionContainer = this.runTimeInfo[fId];

                argumentContainer = this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionId(shadowId, fId)
                ];

                if (!functionContainer) {
                    fId = null;
                } else {
                    fId = functionContainer.declarationEnclosingFunctionId;
                }
            }

            return argumentContainer;
        };

        this.addMappingForContainers = function(argumentContainer, functionContainer, val) {
            var shadowId = this.sMemoryInterface.getShadowIdOfObject(val);

            if (shadowId) {
                this.mapShadowIdsArgumentContainer[
                    getHashForShadowIdAndFunctionId(
                        shadowId,
                        functionContainer.functionId
                    )
                ] = functionContainer.getArgumentContainer(argumentContainer.argumentIndex);
            }
        };
	}

    if (sandbox.utils === undefined) {
        sandbox.utils = {};
    }

    sandbox.utils.argumentContainerFinder = new ArgumentContainerFinder(
        sandbox.runTimeInfo,
        sandbox.utils.sMemoryInterface
    );
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getHashForShadowIdAndFunctionId = sandbox.functions.getHashForShadowIdAndFunctionId;

	function InteractionFinder(runTimeInfo, sMemoryInterface) {
		this.runTimeInfo = runTimeInfo;
		this.sMemoryInterface = sMemoryInterface;

		this.mapShadowIdsInteractions = {};

		this.findInteraction = function(shadowId, functionId) {
			var fId = functionId;
			var mappedInteraction = this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionId(shadowId, fId)
			];

			var functionContainer = null;
			while(!mappedInteraction && fId) {
				functionContainer = this.runTimeInfo[fId];

				mappedInteraction = this.mapShadowIdsInteractions[
					getHashForShadowIdAndFunctionId(shadowId, fId)
				];

				if (!functionContainer) {
					fId = null;
				} else {
					fId = functionContainer.declarationEnclosingFunctionId;
				}
			}

			return mappedInteraction;
		};

		this.addMapping = function(interaction, functionId, result) {
			var shadowId = this.sMemoryInterface.getShadowIdOfObject(result);

			if (shadowId && functionId) {
				this.mapShadowIdsInteractions[
				getHashForShadowIdAndFunctionId(
					shadowId,
					functionId
				)] = interaction;
			}
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionFinder = new InteractionFinder(
		sandbox.runTimeInfo,
		sandbox.utils.sMemoryInterface
	);
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function RecursiveInteractionsHandler(sMemoryInterface, interactionSerializer) {
		this.sMemoryInterface = sMemoryInterface;

		this.usedInteractions = {};
		this.mapRecursiveMainInteractions = {};

		this.interactionSerializer = interactionSerializer;

		var dis = this;

		this.getMainInteractionForCurrentInteraction = function(interaction) {
			var shadowIdInteraction = this.sMemoryInterface.getShadowIdOfObject(interaction);
			if (
				shadowIdInteraction &&
				shadowIdInteraction in this.mapRecursiveMainInteractions) {

				return this.mapRecursiveMainInteractions[shadowIdInteraction];
			}

			return interaction;
		};

		this.associateMainInteractionToCurrentInteraction = function(interaction, result) {
			if (this.interactionAlreadyUsed(interaction, result)) {
				var shadowIdInteraction = this.sMemoryInterface.getShadowIdOfObject(interaction);
				var interactionKey = getInteractionKey(interaction, result);
				
				this.mapRecursiveMainInteractions[shadowIdInteraction] = this.usedInteractions[interactionKey];
			}
		};

		this.reportUsedInteraction = function(interaction, result) {
			var interactionKey = getInteractionKey(interaction, result);

			this.usedInteractions[interactionKey] = interaction;
		};

		this.interactionAlreadyUsed = function(interaction, result) {
			var interactionKey = getInteractionKey(interaction, result);

			return (interactionKey in this.usedInteractions);
		};

		function getInteractionKey(interaction, obj) {
			return dis.interactionSerializer.serialize(interaction, obj);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.recursiveInteractionsHandler = new RecursiveInteractionsHandler(
		sandbox.utils.sMemoryInterface,
		sandbox.utils.interactionSerializer
	);

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function ArgumentWrapperObjectBuilder() {
		this.getOriginalTypeOfField = function() {
			return "__ORIGINAL_TYPEOF__";
		};

		this.buildFromString = function(
			/* jshint ignore:start */
			val
			/* jshint ignore:end */
		) {
			let wrapperObj;
			/* jshint ignore:start */
			wrapperObj = new String(val);
			wrapperObj.TARGET_PROXY = val;
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "string";

			return wrapperObj;
		};

		this.buildFromNumber = function(
			/* jshint ignore:start */
			val
			/* jshint ignore:end */
		) {
			let wrapperObj;
			/* jshint ignore:start */
			wrapperObj = new Number(val);
			wrapperObj.TARGET_PROXY = val;
			/* jshint ignore:end */

			wrapperObj[this.getOriginalTypeOfField()] = "number";

			return wrapperObj;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentWrapperObjectBuilder = new ArgumentWrapperObjectBuilder();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function FunctionIdHandler() {
		let counter = 1;
		let prefix = "functionId_";
		let functionIdField = "functionId";

		this.setFunctionId = function(f) {
			if (!f[functionIdField]) {
				f[functionIdField] = prefix + counter.toString();
				counter += 2;
			}

			return f[functionIdField];
		};

		this.getFunctionId = function(f) {
			return f[functionIdField];
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.functionIdHandler = new FunctionIdHandler();
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getRandomIdentifier = sandbox.functions.getRandomIdentifier;

	function ArgumentProxyBuilder(sMemoryInterface) {
		this.sMemoryInterface = sMemoryInterface;

		let shadowObjectKey = this.sMemoryInterface.getSpecialPropSObject();

		this.proxyMethodsIdentifier = "%%PROXY_METHOD%%";

		var dis = this;

		this.buildProxy = function(obj) {
			let p = new Proxy(
				obj,
				{
					uniqueShadowObjectKey: shadowObjectKey + "__PROXY__" + getRandomIdentifier(),
					set: function(target, property, value, receiver) {
						if (property === shadowObjectKey) {
							Object.defineProperty(receiver, this.uniqueShadowObjectKey, {
								value: value,
								enumerable: false,
								configurable: true,
								writable: true
							});
						}
						else {
							target[property] = value;
						}

						return true;
					},
					get: function(target, property, receiver) {
						if (property === "TARGET_PROXY") {
							return target;
						}

						if (property === shadowObjectKey) {
							return receiver[this.uniqueShadowObjectKey];
						} else {
							if (typeof target[property] === "function" && property !== "constructor") {
								if (!isProxyMethod(target, property)) {
									const origMethod = target[property];
									var f = cloneMethod(origMethod, target);

									target[getModifiedPropertyName(property)] = f;
									origMethod.proxyMethod = f;
								}

								return target[getModifiedPropertyName(property)];
							}

							return target[property];
						}
					},
					getOwnPropertyDescriptor: function(target, property) {
						if (property === shadowObjectKey) {
							var description = Object.getOwnPropertyDescriptor(target, this.uniqueShadowObjectKey);

							return description;
						}
						else {
							return Object.getOwnPropertyDescriptor(target, property);
						}
					}
				}
			);

			return p;
		};

		function transformToString(property) {
			if (typeof property === "symbol") {
				return property.toString();
			}

			return property;
		}

		function getModifiedPropertyName(property) {
			return transformToString(property) + dis.proxyMethodsIdentifier;
		}

		function cloneMethod(origMethod, target) {
			var f = function() {
				try {
					return origMethod.apply(this, arguments);
				} catch(error) {
					if (error instanceof TypeError) {
						return origMethod.apply(target, arguments);
					} else {
						throw error;
					}
				}
			};

			for(var key in origMethod) {
				if (origMethod.hasOwnProperty(key)) {
					f[key] = origMethod[key];
				}
			}

			return f;
		}

		function isProxyMethod(target, property) {
			return (target[getModifiedPropertyName(property)] !== undefined);
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.argumentProxyBuilder = new ArgumentProxyBuilder(sandbox.utils.sMemoryInterface);
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOf = sandbox.functions.getTypeOf;

	function InteractionWithResultHandler(
		interactionFinder,
		recursiveInteractionsHandler,
		sMemoryInterface,
		argumentContainerFinder
	) {

		this.interactionFinder = interactionFinder;
		this.recursiveInteractionsHandler = recursiveInteractionsHandler;
		this.sMemoryInterface = sMemoryInterface;
		this.argumentContainerFinder = argumentContainerFinder;

		var dis = this;

		this.processInteractionWithResult = function(interaction, functionId, result, base) {
			if (getTypeOf(result) == "object") {
				dis.interactionFinder.addMapping(interaction, functionId, result);
				dis.recursiveInteractionsHandler.associateMainInteractionToCurrentInteraction(
					interaction,
					result
				);
			}

			if (!addInteractionToArgumentContainerIfPossible(interaction, functionId, base)) {
				addFollowingInteraction(
					interaction,
					result,
					functionId,
					dis.sMemoryInterface.getShadowIdOfObject(base)
				);
			}
		};

		function addInteractionToArgumentContainerIfPossible(interaction, functionId, base) {
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, functionId);

			var interactionAdded = false;
			if (functionId && argumentContainer) {
				argumentContainer.addInteraction(interaction);
				interactionAdded = true;
			}

			return interactionAdded;
		}

		function addFollowingInteraction(interaction, result, functionId, shadowIdBaseObject) {
			var mappedInteraction = dis.interactionFinder.findInteraction(
				shadowIdBaseObject,
				functionId
			);

			if (mappedInteraction) {
				if (!dis.recursiveInteractionsHandler.interactionAlreadyUsed(interaction, result)) {
					mappedInteraction = dis.recursiveInteractionsHandler.getMainInteractionForCurrentInteraction(mappedInteraction);
					mappedInteraction.addFollowingInteraction(interaction);

					dis.recursiveInteractionsHandler.reportUsedInteraction(interaction, result);
				}
			}
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.interactionWithResultHandler = new InteractionWithResultHandler(
		sandbox.utils.interactionFinder,
		sandbox.utils.recursiveInteractionsHandler,
		sandbox.utils.sMemoryInterface,
		sandbox.utils.argumentContainerFinder
	);

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOf = sandbox.functions.getTypeOf;

	function WrapperObjectsHandler(
		sMemoryInterface,
		argumentWrapperObjectBuilder,
		argumentProxyBuilder
	) {
		this.argumentWrapperObjectBuilder = argumentWrapperObjectBuilder;
		this.argumentProxyBuilder = argumentProxyBuilder;

		var dis = this;

		this.objectIsWrapperObject = function(obj) {
			return (obj && (obj.TARGET_PROXY !== undefined));
		};

		this.getRealValueFromWrapperObject = function(obj) {
 			return obj.TARGET_PROXY;
		};

		this.convertToWrapperObjectIfItIsALiteral = function(originalValue) {
			let newValue;

			switch(getTypeOf(originalValue)) {
				case "string":
					newValue = dis.argumentWrapperObjectBuilder.buildFromString(originalValue);
					break;

				case "number":
					newValue = dis.argumentWrapperObjectBuilder.buildFromNumber(originalValue);
					break;
			}

			if (!newValue) {
				newValue = originalValue;
			}

			return newValue;
		};

		this.convertToProxyIfItIsAnObject = function(originalValue) {
			let newValue;

			if (
				getTypeOf(originalValue) == "object" &&
				!(originalValue instanceof String) &&
				!(originalValue instanceof Number)  &&
				!((typeof Node === 'function') && originalValue instanceof Node)
			) {
				newValue = dis.argumentProxyBuilder.buildProxy(originalValue);
			}

			if (!newValue) {
				newValue = originalValue;
			}

			return newValue;
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.wrapperObjectsHandler = new WrapperObjectsHandler(
		sandbox.utils.sMemoryInterface,
		sandbox.utils.argumentWrapperObjectBuilder,
		sandbox.utils.argumentProxyBuilder
	);

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {

	function ArgumentContainer(argumentIndex, name) {
		this.argumentIndex = argumentIndex;
		this.argumentName = name;

		this.interactions = [];

		this.addInteraction = function(interaction) {
			this.interactions.push(interaction);
		};
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.ArgumentContainer = ArgumentContainer;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;

	function FunctionContainer(f, isConstructor) {
		this.functionId = f.functionId;
		this.functionName = getFunctionName(f);

		this.isConstructor = (isConstructor === true);
		this.args = {};
		this.declarationEnclosingFunctionId = f.declarationEnclosingFunctionId;
		this.returnTypeOfs = [];
		this.functionIid = null;

		this.addArgumentContainer = function(argumentIndex, argumentContainer) {
			if (!(argumentIndex in this.args)) {
				this.args[argumentIndex] = argumentContainer;
			} else {
				this.args[argumentIndex].interactions = this.args[argumentIndex].interactions.concat(argumentContainer.interactions);
			}
		};

		this.addReturnTypeOf = function(typeOf) {
			if (this.returnTypeOfs.indexOf(typeOf) === -1) {
				this.returnTypeOfs.push(getTypeOfForReporting(typeOf));
			}
		};

		this.getArgumentContainer = function(argumentIndex) {
			return this.args[argumentIndex];
		};

		function getFunctionName(f) {
			var functionName = f.name;

			if (f.methodName) {
				functionName = f.methodName;
			}

			return functionName;
		}
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.FunctionContainer = FunctionContainer;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function Interaction() {
		this.code = null;
	}

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.Interaction = Interaction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;
	var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;

	function ActiveInteraction() {
		Interaction.call(this);

		this.isComputed = null;
		this.isOpAssign = null;
		this.enclosingFunctionId = null;
		this.followingInteractions = [];
	}

	ActiveInteraction.prototype = Object.create(Interaction.prototype);
	ActiveInteraction.prototype.constructor = ActiveInteraction;

	ActiveInteraction.prototype.addFollowingInteraction = function(followingInteraction) {
		this.followingInteractions.push(followingInteraction);
	};

	ActiveInteraction.prototype.setReturnTypeOf = function(result) {
		this.returnTypeOf = getTypeOfForReporting(result);
	};

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.ActiveInteraction = ActiveInteraction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function GetFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'getField';
		
		this.returnTypeOf = null;
	}

	GetFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	GetFieldInteraction.prototype.constructor = GetFieldInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.GetFieldInteraction = GetFieldInteraction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function InputValueInteraction(type_of) {
		Interaction.call(this);

		this.code = "inputValue";
		this.typeof = type_of;
	}

	InputValueInteraction.prototype = Object.create(Interaction.prototype);
	InputValueInteraction.prototype.constructor = InputValueInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.InputValueInteraction = InputValueInteraction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function MethodCallInteraction(iid, methodName) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.methodName = methodName;

		this.code = 'methodCall';
		
		this.functionId = null;
		this.returnTypeOf = null;
	}

	MethodCallInteraction.prototype = Object.create(ActiveInteraction.prototype);
	MethodCallInteraction.prototype.constructor = MethodCallInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.MethodCallInteraction = MethodCallInteraction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var ActiveInteraction = sandbox.utils.ActiveInteraction;

	function PutFieldInteraction(iid, field) {
		ActiveInteraction.call(this);

		this.iid = iid;
		this.field = field;

		this.code = 'setField';

		this.typeof = null;
	}

	PutFieldInteraction.prototype = Object.create(ActiveInteraction.prototype);
	PutFieldInteraction.prototype.constructor = PutFieldInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.PutFieldInteraction = PutFieldInteraction;
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	var Interaction = sandbox.utils.Interaction;

	function UsedAsArgumentInteraction(currentActiveFiid, functionId, argIndex) {
		Interaction.call(this);

		this.code = "usedAsArgument";

		this.enclosingFunctionId = currentActiveFiid;
		this.targetFunctionId = functionId;
		this.argumentIndexInTargetFunction = argIndex;
	}

	UsedAsArgumentInteraction.prototype = Object.create(Interaction.prototype);
	UsedAsArgumentInteraction.prototype.constructor = UsedAsArgumentInteraction;

	if (sandbox.utils === undefined) {
		sandbox.utils = {};
	}

	sandbox.utils.UsedAsArgumentInteraction = UsedAsArgumentInteraction;
}(J$));
/* global J$ */

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

"use strict";

(function (sandbox) {
    function Analysis() {
        this.addAnalysis = function(analysis) {
            if (analysis.callbackName) {
                this[analysis.callbackName] = analysis.callback;
            }
        };

        this.endExecution = function() {
            console.log(JSON.stringify(sandbox.runTimeInfo, null, 4));
        };
    }

    var thisAnalysis = new Analysis();
    Object.defineProperty(sandbox, 'analysis', {
        get:function () {
            return thisAnalysis;
        },
        set:function (a) {
            thisAnalysis.addAnalysis(a);
        }
    });

    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function FunctionEnterAnalysis() {
		this.callbackName = "functionEnter";

		var FunctionContainer = sandbox.utils.FunctionContainer;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.functionIdHandler = sandbox.utils.functionIdHandler;

		var dis = this;

		this.callback = function(iid, f) {
			if (f.proxyMethod) {
				f = f.proxyMethod;
			}

			let functionId = dis.functionIdHandler.setFunctionId(f);
			let functionContainer;

			if (functionNotProcessed(f)) {
				functionContainer = new FunctionContainer(f);

				dis.runTimeInfo[functionId] = functionContainer;
			} else {
				functionContainer = dis.runTimeInfo[functionId];
			}

			functionContainer.functionIid = iid;

			dis.functionsExecutionStack.addExecution(functionId);
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}
	}

	sandbox.analysis = new FunctionEnterAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function FunctionExitAnalysis() {
		this.callbackName = "functionExit";

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;

		var dis = this;

		this.callback = function(iid, returnVal, wrappedExceptionVal) {
			dis.functionsExecutionStack.stopExecution();

			return {
				returnVal: returnVal,
				wrappedExceptionVal: wrappedExceptionVal,
				isBacktrack: false
			};
		};
	}

	sandbox.analysis = new FunctionExitAnalysis();
}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function DeclareAnalysis() {
		this.callbackName = "declare";

		var ArgumentContainer = sandbox.utils.ArgumentContainer;
		var getTypeOfForReporting = sandbox.functions.getTypeOfForReporting;
		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

		var InputValueInteraction = sandbox.utils.InputValueInteraction;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;

		var dis = this;

		this.callback = function(iid, name, val, isArgument, argumentIndex) {
			if (isAnArgumentOfAProcessedFunction(argumentIndex, isArgument)) {
				var functionContainer = getFunctionContainer();

				if (functionContainer) {
					var argumentContainer = buildArgumentContainer(argumentIndex, name, val);
					functionContainer.addArgumentContainer(argumentIndex, argumentContainer);

					dis.argumentContainerFinder.addMappingForContainers(argumentContainer, functionContainer, val);
				}
			}

			if (typeof val == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
			}

			return {
				result: val
			};

		};

		function isAnArgumentOfAProcessedFunction(argumentIndex, isArgument) {
			return (
				argumentIndex >= 0 &&
				isArgument === true &&
				dis.functionsExecutionStack.isThereAFunctionExecuting()
			);
		}

		function getFunctionContainer() {
			let functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			return dis.runTimeInfo[functionId];
		}

		function buildArgumentContainer(argumentIndex, name, val) {
			var argumentContainer = new ArgumentContainer(argumentIndex, name);
			argumentContainer.addInteraction(new InputValueInteraction(getTypeOfForReporting(val)));

			return argumentContainer;
		}
	}

	sandbox.analysis = new DeclareAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function InvokeFunPreAnalysis() {
		this.callbackName = "invokeFunPre";

		var FunctionContainer = sandbox.utils.FunctionContainer;
		var getTypeOf = sandbox.functions.getTypeOf;
		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;

		var UsedAsArgumentInteraction = sandbox.utils.UsedAsArgumentInteraction;

		var dis = this;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
		this.functionIdHandler = sandbox.utils.functionIdHandler;
		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		this.callback = function(
			iid,
			f,
			base,
			args,
			isConstructor,
			isMethod,
			functionIid
		) {

			if ((f !== undefined) && !isConsoleLog(f)) {
				dis.functionIdHandler.setFunctionId(f);

				for (var argIndex in args) {
					addDeclarationEnclosingFunctionIdIfApplicable(args[argIndex]);
					addUsedAsArgumentInteractionIfApplicable(args[argIndex], f, argIndex);
					convertToWrapperObjectIfItIsALiteral(args, argIndex);
					convertToProxyIfItIsAnObject(args, argIndex);
				}

				if (functionNotProcessed(f)) {
					var functionContainer = new FunctionContainer(f, isConstructor);
					functionContainer.functionIid = functionIid;

					dis.runTimeInfo[functionContainer.functionId] = functionContainer;
				}
			}

			return {
				f: f,
				base: base,
				args: args,
				skip: (f === undefined)
			};
		};

		function functionNotProcessed(f) {
			let functionId = dis.functionIdHandler.getFunctionId(f);
			return (functionId && !(functionId in dis.runTimeInfo));
		}

		function isConsoleLog(f) {
			return ((f.name === "bound consoleCall") || ((f.name === "log") && f.toString().indexOf("native code") !== -1));
		}

		function addDeclarationEnclosingFunctionIdIfApplicable(val) {
			if (getTypeOf(val) == "function") {
				if (!val.declarationEnclosingFunctionId) {
					val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
				}
			}
		}

		function addUsedAsArgumentInteractionIfApplicable(val, f, argIndex) {
			let functionId = dis.functionIdHandler.getFunctionId(f);

			if (getTypeOf(val) == "object") {
				var currentActiveFiid = dis.functionsExecutionStack.getCurrentExecutingFunction();
				var shadowId = dis.sMemoryInterface.getShadowIdOfObject(val);

				var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, currentActiveFiid);
				if (currentActiveFiid && argumentContainer) {
					var usedAsArgumentInteraction = new UsedAsArgumentInteraction(
						currentActiveFiid,
						functionId,
						argIndex
					);

					argumentContainer.addInteraction(usedAsArgumentInteraction);
				}
			}
		}

		function convertToWrapperObjectIfItIsALiteral(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.convertToWrapperObjectIfItIsALiteral(args[argIndex]);
		}

		function convertToProxyIfItIsAnObject(args, argIndex) {
			args[argIndex] = dis.wrapperObjectsHandler.convertToProxyIfItIsAnObject(args[argIndex]);
		}
	}

	sandbox.analysis = new InvokeFunPreAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function InvokeFunAnalysis() {
		this.callbackName = "invokeFun";

		var getTypeOf = sandbox.functions.getTypeOf;

		this.runTimeInfo = sandbox.runTimeInfo;
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.argumentWrapperObjectBuilder = sandbox.utils.argumentWrapperObjectBuilder;
		this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;

		var dis = this;

		this.callback = function(
			iid,
			f,
			base,
			args,
			result
		) {

			if (f !== undefined) {
				var functionContainer = getFunctionContainer(f);

				if (functionContainer) {
					functionContainer.addReturnTypeOf(result);

					if (f.lastInteraction) {
						var interaction = f.lastInteraction;
						interaction.setReturnTypeOf(result);

						result = changeResultToWrapperObjectIfItIsALiteral(result);

						dis.interactionWithResultHandler.processInteractionWithResult(
							interaction,
							dis.functionsExecutionStack.getCurrentExecutingFunction(),
							// Let variable 'f' be the function that executed the invokeFun() callback.
							// invokeFun() callback is executed after functionExit(),
							// so the current executing function is the function that executed function 'f'.
							result,
							base
						);
					}
				}
			}

			return {
				result: result
			};
		};

		function changeResultToWrapperObjectIfItIsALiteral(result) {
			switch(getTypeOf(result)) {
				case "string":
					return dis.argumentWrapperObjectBuilder.buildFromString(result);

				case "number":
					return dis.argumentWrapperObjectBuilder.buildFromNumber(result);

				default:
					return result;
			}
		}

		function getFunctionContainer(f) {
			return dis.runTimeInfo[f.functionId];
		}
	}

	sandbox.analysis = new InvokeFunAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function GetFieldPreAnalysis() {
		this.callbackName = "getFieldPre";

		var MethodCallInteraction = sandbox.utils.MethodCallInteraction;
		var GetFieldInteraction = sandbox.utils.GetFieldInteraction;

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.functionIdHandler = sandbox.utils.functionIdHandler;
		this.interactionWithResultHandler = sandbox.utils.interactionWithResultHandler;

		var dis = this;

		this.callback = function(
            iid,
            base,
            offset,
            isComputed,
            isOpAssign,
            isMethodCall
		) {
			if (isMethodCall === true) {
				processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid);
			} else {
				processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid);
			}

			return {
				skip: false,
				base: base,
				offset: offset
			};
		};

		function processGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var getFieldInteraction = getGetFieldInteraction(
				base,
				offset,
				isComputed,
				isOpAssign,
				iid
			);

			dis.interactionWithResultHandler.processInteractionWithResult(
				getFieldInteraction,
				dis.functionsExecutionStack.getCurrentExecutingFunction(),
				base[offset],
				base
			);
		}

		function getGetFieldInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new GetFieldInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			interaction.setReturnTypeOf(base[offset]);

			return interaction;
		}

		function processMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			if (base[offset] !== undefined) {
				base[offset].methodName = offset;

				var methodCallInteraction = getMethodCallInteraction(
					base,
					offset,
					isComputed,
					isOpAssign,
					iid
				);

				addFunctionIdToInteraction(methodCallInteraction, base[offset]);
			}
		}

		function getMethodCallInteraction(base, offset, isComputed, isOpAssign, iid) {
			var interaction = new MethodCallInteraction(iid, offset);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}

		function addFunctionIdToInteraction(interaction, f) {
			let functionId = dis.functionIdHandler.setFunctionId(f);

			interaction.functionId = functionId;
			f.lastInteraction = interaction;
		}
	}

	sandbox.analysis = new GetFieldPreAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function PutFieldPreAnalysis() {
		this.callbackName = "putFieldPre";

		var getDeclarationEnclosingFunctionId = sandbox.functions.getDeclarationEnclosingFunctionId;
		var getTypeOf = sandbox.functions.getTypeOf;
		var addDeclarationFunctionIdToFunctionsInsideObject = sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

		var PutFieldInteraction = sandbox.utils.PutFieldInteraction;
	
		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;
		this.argumentContainerFinder = sandbox.utils.argumentContainerFinder;
		this.interactionFinder = sandbox.utils.interactionFinder;

		var dis = this;

		this.callback = function(iid, base, offset, val, isComputed, isOpAssign) {
			val = addDeclarationEnclosingFunctionId(val);

			var interaction = getPutFieldInteracion(
				iid,
				offset,
				val,
				isComputed,
				isOpAssign
			);

			if (!addInteractionToArgumentContainerIfPossible(interaction, base)) {
				addFollowingInteractionToMappedInteraction(interaction, base);
			}

			return {
				base: base,
				offset: offset,
				val: val,
				skip: false
			};
		};

		function addInteractionToArgumentContainerIfPossible(interaction, base) {
			var functionId = dis.functionsExecutionStack.getCurrentExecutingFunction();
			var shadowId = dis.sMemoryInterface.getShadowIdOfObject(base);

			var argumentContainer = dis.argumentContainerFinder.findArgumentContainer(shadowId, functionId);

			var interactionAdded = false;
			if (functionId && argumentContainer) {
				argumentContainer.addInteraction(interaction);
				interactionAdded = true;
			}

			return interactionAdded;
		}

		function addFollowingInteractionToMappedInteraction(interaction, base) {
			var mappedInteraction = dis.interactionFinder.findInteraction(
				dis.sMemoryInterface.getShadowIdOfObject(base),
				dis.functionsExecutionStack.getCurrentExecutingFunction()
			);

			if (mappedInteraction) {
				mappedInteraction.addFollowingInteraction(interaction);
			}
		}

		function addDeclarationEnclosingFunctionId(val) {
			if (getTypeOf(val) == "function") {
				val.declarationEnclosingFunctionId = getDeclarationEnclosingFunctionId(dis.functionsExecutionStack);
			} else {
				val = addDeclarationFunctionIdToFunctionsInsideObject(
					val,
					dis.functionsExecutionStack,
					dis.sMemoryInterface
				);
			}

			return val;
		}

		function getPutFieldInteracion(iid, offset, val, isComputed, isOpAssign) {
			var interaction = new PutFieldInteraction(iid, offset);

			interaction.typeof = getTypeOf(val);
			interaction.isComputed = isComputed;
			interaction.isOpAssign = isOpAssign;
			interaction.enclosingFunctionId = dis.functionsExecutionStack.getCurrentExecutingFunction();

			return interaction;
		}
	}

	sandbox.analysis = new PutFieldPreAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function WriteAnalysis() {
		this.callbackName = "write";

		var addDeclarationFunctionIdToFunctionsInsideObject = sandbox.functions.addDeclarationFunctionIdToFunctionsInsideObject;

		this.functionsExecutionStack = sandbox.utils.functionsExecutionStack;
		this.sMemoryInterface = sandbox.utils.sMemoryInterface;

		var dis = this;

		this.callback = function(iid, name, val) {
			addDeclarationFunctionIdToFunctionsInsideObject(
				val,
				dis.functionsExecutionStack,
				dis.sMemoryInterface
			);

			return {
				result: val
			};
		};
	}

	sandbox.analysis = new WriteAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function BinaryPreAnalysis() {
		this.callbackName = "binaryPre";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function(
			iid,
			op,
			left,
			right
		) {

			let equalityOperations = [
				"==",
				"!=",
				"===",
				"!=="
			];

			if (equalityOperations.indexOf(op) !== -1) {
				left = replaceValueIfItIsAProxy(left);
				right = replaceValueIfItIsAProxy(right);
			}

			return {
				op: op,
				left: left,
				right: right,
				skip: false
			};
		};

		function replaceValueIfItIsAProxy(val) {
			if (dis.wrapperObjectsHandler.objectIsWrapperObject(val)) {
				return getRealObjectFromProxy(val);
			} else {
				return val;
			}
		}

		function getRealObjectFromProxy(val) {
			var targetObjectFromProxy = dis.wrapperObjectsHandler.getRealValueFromWrapperObject(val);

			if (dis.wrapperObjectsHandler.objectIsWrapperObject(targetObjectFromProxy)) {
				return getRealObjectFromProxy(targetObjectFromProxy);
			}

			return targetObjectFromProxy;
		}
	}

	sandbox.analysis = new BinaryPreAnalysis();

}(J$));
/* global J$ */

"use strict";

(function (sandbox) {
	function UnaryPreAnalysis() {
		this.callbackName = "unaryPre";

		this.wrapperObjectsHandler = sandbox.utils.wrapperObjectsHandler;

		var dis = this;

		this.callback = function (iid, op, left) {
			if (op === "typeof") {
				left = replaceValueIfItIsAWrapperObject(left);
			}

			return {
				op: op,
				left: left,
				skip: false
			};
		};

		function replaceValueIfItIsAWrapperObject(val) {
			if (dis.wrapperObjectsHandler.objectIsWrapperObject(val)) {
				return dis.wrapperObjectsHandler.getRealValueFromWrapperObject(val);
			} else {
				return val;
			}
		}
	}

	sandbox.analysis = new UnaryPreAnalysis();

}(J$));
