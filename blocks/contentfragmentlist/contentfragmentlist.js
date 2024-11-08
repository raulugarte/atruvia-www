export default async function decorate(block) {
    const isUE = isUniversalEditorActive();

    const persistedQuery = isUE ? useAuthorQuery(block.textContent) : block.textContent;
    const categories = await getCategories(persistedQuery, isUE);

    const root = document.createElement('div');
    root.setAttribute("class", "category-list");

    categories.forEach((category) => {
        const elem = document.createElement('div');
        elem.setAttribute("class", "category-item");
        elem.setAttribute("itemscope", "");
        elem.setAttribute("itemid", `urn:aemconnection:${category._path}/jcr:content/data/master`);
        elem.setAttribute("itemtype", "reference");
        elem.innerHTML = `
            <div class="category-item-image">
                <picture>
                    <source type="image/webp" srcset="${category.image.deliveryUrl}?preferwebp=true" media="(min-width: 600px)">
                    <source type="image/webp" srcset="${category.image.deliveryUrl}?preferwebp=true&width=750">
                    <source type="${category.image.mimeType}" srcset="${category.image.deliveryUrl}" media="(min-width: 600px)">
                    <img src="${category.image.url}" width="${category.image.width}" height="${category.image.height}" alt="${category.title}" type="${category.image.mimeType}" itemprop="primaryImage" itemtype="image" loading="lazy">
                </picture>
            </div>
            <div class="category-item-content">
                <h2 class="category-item-title" itemprop="title" itemtype="text">${category.title}</h2>
                <p class="category-item-desc" itemprop="description" itemtype="richtext">${category.description}</p>
                <div>
                    <a href="#" title="${category.cta.text}" class="button primary">${category.cta.text}</a>
                </div>
            </div>`;
        root.appendChild(elem);
    });
    block.textContent = "";
    block.append(root);
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Category
 * @property {string} _path - Path to the category content fragment.
 * @property {string} title - Title of the category.
 * @property {string} description - Description of the category.
 * @property {string} ctaText - Call to action text.
 * @property {string} ctaLink - Call to action link.
 * @property {URL} image - Image for the category.
 */

/**
 * @async
 * @param {string} persistedQuery
 * @return {Promise<Category[]>} results 
 */
async function getCategories(persistedQuery, isUE) {
    const url = addCacheKiller(persistedQuery);

    try {
        const response = await fetch(url);
        const json = await response.json();

        // Log the entire JSON response to inspect its structure
        console.log('JSON response:', JSON.stringify(json, null, 2));

        // Correct the path to items based on the actual JSON structure
        const items = json?.data?.angebotSparenByPath?.item;

        // Ensure items is an array before calling map
        if (!Array.isArray(items)) {
            console.error('Expected items to be an array, but got:', items);
            //throw new TypeError('Expected items to be an array');
        }

        return items.map((item) => {
            const imageUrl = getImageUrl(item.bild, isUE);
            return {
                _path: item._path,
                title: item.headline,
                description: item.detail?.plaintext || '',
                cta: { 
                    text: item.callToAction || ''
                },
                image: {
                    url: imageUrl,
                    deliveryUrl: getImageUrl(item.heroImage, false),
                    width: item.heroImage?.width || 0,
                    height: item.heroImage?.height || 0,
                    mimeType: item.heroImage?.mimeType || ''
                },
            };
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Detects whether the site is embedded in the universal editor by counting parent frames
 * @returns {boolean}
 */
function isUniversalEditorActive() {
    return window.location.ancestorOrigins?.length > 0;
}

/**
 * Update the persisted query url to use the authoring endpoint
 * @param {string} persistedQuery 
 * @returns {string}
 */
function useAuthorQuery(persistedQuery) {
    return persistedQuery.replace("//publish-", "//author-");
}

/**
 * Updates url to contain a query parameter to prevent caching
 * @param {string} url 
 * @returns url with cache killer query parameter
 */
function addCacheKiller(url) {
    let newUrl = new URL(url);
    let params = newUrl.searchParams;
    params.append("ck", Date.now());
    return newUrl.toString();
}

function getImageUrl(image, isUE) {
    if (isUE) { 
        return image["_authorUrl"];
    }
    const url = new URL(image["_publishUrl"]);
    return `https://${url.hostname}${image["_dynamicUrl"]}`;
}
