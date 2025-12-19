(function () {
    try {
        if (!('permissions' in navigator) || typeof navigator.permissions.query !== 'function') return;
        const originalQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = function (descriptor) {
            try {
                if (descriptor && descriptor.name === 'push') {
                    if (typeof descriptor.userVisibleOnly === 'undefined' || descriptor.userVisibleOnly === false) {
                        descriptor = Object.assign({}, descriptor, { userVisibleOnly: true });
                    }
                }
            } catch (err) {
                // swallow - don't break third-party SDKs
            }
            return originalQuery(descriptor);
        };
    } catch (err) {
        // defensive noop
    }
})();