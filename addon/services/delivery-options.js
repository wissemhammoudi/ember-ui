import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DeliveryOptionsService extends Service {
    @service fetch;
    @service notifications;
    @tracked catalogue;
    @tracked error;
    namespace = 'int/v1';

    isValidParcel(meta, required = false) {
        const parcel = meta?.parcel;
        if (!parcel) return !required;
        const category = this.catalogue?.categories.find((item) => item.code === parcel.category);
        return Boolean(category && category.packaging_types.includes(parcel.packaging_type) && parcel.guide_revision === this.catalogue.revision);
    }

    isValidEntity(entity, required = false) {
        if (!this.isValidParcel(entity?.meta, required)) return false;
        if (!required) return true;
        return Boolean(
            entity?.name?.trim() &&
            entity.name.length <= 255 &&
            (entity.quantity == null || (Number.isInteger(Number(entity.quantity)) && Number(entity.quantity) >= 1)) &&
            ['weight', 'length', 'width', 'height', 'declared_value'].every(
                (field) => entity[field] == null || entity[field] === '' || (Number.isFinite(Number(entity[field])) && Number(entity[field]) >= 0)
            )
        );
    }

    isValidCod(amount, currency = 'TND', method = 'cash') {
        if (amount == null || amount === '') return !currency && !method;
        if (!/^\d+(\.\d{1,3})?$/.test(String(amount)) || method !== 'cash' || !/^[A-Z]{3}$/.test(currency)) return false;
        const precision = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
        const [whole, fraction = ''] = String(amount).split('.');
        if (fraction.length > precision) return false;
        const minor = `${whole}${fraction.padEnd(precision, '0')}`.replace(/^0+/, '') || '0';
        return minor !== '0' && (minor.length < 10 || (minor.length === 10 && minor <= '2147483647'));
    }

    @task *load() {
        if (this.catalogue) return this.catalogue;
        this.error = null;
        try {
            this.catalogue = yield this.fetch.get('delivery-options', {}, { namespace: this.namespace });
            return this.catalogue;
        } catch (error) {
            this.error = 'Packaging guidance could not be loaded. Please try again.';
            this.notifications.serverError(error);
        }
    }
}
