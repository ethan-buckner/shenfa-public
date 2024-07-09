import { getAllFormBundles, getAllTemplates } from '$lib/mongo.js';

/** @typedef{import('$lib/types').Template} Template*/
/** @typedef{import('$lib/types').FormBundle} FormBundle*/

/**
 * @typedef {Object} BundlesProps
 * @property {FormBundle[]} bundles - An array of form bundles
 * @property {Template[]} templates - An array of templates
 */

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    /** @type {BundlesProps} */
    let props = {
        bundles: [],
        templates: []
    };
    try {
        props.bundles = await getAllFormBundles();
        // console.log("Successfully retrieved form bundles from MongoDB");
        // console.log("Bundle IDs:", props.bundles.map(b => b.id));
        props.templates = await getAllTemplates();
        // console.log("Successfully retrieved templates from MongoDB");
        // console.log("Template IDs:", props.templates.map(t => t.id));
    } catch (error) {
        console.log("Error occurred while loading bundles or templates", error);
    } finally {
        return { props };
    }
};