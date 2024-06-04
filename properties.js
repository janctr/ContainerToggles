define(['qlik', './utils'], function (qlik, Util) {
    const { placeMasterObject, getMasterObjects } = Util;

    const masterItems = {
        type: 'array',
        translation: 'Master Items',
        ref: 'masterItems',
        min: 1,
        allowAdd: true,
        allowRemove: true,
        allowMove: true,
        addTranslation: 'Add Master Item',
        grouped: true,
        itemTitleRef: 'masterItemTitle',
        items: {
            masterObjectName: {
                type: 'string',
                label: 'Master Item Title',
                ref: 'masterItemTitle',
                defaultValue: '',
                expression: 'optional',
            },
            masterObject: {
                type: 'string',
                component: 'dropdown',
                label: 'Master object to display',
                ref: 'masterObjectId',
                defaultValue: '',
                options: getMasterObjects(),
            },
        },
    };
    return {
        type: 'items',
        component: 'accordion',
        items: {
            masterItems,
            appearance: {
                uses: 'settings',
            },
        },
    };
});
