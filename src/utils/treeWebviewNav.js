/** Helpers for mobile WebView family-tree routes (`?view=app&token=...`). */

export const getTreeWebviewContext = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const webviewIdx = pathParts.indexOf('webview');
    const spaceId = webviewIdx >= 0
        ? pathParts[webviewIdx + 1]
        : (localStorage.getItem('currentFamilySpaceId')
            || localStorage.getItem('selected_family_id')
            || null);
    const token = urlParams.get('token') || localStorage.getItem('token');
    const isAppView = urlParams.get('view') === 'app' || webviewIdx >= 0;
    const appQuery = token
        ? `view=app&token=${encodeURIComponent(token)}`
        : 'view=app';

    return { isAppView, spaceId, token, appQuery };
};

export const treeWebviewHomePath = (spaceId, token) => {
    const q = token
        ? `?view=app&token=${encodeURIComponent(token)}`
        : '?view=app';
    return `/family-tree/webview/${spaceId}${q}`;
};

export const treeWebviewFormPath = (spaceId, formSlug, token) => {
    const q = token
        ? `?view=app&token=${encodeURIComponent(token)}`
        : '?view=app';
    return `/family-tree/webview/${spaceId}/${formSlug}${q}`;
};

export const navigateAfterTreeFormSave = (navigate, spaceId, token) => {
    if (spaceId) {
        navigate(treeWebviewHomePath(spaceId, token));
        return;
    }
    navigate('/owner/family-tree');
};
