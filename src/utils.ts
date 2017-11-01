

export function isContainsBraces(query) {
    const bracesPattern = /.*\{.+\}.*?$/;
    return bracesPattern.test(query);
}

export function splitTemplateQuery(query) {
    const splitPattern = /\{[^\{\}]*\}|\{\/.*\/\}/g;
    let split;

    if (isContainsBraces(query)) {
        const result = query.match(splitPattern);
        split = _.map(result, (part) => {
            return _.trim(part, '{}').split(',');
        });
    } else {
        split = query.split(',');
    }

    return split;
}

export function getFirstTemplated(query) {

    const allTemplated = splitTemplateQuery(query);
    const splitPattern = /\{[^\{\}]*\}|\{\/.*\/\}/g;
    if (isContainsBraces(query)) {
        const matches = query.match(splitPattern);

        for (let i = 0; i < matches.length; i++) {
            console.log(i, 'QUERY\t', query, 'REGEX\t', matches[i], 'RAW\t', allTemplated[i][0]);
            query = query.replace(matches[i], allTemplated[i][0]);
        }

    }
    return query;
}
