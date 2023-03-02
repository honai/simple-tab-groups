(function() {
    'use strict';

    window.addonUrlPrefix = browser.runtime.getURL('');
    window.manifest = browser.runtime.getManifest();
    window.noop = function() {};
    window.openPopup = async function(page, asWindow = true) {
        let url = browser.runtime.getURL(`/help/${page}.html`);

        if (asWindow) {
            return browser.windows.create({
                focused: true,
                type: browser.windows.CreateType.POPUP,
                state:  browser.windows.WindowState.MAXIMIZED,
                url,
            }).catch(noop);
        }

        return browser.tabs.create({
            url,
            active: true,
        }).catch(noop);
    };

    const isBackgroundPage = window.location.pathname.includes('background');

    if (!isBackgroundPage) {
        const background = browser.extension.getBackgroundPage();

        if (background === null) {
            // current tab was opened not in default cookie container, reopen this tab
            browser.tabs.getCurrent()
                .then(async function(currentTab) {
                    if (DEFAULT_COOKIE_STORE_ID === currentTab.cookieStoreId) {
                        browser.runtime.onMessage.addListener(({action}) => 'i-am-back' === action && window.location.reload());
                    } else {
                        await browser.tabs.create({
                            url:  currentTab.url,
                            active: currentTab.active,
                            index: currentTab.index,
                            windowId: currentTab.windowId,
                        });

                        return browser.tabs.remove(currentTab.id);
                    }
                })
                .catch(noop);

            return;
        }

        window.BG = background.BG;

        Object.assign(window.console, background.console);
        // window.console = background.console;
        window.cache = background.cache;
        window.Containers = background.Containers;
    }

})();
