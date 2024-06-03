define(['qlik'], function (qlik) {
    return {
        placeMasterObject: function (layout, containerId) {
            console.log('placeMasterObject called: ', layout, containerId);
            if (!layout?.masterObjectId) return;

            qlik.currApp()
                .getObject(containerId, layout.masterObjectId)
                .then(
                    function (model) {
                        console.log('displayed object');
                        // scope.initialDisplay = false;
                    },
                    function (error) {
                        //console.log(error);
                    }
                );
        },

        getMasterObjects: function () {
            return new Promise(function (resolve, reject) {
                const app = qlik.currApp();
                app.getList('masterobject').then(function (model) {
                    app.destroySessionObject(model.layout.qInfo.qId);

                    if (!model.layout.qAppObjectList.qItems) {
                        return resolve({ value: '', label: 'No master items' });
                    }

                    const masterOpts = model.layout.qAppObjectList.qItems.map(
                        ({ qInfo: { qId }, qMeta: { title } }) => ({
                            label: title,
                            value: qId,
                        })
                    );

                    console.log('masterOpts: ', masterOpts);
                    return resolve([
                        { value: '', label: 'Choose master item' },
                        ...masterOpts,
                    ]);
                });
            });
        },
    };
});
