define([
    'qlik',
    'text!./template.html',
    './properties',
    'css!./index.css',
], function (qlik, template, properties) {
    function getQlikObjectContainerId(layout, index) {
        return `${layout.qInfo.qId}_QV_${index}`;
    }

    function setFullscreen(containerId) {
        $('.tile').toggleClass('hide');

        $(`#${containerId}`).toggleClass('hide').toggleClass('fullscreen');
    }

    function exitFullscreen() {
        $('.hide').toggleClass('hide');
        $('.fullscreen').toggleClass('fullscreen');
    }

    function placeQlikObject(containerId, qlikObjectId) {
        qlik.currApp()
            .getObject(containerId, qlikObjectId)
            .then((model) => {
                console.log(
                    `Placing Qlik object (${qlikObjectId}) into container (${containerId})`
                );

                const fullscreenButton = $(`
                    <div class="fullscreen-button">
                        <img src="https://qlik.advana.data.mil/extensions/ContainerToggles/fullscreen-icon.png" />
                    </div>
                    `);

                const exitFullscreenButton = $(`
                    <div class="fullscreen-button">
                        <img src="https://qlik.advana.data.mil/extensions/ContainerToggles/exit-fullscreen-icon.png" />
                    </div>
                `);

                exitFullscreenButton.css('width', '30px');
                exitFullscreenButton.css('height', '30px');
                exitFullscreenButton.toggleClass('hide-button');

                fullscreenButton.click(() => {
                    exitFullscreenButton.toggleClass('hide-button');
                    fullscreenButton.toggleClass('hide-button');
                    setFullscreen(containerId);
                });

                exitFullscreenButton.click(() => {
                    exitFullscreenButton.toggleClass('hide-button');
                    fullscreenButton.toggleClass('hide-button');
                    exitFullscreen();
                });

                $(`#${containerId}`).append(fullscreenButton);
                $(`#${containerId}`).append(exitFullscreenButton);
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
                $scope.masterItems = $scope.layout.masterItems.filter(
                    (masterItem) => !masterItem.isHiddenInitially
                );

                $scope.masterItemToggles = $scope.layout.masterItems.map(
                    (masterItem, index) => ({
                        id: index,
                        title: masterItem.masterItemTitle || 'Title',
                        isShowing:
                            typeof masterItem.isHiddenInitially !== 'undefined'
                                ? !masterItem.isHiddenInitially
                                : true,
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
