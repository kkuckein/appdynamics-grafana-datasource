

export function isContainsBraces(query) {
    const bracesPattern = /.*\{.+\}.*?$/;
    return bracesPattern.test(query);
}

export function isContainsParenthesis(query) {
    const parenthesisPattern = /.*\(.+\).*?$/;
    return parenthesisPattern.test(query);

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

export function resolveMetricQueries(query) {
    const queries = [];
    const splitPattern = /\([^\()\)]*\)|\(\/.*\/\)/g;
    if (isContainsParenthesis(query)) {
        const matches = query.match(splitPattern);
        matches.forEach((element) => {
            const allPatterns = new RegExp(element, 'g');
            const possibleElements = element.match(allPatterns);
            possibleElements.forEach((possibleElement) => {
                queries.push(query.replace(element, possibleElement));
            });

        });

    } else {
        return [query];
    }
    return queries;
}

export function getFirstTemplated(query) {

    const allTemplated = splitTemplateQuery(query);
    const splitPattern = /\{[^\{\}]*\}|\{\/.*\/\}/g;
    if (isContainsBraces(query)) {
        const matches = query.match(splitPattern);
        for (let i = 0; i < matches.length; i++) {
            query = query.replace(matches[i], allTemplated[i][0]);
        }
    }
    return query;
}
