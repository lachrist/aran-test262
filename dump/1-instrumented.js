'use strict';
var thrownError = new Error('Catch me.');
var obj = {
    [Symbol.iterator]() {
        return {
            next() {
                return {
                    value: 1,
                    done: false
                };
            },
            return() {
                return {
                    get value() {
                        throw thrownError;
                    },
                    done: false
                };
            }
        };
    }
};
async function* asyncg() {
    yield* obj;
}
var iter = asyncg();
iter.next().then(function (result) {
    iter.return().then(function (result) {
        throw new Test262Error('Promise should be rejected, got: ' + result.value);
    }, function (err) {
        assert.sameValue(err, thrownError, 'Promise should be rejected with thrown error');
        iter.next().then(({done, value}) => {
            assert.sameValue(done, true, 'the iterator is completed');
            assert.sameValue(value, undefined, 'value is undefined');
        }).then($DONE, $DONE);
    }).catch($DONE);
}).catch($DONE);