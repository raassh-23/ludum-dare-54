/**
 * @type {Map<string, IWorldInstance>}
 */
const instanceCache = new Map();

/**
 * 
 * @param {IObjectClass} objects 
 * @param {string} id 
 * @returns {IWorldInstance}
 */
export function findInstanceById(objects, id) {
    const key = `${objects.name} ${id}`;

    if (!instanceCache.has(key)) {
        /** @type {IWorldInstance} */
        const instance = objects.getAllInstances().find(
            (i) => i.instVars.id === id
        );

        if (!instance) {
            return null;
        }

        instanceCache.set(key, instance);
        instance.addEventListener("destroy", () => {
            instanceCache.delete(key);
        })
    }

    return instanceCache.get(key);
}