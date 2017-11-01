"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isContainsBraces(query) {
    var bracesPattern = /.*\{.+\}.*?$/;
    return bracesPattern.test(query);
}
exports.isContainsBraces = isContainsBraces;
function splitTemplateQuery(query) {
    var splitPattern = /\{[^\{\}]*\}|\{\/.*\/\}/g;
    var split;
    if (isContainsBraces(query)) {
        var result = query.match(splitPattern);
        split = _.map(result, function (part) {
            return _.trim(part, '{}').split(',');
        });
    }
    else {
        split = query.split(',');
    }
    return split;
}
exports.splitTemplateQuery = splitTemplateQuery;
function getFirstTemplated(query) {
    var allTemplated = splitTemplateQuery(query);
    var splitPattern = /\{[^\{\}]*\}|\{\/.*\/\}/g;
    if (isContainsBraces(query)) {
        var matches = query.match(splitPattern);
        for (var i = 0; i < matches.length; i++) {
            console.log(i, 'QUERY\t', query, 'REGEX\t', matches[i], 'RAW\t', allTemplated[i][0]);
            query = query.replace(matches[i], allTemplated[i][0]);
        }
    }
    return query;
}
exports.getFirstTemplated = getFirstTemplated;
