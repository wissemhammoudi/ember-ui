import formatCurrency from 'dummy/utils/format-currency';
import { module, test } from 'qunit';

module('Unit | Utility | format-currency', function () {
    test('it formats USD by default', function (assert) {
        let result = formatCurrency(10000);
        assert.strictEqual(result, '$100.00');
    });

    test('it uses each currency precision for stored minor units', function (assert) {
        assert.strictEqual(formatCurrency(125000, 'TND'), 'د.ت125.000');
        assert.strictEqual(formatCurrency(1, 'TND'), 'د.ت0.001');
        assert.strictEqual(formatCurrency(125000, 'KWD'), 'K.D.125.000');
        assert.strictEqual(formatCurrency(12500, 'JPY'), '¥12,500');
    });

    test('it formats KUDOS', function (assert) {
        let result = formatCurrency(500, 'KUDOS');
        assert.strictEqual(result, 'KUDOS 5.00');
    });

    test('it does not throw for unknown long currency codes', function (assert) {
        let result = formatCurrency(500, 'DEMOX');
        assert.strictEqual(result, 'DEMOX 5.00');
    });
});
