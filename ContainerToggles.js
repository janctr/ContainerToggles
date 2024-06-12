define([
    'qlik',
    'text!./template.html',
    './properties',
    'css!./index.css',
], function (qlik, template, properties) {
    function openModal(qlikObjectId) {
        const modal = $(`
                <div id="container-toggles-modal" class="container-toggles-modal">
                    <h1>My Modal</h1>
                    <p>${qlikObjectId}</p>
                </div>

        `);

        const closeModalButton = $(`
            <div class="close-modal-button">
                <img src="${getExitFullscreenIconUrl()}" />
            </div>
        `).click(() => {
            closeModal();
        });

        $('body').append(modal);

        qlik.currApp()
            .getObject('container-toggles-modal', qlikObjectId)
            .then((model) => {
                $('#container-toggles-modal').append(closeModalButton);
            });
    }

    function closeModal() {
        $('.container-toggles-modal').remove();
    }

    function getQlikObjectContainerId(layout, index) {
        return `${layout.qInfo.qId}_QV_${index}`;
    }

    function getFullScreenIconUrl() {
        if (window.location.href.indexOf('.smil.mil') > 0) {
            return 'https://qlik.advana.data.smil.mil/extensions/ContainerToggles/fullscreen-icon.png';
        }

        return 'https://qlik.advana.data.mil/extensions/ContainerToggles/fullscreen-icon.png';
    }

    function getExitFullscreenIconUrl() {
        if (window.location.href.indexOf('.smil.mil') > 0) {
            return 'https://qlik.advana.data.smil.mil/extensions/ContainerToggles/exit-fullscreen-icon.png';
        }

        return 'https://qlik.advana.data.mil/extensions/ContainerToggles/exit-fullscreen-icon.png';
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
                        <img src="${getFullScreenIconUrl()}" />
                    </div>
                `);
                fullscreenButton.click(() => {
                    openModal(qlikObjectId);
                });

                $(`#${containerId}`).append(fullscreenButton);
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

                $scope.getContainerSize = function () {
                    const numVisibleTiles = $scope.masterItemToggles.filter(
                        (toggle) => toggle.isShowing
                    ).length;

                    const styles = {};

                    if (numVisibleTiles % 4 === 0) {
                        styles.flex = '25%';
                    } else if (numVisibleTiles % 3 === 0) {
                        styles.flex = '33%';
                    }

                    if (numVisibleTiles === 4) {
                        styles.flex = '50%';
                        styles.height = '50%';
                    } else if (numVisibleTiles < 4) {
                        styles.height = '100%';
                    }

                    return styles;
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
