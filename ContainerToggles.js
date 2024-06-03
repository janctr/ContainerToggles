define([
    'qlik',
    'text!./template.html',
    './properties',
    'css!./index.css',
], function (qlik, template, properties) {
    function getQlikObjectContainerId(layout, index) {
        return `${layout.qInfo.qId}_QV_${index}`;
    }

    function placeQlikObject(containerId, qlikObjectId) {
        qlik.currApp()
            .getObject(containerId, qlikObjectId)
            .then((model) => {
                console.log(
                    `Placing Qlik object (${qlikObjectId}) into container (${containerId})`
                );
            });
    }

    function render(layout) {
        for (const [index, masterItem] of layout.masterItems.entries()) {
            const { masterObjectId } = masterItem;

            placeQlikObject(
                getQlikObjectContainerId(layout, index),
                masterObjectId
            );
        }
    }

    return {
        definition: properties,
        template: template,
        support: {
            snapshot: true,
            export: true,
            exportData: false,
        },
        paint: function ($element, layout) {
            console.log('ContainerToggles layout: ', layout);
            return qlik.Promise.resolve();
        },
        controller: [
            '$scope',
            function ($scope) {
                //add your rendering code here
                $scope.masterItems = $scope.layout.masterItems;
                $scope.masterItemToggles = $scope.layout.masterItems.map(
                    (masterItem, index) => ({
                        id: index,
                        title: masterItem.masterItemTitle || 'Title',
                        isHidden: true,
                    })
                );

                $scope.toggleCheckbox = function (index) {
                    console.log(
                        '$scope.masterItemToggles: ',
                        $scope.masterItemToggles
                    );

                    const isToggled = $scope.masterItemToggles.find(
                        (toggle) => toggle.id === index
                    );
                };

                $scope.getQlikObjectContainerId = function (id) {
                    return getQlikObjectContainerId($scope.layout, id);
                };

                $(document).ready(() => {
                    render($scope.layout);
                });

                $scope.component.model.Validated.bind(function () {
                    $scope.masterItems = $scope.layout.masterItems;
                    render($scope.layout);
                    console.info('Validated');
                });
            },
        ],
    };
});
