import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import numbersOnly from '../utils/numbers-only';
import getCurrency from '../utils/get-currency';
import AutoNumeric from 'autonumeric';

export default class MoneyInputComponent extends Component {
    @service fetch;
    @service currentUser;
    @tracked currencies = getCurrency();
    @tracked currency;
    @tracked currencyData;
    @tracked autonumeric;

    constructor() {
        super(...arguments);

        let whois = this.currentUser.getOption('whois');

        this.currency = this.args.currency ?? whois?.currency?.code ?? 'USD';
        this.currencyData = getCurrency(this.currency);
    }

    @action autoNumerize(element) {
        const { onCurrencyChange } = this.args;
        let currency = this.currencyData;
        let value = numbersOnly(this.args.value ?? 0);

        let amount = value / 10 ** currency.precision;

        this.autonumeric = new AutoNumeric(element, amount, this.getCurrencyFormatOptions(currency));

        // default the currency from currency data
        if (typeof onCurrencyChange === 'function') {
            onCurrencyChange(currency.code, currency);
        }

        // Use rawValueModified for better change detection
        element.addEventListener('autoNumeric:rawValueModified', ({ detail }) => {
            if (typeof this.args.onChange === 'function') {
                let rawValue = detail.newRawValue;
                let storedValue = Math.round(rawValue * 10 ** this.currencyData.precision);
                this.args.onChange(storedValue, detail);
            }
        });
    }

    @action setCurrency(currency) {
        const { onCurrencyChange } = this.args;
        const currencyChanged = this.currency !== currency.code;

        this.currency = currency.code;
        this.currencyData = currency;
        if (this.autonumeric) {
            let value = this.autonumeric.getNumber();
            this.autonumeric.update(this.getCurrencyFormatOptions(currency));
            // Re-set the value to ensure it's formatted correctly with new currency
            this.autonumeric.set(value);
            if (currencyChanged && typeof this.args.onChange === 'function') {
                const storedValue = Math.round(this.autonumeric.getNumber() * 10 ** currency.precision);
                if (storedValue !== Number(numbersOnly(this.args.value ?? 0))) {
                    this.args.onChange(storedValue);
                }
            }
        }

        if (typeof onCurrencyChange === 'function') {
            onCurrencyChange(currency.code, currency);
        }
    }

    @action getCurrencyFormatOptions(currency) {
        let options = {
            currencySymbol: isNone(currency.symbol) ? '$' : currency.symbol,
            currencySymbolPlacement: currency.symbolPlacement === 'before' ? 'p' : 's',
            decimalCharacter: isNone(currency.decimalSeperator) ? '.' : currency.decimalSeparator,
            decimalPlaces: isNone(currency.precision) ? 2 : currency.precision,
            digitGroupSeparator: isNone(currency.thousandSeparator) ? ',' : currency.thousandSeparator,
        };

        // decimal and thousand seperator cannot be the same, if they are revert the thousand seperator
        if (options.decimalCharacter === options.digitGroupSeparator) {
            options.digitGroupSeparator = ',';
        }

        return options;
    }

    @action handleCurrencyChanges(el, [currency]) {
        this.setCurrency(getCurrency(currency));
    }

    @action updateValue() {
        const value = Number(numbersOnly(this.args.value ?? 0));
        if (this.autonumeric && Math.round(this.autonumeric.getNumber() * 10 ** this.currencyData.precision) !== value) {
            this.autonumeric.set(value / 10 ** this.currencyData.precision);
        }
    }

    @action removeAutoNumeric() {
        this.autonumeric?.remove();
    }
}
