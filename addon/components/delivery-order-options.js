import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DeliveryOrderOptionsComponent extends Component {
    @service deliveryOptions;

    get purpose() {
        return this.args.meta?.delivery?.purpose ?? 'transportation';
    }

    get serviceLevel() {
        return this.args.meta?.delivery?.service_level ?? 'standard';
    }

    get openingAllowed() {
        return this.args.meta?.delivery?.opening_allowed === true;
    }

    @action setOpening(event) {
        this.setValue('opening_allowed', event.target.checked);
    }

    @action load() {
        if (this.args.initializeDefaults && !this.args.meta?.delivery) this.setValue('purpose', 'transportation');
        if (!this.deliveryOptions.load.isRunning) this.deliveryOptions.load.perform();
    }

    @action setValue(field, value) {
        const delivery = {
            purpose: this.purpose,
            service_level: this.serviceLevel,
            opening_allowed: this.openingAllowed,
            ...this.args.meta?.delivery,
            [field]: value,
        };
        if (delivery.purpose !== 'return') {
            delete delivery.original_order_uuid;
            delete delivery.return_reason;
        }
        this.args.onChange({ ...this.args.meta, delivery });
    }

    @action setReason(event) {
        this.setValue('return_reason', event.target.value);
    }
}
