import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ParcelPackagingComponent extends Component {
    @service deliveryOptions;

    get category() {
        return this.deliveryOptions.catalogue?.categories.find((category) => category.code === this.args.meta?.parcel?.category);
    }

    get packagingTypes() {
        return this.deliveryOptions.catalogue?.packaging_types.filter((type) => this.category?.packaging_types.includes(type.value)) ?? [];
    }

    @action load() {
        if (!this.deliveryOptions.load.isRunning) this.deliveryOptions.load.perform();
    }

    @action setCategory(code) {
        const category = this.deliveryOptions.catalogue.categories.find((item) => item.code === code);
        const packaging = this.args.meta?.parcel?.packaging_type;
        this.args.onChange({
            ...this.args.meta,
            parcel: {
                category: code,
                packaging_type: category?.packaging_types.includes(packaging) ? packaging : null,
                guide_revision: this.deliveryOptions.catalogue.revision,
            },
        });
    }

    @action setPackaging(packaging) {
        this.args.onChange({ ...this.args.meta, parcel: { ...this.args.meta?.parcel, packaging_type: packaging } });
    }
}
