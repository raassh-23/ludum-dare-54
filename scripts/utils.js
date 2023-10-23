const instanceCache = new Map();
export function findInstanceById(objects, id) {
    const key = `${objects.name} ${id}`;
    if (!instanceCache.has(key)) {
        const instance = objects.getAllInstances().find((i) => i.instVars.id === id);
        if (!instance) {
            return null;
        }
        instanceCache.set(key, instance);
        instance.addEventListener("destroy", () => {
            instanceCache.delete(key);
        });
    }
    return instanceCache.get(key);
}
